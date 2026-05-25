import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params

    const responses = await db.disputeResponse.findMany({
      where: { disputeId: id },
      orderBy: { receivedDate: 'desc' },
    })

    return jsonResponse(responses)
  } catch (error) {
    console.error('Get dispute responses error:', error)
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

    const { id: disputeId } = await params
    const body = await request.json()
    const { responseCode, outcome, notes, documentUrl } = body

    const dispute = await db.dispute.findUnique({ where: { id: disputeId } })
    if (!dispute) {
      return errorResponse('Dispute not found', 404)
    }

    const response = await db.disputeResponse.create({
      data: {
        disputeId,
        responseCode: responseCode || null,
        outcome: outcome || null,
        notes: notes || null,
        documentUrl: documentUrl || null,
      },
    })

    // Update dispute based on outcome
    if (outcome) {
      await db.dispute.update({
        where: { id: disputeId },
        data: {
          responseStatus: outcome,
          responseDate: new Date(),
          status: outcome === 'deleted' ? 'completed' : 'in_progress',
        },
      })
    }

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'dispute_response',
        description: `Recorded response for dispute ${disputeId}: ${outcome || 'no outcome'}`,
        metadata: JSON.stringify({ disputeId, responseId: response.id }),
      },
    })

    return jsonResponse(response, 201)
  } catch (error) {
    console.error('Create dispute response error:', error)
    return errorResponse('Internal server error', 500)
  }
}
