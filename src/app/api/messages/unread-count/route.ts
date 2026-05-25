import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const count = await db.message.count({
      where: {
        receiverId: auth.userId,
        isRead: false,
      },
    })

    return jsonResponse({ count })
  } catch (error) {
    console.error('Unread count error:', error)
    return errorResponse('Internal server error', 500)
  }
}
