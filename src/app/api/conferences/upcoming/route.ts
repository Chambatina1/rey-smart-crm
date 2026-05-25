import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const now = new Date()

    const conferences = await db.conference.findMany({
      where: {
        date: { gte: now },
        isPublished: true,
      },
      include: {
        course: {
          select: { id: true, titleEn: true, titleEs: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { date: 'asc' },
      take: 20,
    })

    // Check if user is registered for each conference
    const conferencesWithRegistration = await Promise.all(
      conferences.map(async (conf) => {
        const registration = await db.conferenceRegistration.findUnique({
          where: {
            userId_conferenceId: {
              userId: auth.userId,
              conferenceId: conf.id,
            },
          },
        })
        return {
          ...conf,
          isRegistered: !!registration,
          registrationStatus: registration?.status || null,
        }
      })
    )

    return jsonResponse(conferencesWithRegistration)
  } catch (error) {
    console.error('Get upcoming conferences error:', error)
    return errorResponse('Internal server error', 500)
  }
}
