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

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        tradeLine: {
          include: {
            creditReport: true,
          },
        },
        responses: {
          orderBy: { receivedDate: 'desc' },
        },
      },
    })

    if (!dispute) {
      return errorResponse('Dispute not found', 404)
    }

    return jsonResponse(dispute)
  } catch (error) {
    console.error('Get dispute error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()

    const existing = await db.dispute.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Dispute not found', 404)
    }

    const { disputeType, disputeReason, status, letterContent, letterTemplate, responseStatus, notes, round } = body

    const dispute = await db.dispute.update({
      where: { id },
      data: {
        ...(disputeType && { disputeType }),
        ...(disputeReason !== undefined && { disputeReason }),
        ...(status && { status }),
        ...(letterContent !== undefined && { letterContent }),
        ...(letterTemplate !== undefined && { letterTemplate }),
        ...(responseStatus && { responseStatus }),
        ...(notes !== undefined && { notes }),
        ...(round !== undefined && { round }),
        ...(status === 'sent' && { sentDate: new Date() }),
        ...(responseStatus && { responseDate: new Date() }),
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
        action: 'dispute_updated',
        description: `Updated dispute ${id} status to ${status || 'no change'}`,
        metadata: JSON.stringify({ disputeId: id }),
      },
    })

    return jsonResponse(dispute)
  } catch (error) {
    console.error('Update dispute error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id } = await params

    const dispute = await db.dispute.findUnique({ where: { id } })
    if (!dispute) {
      return errorResponse('Dispute not found', 404)
    }

    await db.dispute.delete({ where: { id } })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'dispute_deleted',
        description: `Deleted dispute ${id}`,
      },
    })

    return jsonResponse({ message: 'Dispute deleted successfully' })
  } catch (error) {
    console.error('Delete dispute error:', error)
    return errorResponse('Internal server error', 500)
  }
}
