import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const bureau = searchParams.get('bureau') || ''

    const where: Prisma.DisputeWhereInput = { clientId: id }

    if (status) where.status = status
    if (bureau) where.bureau = bureau

    const disputes = await db.dispute.findMany({
      where,
      include: {
        tradeLine: {
          select: {
            id: true,
            accountName: true,
            accountType: true,
            balance: true,
          },
        },
        responses: {
          orderBy: { receivedDate: 'desc' },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return jsonResponse(disputes)
  } catch (error) {
    console.error('Get client disputes error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id: clientId } = await params
    const body = await request.json()
    const { tradeLineId, bureau, disputeType, disputeReason, letterContent } = body

    if (!bureau || !disputeType) {
      return errorResponse('Bureau and dispute type are required')
    }

    const client = await db.client.findUnique({ where: { id: clientId } })
    if (!client) {
      return errorResponse('Client not found', 404)
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
        tradeLine: true,
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'dispute_created',
        description: `Created ${disputeType} dispute for ${bureau}`,
        metadata: JSON.stringify({ disputeId: dispute.id, clientId }),
      },
    })

    return jsonResponse(dispute, 201)
  } catch (error) {
    console.error('Create dispute error:', error)
    return errorResponse('Internal server error', 500)
  }
}
