import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('clientId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const where: Prisma.PaymentWhereInput = {}

    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (startDate || endDate) {
      where.paidAt = {}
      if (startDate) where.paidAt.gte = new Date(startDate)
      if (endDate) where.paidAt.lte = new Date(endDate)
    }

    // Clients see only their payments
    if (auth.role === 'client') {
      const client = await db.client.findUnique({ where: { userId: auth.userId } })
      if (client) where.clientId = client.id
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          invoice: {
            select: { id: true, amount: true, status: true },
          },
          client: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ])

    // Calculate totals
    const paymentSum = await db.payment.aggregate({
      _sum: { amount: true },
      where,
    })

    return jsonResponse({
      payments,
      summary: {
        totalPayments: total,
        totalAmount: paymentSum._sum.amount || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List payments error:', error)
    return errorResponse('Internal server error', 500)
  }
}
