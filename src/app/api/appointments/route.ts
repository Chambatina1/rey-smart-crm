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
    const type = searchParams.get('type') || ''

    const where: Prisma.AppointmentWhereInput = {}

    if (status) where.status = status
    if (type) where.type = type

    // Clients see only their appointments; agents see their own
    if (auth.role === 'client') {
      where.clientId = auth.userId
    } else if (auth.role === 'agent') {
      where.OR = [
        { clientId: auth.userId },
        { agentId: auth.userId },
      ]
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          clientUser: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          agent: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
        },
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ])

    return jsonResponse({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List appointments error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { clientId, agentId, title, description, date, duration, type, meetingLink, notes } = body

    if (!clientId || !agentId || !title || !date) {
      return errorResponse('clientId, agentId, title, and date are required')
    }

    const appointment = await db.appointment.create({
      data: {
        clientId,
        agentId,
        title,
        description: description || null,
        date: new Date(date),
        duration: duration || 60,
        type: type || 'consultation',
        meetingLink: meetingLink || null,
        notes: notes || null,
      },
      include: {
        clientUser: {
          select: { id: true, name: true, email: true },
        },
        agent: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'appointment_created',
        description: `Scheduled appointment: ${title}`,
        metadata: JSON.stringify({ appointmentId: appointment.id }),
      },
    })

    return jsonResponse(appointment, 201)
  } catch (error) {
    console.error('Create appointment error:', error)
    return errorResponse('Internal server error', 500)
  }
}
