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
    const folder = searchParams.get('folder') || 'inbox' // inbox, sent

    const where: Prisma.MessageWhereInput = {}

    if (folder === 'inbox') {
      where.receiverId = auth.userId
    } else if (folder === 'sent') {
      where.senderId = auth.userId
    }

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
          receiver: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.message.count({ where }),
    ])

    return jsonResponse({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List messages error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { receiverId, subject, content } = body

    if (!receiverId || !content) {
      return errorResponse('receiverId and content are required')
    }

    const receiver = await db.user.findUnique({ where: { id: receiverId } })
    if (!receiver) {
      return errorResponse('Receiver not found', 404)
    }

    const message = await db.message.create({
      data: {
        senderId: auth.userId,
        receiverId,
        subject: subject || null,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        message: `${auth.role === 'admin' ? 'Agent' : 'Client'} sent you a message${subject ? `: ${subject}` : ''}`,
        type: 'info',
      },
    })

    return jsonResponse(message, 201)
  } catch (error) {
    console.error('Send message error:', error)
    return errorResponse('Internal server error', 500)
  }
}
