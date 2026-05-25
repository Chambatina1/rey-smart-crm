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
    const status = searchParams.get('status') || ''
    const bureau = searchParams.get('bureau') || ''
    const clientId = searchParams.get('clientId') || ''
    const disputeType = searchParams.get('disputeType') || ''

    const where: Prisma.DisputeWhereInput = {}

    if (status) where.status = status
    if (bureau) where.bureau = bureau
    if (clientId) where.clientId = clientId
    if (disputeType) where.disputeType = disputeType

    // Non-admin users see only their disputes
    if (auth.role === 'client') {
      const client = await db.client.findUnique({ where: { userId: auth.userId } })
      if (client) where.clientId = client.id
    }

    const [disputes, total] = await Promise.all([
      db.dispute.findMany({
        where,
        include: {
          client: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          tradeLine: {
            select: {
              id: true,
              accountName: true,
              accountType: true,
              balance: true,
            },
          },
          _count: {
            select: { responses: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dispute.count({ where }),
    ])

    return jsonResponse({
      disputes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List disputes error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { clientId, tradeLineId, bureau, disputeType, disputeReason, letterContent } = body

    if (!clientId || !bureau || !disputeType) {
      return errorResponse('ClientId, bureau, and dispute type are required')
    }

    const dispute = await db.dispute.create({
      data: {
        clientId,
        tradeLineId: tradeLineId || null,
        bureau,
        disputeType,
        disputeReason: disputeReason || null,
        letterContent: letterContent || null,
        status: 'draft',
      },
      include: {
        client: {
          include: {
            user: { select: { name: true } },
          },
        },
        tradeLine: true,
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'dispute_created',
        description: `Created ${disputeType} dispute for ${bureau}`,
        metadata: JSON.stringify({ disputeId: dispute.id }),
      },
    })

    return jsonResponse(dispute, 201)
  } catch (error) {
    console.error('Create dispute error:', error)
    return errorResponse('Internal server error', 500)
  }
}
