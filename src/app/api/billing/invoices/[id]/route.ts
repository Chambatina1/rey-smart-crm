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

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        client: {
          include: {
            user: { select: { name: true } },
          },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!invoice) {
      return errorResponse('Invoice not found', 404)
    }

    return jsonResponse(invoice)
  } catch (error) {
    console.error('Get invoice error:', error)
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

    const existing = await db.invoice.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Invoice not found', 404)
    }

    const { amount, status, dueDate, items, notes } = body

    const invoice = await db.invoice.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(items !== undefined && { items: JSON.stringify(items) }),
        ...(notes !== undefined && { notes }),
        ...(status === 'paid' && { paidDate: new Date() }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        payments: true,
      },
    })

    return jsonResponse(invoice)
  } catch (error) {
    console.error('Update invoice error:', error)
    return errorResponse('Internal server error', 500)
  }
}
