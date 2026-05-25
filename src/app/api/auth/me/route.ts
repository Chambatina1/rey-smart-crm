import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return errorResponse('Unauthorized', 401)
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Get client profile if user is a client
    let client = null
    if (user.role === 'client') {
      client = await db.client.findUnique({
        where: { userId: user.id },
      })
    }

    return jsonResponse({ ...user, client })
  } catch (error) {
    console.error('Get me error:', error)
    return errorResponse('Internal server error', 500)
  }
}
