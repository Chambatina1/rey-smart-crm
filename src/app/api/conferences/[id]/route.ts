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

    const conference = await db.conference.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, titleEn: true, titleEs: true },
        },
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!conference) {
      return errorResponse('Conference not found', 404)
    }

    return jsonResponse(conference)
  } catch (error) {
    console.error('Get conference error:', error)
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

    const existing = await db.conference.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Conference not found', 404)
    }

    const { titleEn, titleEs, descriptionEn, descriptionEs, type, date, duration, maxAttendees, meetingLink, location, isPublished, isRecurring, recurrenceRule, courseId } = body

    const conference = await db.conference.update({
      where: { id },
      data: {
        ...(titleEn && { titleEn }),
        ...(titleEs && { titleEs }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionEs !== undefined && { descriptionEs }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(duration !== undefined && { duration }),
        ...(maxAttendees !== undefined && { maxAttendees }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(location !== undefined && { location }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurrenceRule !== undefined && { recurrenceRule: recurrenceRule ? JSON.stringify(recurrenceRule) : null }),
        ...(courseId !== undefined && { courseId }),
      },
    })

    return jsonResponse(conference)
  } catch (error) {
    console.error('Update conference error:', error)
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

    const conference = await db.conference.findUnique({ where: { id } })
    if (!conference) {
      return errorResponse('Conference not found', 404)
    }

    await db.conference.delete({ where: { id } })

    return jsonResponse({ message: 'Conference deleted successfully' })
  } catch (error) {
    console.error('Delete conference error:', error)
    return errorResponse('Internal server error', 500)
  }
}
