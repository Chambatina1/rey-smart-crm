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
    const type = searchParams.get('type') || ''
    const published = searchParams.get('published')

    const where: Prisma.ConferenceWhereInput = {}

    if (type) where.type = type
    if (published !== null && published !== undefined) {
      where.isPublished = published === 'true'
    }

    const [conferences, total] = await Promise.all([
      db.conference.findMany({
        where,
        include: {
          course: {
            select: { id: true, titleEn: true, titleEs: true },
          },
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.conference.count({ where }),
    ])

    return jsonResponse({
      conferences,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List conferences error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { titleEn, titleEs, descriptionEn, descriptionEs, type, date, duration, maxAttendees, meetingLink, location, isPublished, isRecurring, recurrenceRule, courseId } = body

    if (!titleEn || !titleEs || !date) {
      return errorResponse('titleEn, titleEs, and date are required')
    }

    const conference = await db.conference.create({
      data: {
        titleEn,
        titleEs,
        descriptionEn: descriptionEn || null,
        descriptionEs: descriptionEs || null,
        type: type || 'webinar',
        date: new Date(date),
        duration: duration || null,
        maxAttendees: maxAttendees || null,
        meetingLink: meetingLink || null,
        location: location || null,
        isPublished: isPublished || false,
        isRecurring: isRecurring || false,
        recurrenceRule: recurrenceRule ? JSON.stringify(recurrenceRule) : null,
        courseId: courseId || null,
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'conference_created',
        description: `Created conference: ${titleEn}`,
        metadata: JSON.stringify({ conferenceId: conference.id }),
      },
    })

    return jsonResponse(conference, 201)
  } catch (error) {
    console.error('Create conference error:', error)
    return errorResponse('Internal server error', 500)
  }
}
