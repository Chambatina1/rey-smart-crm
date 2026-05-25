import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const notifications = await db.notification.findMany({
      where: {
        userId: auth.userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return jsonResponse(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      // Mark all as read
      await db.notification.updateMany({
        where: {
          userId: auth.userId,
          isRead: false,
        },
        data: { isRead: true },
      })

      return jsonResponse({ message: 'All notifications marked as read' })
    }

    if (!notificationId) {
      return errorResponse('notificationId or markAll is required')
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return errorResponse('Notification not found', 404)
    }

    if (notification.userId !== auth.userId) {
      return errorResponse('Forbidden', 403)
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return jsonResponse(updated)
  } catch (error) {
    console.error('Update notification error:', error)
    return errorResponse('Internal server error', 500)
  }
}
