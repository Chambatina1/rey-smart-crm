import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        clientUser: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        agent: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    })

    if (!appointment) {
      return errorResponse('Appointment not found', 404)
    }

    return jsonResponse(appointment)
  } catch (error) {
    console.error('Get appointment error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()

    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Appointment not found', 404)
    }

    const { title, description, date, duration, type, status, meetingLink, notes } = body

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(duration !== undefined && { duration }),
        ...(type && { type }),
        ...(status && { status }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes }),
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

    return jsonResponse(appointment)
  } catch (error) {
    console.error('Update appointment error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params

    const appointment = await db.appointment.findUnique({ where: { id } })
    if (!appointment) {
      return errorResponse('Appointment not found', 404)
    }

    await db.appointment.delete({ where: { id } })

    return jsonResponse({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return errorResponse('Internal server error', 500)
  }
}
