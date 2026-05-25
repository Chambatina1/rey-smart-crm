import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate || !endDate) {
      return errorResponse('start and end date parameters are required')
    }

    const where: Prisma.AppointmentWhereInput = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }

    // Filter by user role
    if (auth.role === 'client') {
      where.clientId = auth.userId
    } else if (auth.role === 'agent') {
      where.OR = [
        { clientId: auth.userId },
        { agentId: auth.userId },
      ]
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        clientUser: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        agent: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Transform to calendar event format
    const events = appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      start: apt.date.toISOString(),
      end: new Date(apt.date.getTime() + (apt.duration || 60) * 60000).toISOString(),
      duration: apt.duration,
      type: apt.type,
      status: apt.status,
      description: apt.description,
      meetingLink: apt.meetingLink,
      client: apt.clientUser,
      agent: apt.agent,
    }))

    return jsonResponse(events)
  } catch (error) {
    console.error('Calendar error:', error)
    return errorResponse('Internal server error', 500)
  }
}
