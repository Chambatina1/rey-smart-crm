import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()
    const { isRead } = body

    const message = await db.message.findUnique({ where: { id } })
    if (!message) {
      return errorResponse('Message not found', 404)
    }

    // Only receiver can mark as read
    if (message.receiverId !== auth.userId) {
      return errorResponse('Forbidden', 403)
    }

    const updated = await db.message.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? isRead : true,
        readAt: isRead !== false ? new Date() : null,
      },
    })

    return jsonResponse(updated)
  } catch (error) {
    console.error('Update message error:', error)
    return errorResponse('Internal server error', 500)
  }
}
