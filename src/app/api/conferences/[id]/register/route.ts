import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id: conferenceId } = await params

    const conference = await db.conference.findUnique({ where: { id: conferenceId } })
    if (!conference) {
      return errorResponse('Conference not found', 404)
    }

    // Check capacity
    if (conference.maxAttendees) {
      const registrationCount = await db.conferenceRegistration.count({
        where: { conferenceId, status: 'registered' },
      })
      if (registrationCount >= conference.maxAttendees) {
        return errorResponse('Conference is full', 400)
      }
    }

    // Check if already registered
    const existing = await db.conferenceRegistration.findUnique({
      where: {
        userId_conferenceId: {
          userId: auth.userId,
          conferenceId,
        },
      },
    })

    if (existing) {
      return errorResponse('Already registered for this conference', 409)
    }

    const registration = await db.conferenceRegistration.create({
      data: {
        userId: auth.userId,
        conferenceId,
        status: 'registered',
      },
      include: {
        conference: {
          select: { id: true, titleEn: true, titleEs: true, date: true },
        },
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'conference_registered',
        description: `Registered for conference: ${conference.titleEn}`,
        metadata: JSON.stringify({ conferenceId, registrationId: registration.id }),
      },
    })

    return jsonResponse(registration, 201)
  } catch (error) {
    console.error('Register conference error:', error)
    return errorResponse('Internal server error', 500)
  }
}
