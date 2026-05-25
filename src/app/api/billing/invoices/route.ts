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
    const clientId = searchParams.get('clientId') || ''

    const where: Prisma.InvoiceWhereInput = {}

    if (status) where.status = status
    if (clientId) where.clientId = clientId

    // Clients see only their invoices
    if (auth.role === 'client') {
      where.userId = auth.userId
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          client: {
            select: { id: true },
          },
          payments: true,
          _count: {
            select: { payments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
    ])

    return jsonResponse({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List invoices error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { userId, clientId, amount, dueDate, items, notes } = body

    if (!userId || !amount || !dueDate) {
      return errorResponse('userId, amount, and dueDate are required')
    }

    const invoice = await db.invoice.create({
      data: {
        userId,
        clientId: clientId || null,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        items: items ? JSON.stringify(items) : null,
        notes: notes || null,
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true },
        },
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'invoice_created',
        description: `Created invoice for $${amount}`,
        metadata: JSON.stringify({ invoiceId: invoice.id }),
      },
    })

    return jsonResponse(invoice, 201)
  } catch (error) {
    console.error('Create invoice error:', error)
    return errorResponse('Internal server error', 500)
  }
}
