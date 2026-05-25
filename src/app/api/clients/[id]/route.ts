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

    const client = await db.client.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, language: true },
        },
        creditReports: {
          include: {
            tradeLines: true,
          },
          orderBy: { pullDate: 'desc' },
        },
        disputes: {
          include: {
            tradeLine: true,
            responses: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        enrollments: {
          include: {
            course: {
              select: { id: true, titleEn: true, titleEs: true, thumbnail: true },
            },
          },
        },
        invoices: {
          include: {
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            disputes: true,
            documents: true,
            payments: true,
          },
        },
      },
    })

    if (!client) {
      return errorResponse('Client not found', 404)
    }

    // Non-admin can only view own profile
    if (auth.role === 'client' && client.userId !== auth.userId) {
      return errorResponse('Forbidden', 403)
    }

    return jsonResponse(client)
  } catch (error) {
    console.error('Get client error:', error)
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

    const existingClient = await db.client.findUnique({ where: { id } })
    if (!existingClient) {
      return errorResponse('Client not found', 404)
    }

    const { ssnLastFour, dateOfBirth, address, city, state, zipCode, creditScore, status, referredBy, notes, tags, name, phone } = body

    // Update user fields if provided
    if (name || phone) {
      await db.user.update({
        where: { id: existingClient.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      })
    }

    const client = await db.client.update({
      where: { id },
      data: {
        ...(ssnLastFour !== undefined && { ssnLastFour }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(creditScore !== undefined && { creditScore, creditScoreDate: new Date() }),
        ...(status && { status }),
        ...(referredBy !== undefined && { referredBy }),
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
        },
      },
    })

    return jsonResponse(client)
  } catch (error) {
    console.error('Update client error:', error)
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
    if (auth.role !== 'admin') return errorResponse('Only admins can delete clients', 403)

    const { id } = await params

    const client = await db.client.findUnique({ where: { id } })
    if (!client) {
      return errorResponse('Client not found', 404)
    }

    // Delete user (cascade will delete client)
    await db.user.delete({ where: { id: client.userId } })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'client_deleted',
        description: `Deleted client ${client.user?.name || id}`,
      },
    })

    return jsonResponse({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Delete client error:', error)
    return errorResponse('Internal server error', 500)
  }
}
