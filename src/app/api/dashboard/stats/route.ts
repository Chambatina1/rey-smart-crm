import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Run all aggregate queries in parallel
    const [
      totalClients,
      activeClients,
      totalDisputes,
      activeDisputes,
      completedDisputes,
      totalCourses,
      totalConferences,
      upcomingAppointments,
      unreadMessages,
      totalRevenue,
      monthlyRevenue,
      pendingInvoices,
      totalPayments,
    ] = await Promise.all([
      // Total clients
      db.client.count(),
      // Active clients
      db.client.count({ where: { status: 'active' } }),
      // Total disputes
      db.dispute.count(),
      // Active disputes (sent or in_progress)
      db.dispute.count({ where: { status: { in: ['sent', 'in_progress'] } } }),
      // Completed disputes
      db.dispute.count({ where: { status: 'completed' } }),
      // Total published courses
      db.course.count({ where: { isPublished: true } }),
      // Total conferences
      db.conference.count({ where: { isPublished: true } }),
      // Upcoming appointments
      db.appointment.count({
        where: { date: { gte: now }, status: { in: ['scheduled', 'confirmed'] } },
      }),
      // Unread messages
      db.message.count({ where: { receiverId: auth.userId, isRead: false } }),
      // Total revenue from completed payments
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      // Monthly revenue (last 30 days)
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed', paidAt: { gte: thirtyDaysAgo } },
      }),
      // Pending invoices
      db.invoice.count({ where: { status: 'pending' } }),
      // Total payments count
      db.payment.count({ where: { status: 'completed' } }),
    ])

    // Disputes by bureau
    const disputesByBureau = await db.dispute.groupBy({
      by: ['bureau'],
      _count: true,
    })

    // Disputes by status
    const disputesByStatus = await db.dispute.groupBy({
      by: ['status'],
      _count: true,
    })

    // Clients by status
    const clientsByStatus = await db.client.groupBy({
      by: ['status'],
      _count: true,
    })

    // Dispute outcomes
    const disputeOutcomes = await db.dispute.groupBy({
      by: ['responseStatus'],
      _count: true,
      where: { responseStatus: { not: null } },
    })

    return jsonResponse({
      clients: {
        total: totalClients,
        active: activeClients,
        byStatus: clientsByStatus.map((s) => ({ status: s.status, count: s._count })),
      },
      disputes: {
        total: totalDisputes,
        active: activeDisputes,
        completed: completedDisputes,
        byBureau: disputesByBureau.map((b) => ({ bureau: b.bureau, count: b._count })),
        byStatus: disputesByStatus.map((s) => ({ status: s.status, count: s._count })),
        outcomes: disputeOutcomes.map((o) => ({ outcome: o.responseStatus, count: o._count })),
      },
      education: {
        courses: totalCourses,
        conferences: totalConferences,
      },
      appointments: {
        upcoming: upcomingAppointments,
      },
      messages: {
        unread: unreadMessages,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: monthlyRevenue._sum.amount || 0,
        pendingInvoices,
        totalPayments,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}
