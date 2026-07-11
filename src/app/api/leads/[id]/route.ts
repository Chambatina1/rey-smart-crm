import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

/* GET /api/leads/[id] — admin/agent only */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role === 'client') return errorResponse('Forbidden', 403)

    const { id } = await params
    const lead = await db.lead.findUnique({ where: { id } })

    if (!lead) return errorResponse('Lead not found', 404)
    return jsonResponse({ lead })
  } catch (error) {
    console.error('Get lead error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* PUT /api/leads/[id] — admin/agent only: update status, priority, assignedTo, notes */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role === 'client') return errorResponse('Forbidden', 403)

    const { id } = await params
    const body = await request.json()
    const { status, priority, assignedTo, notes } = body

    const allowedStatus = ['new', 'contacted', 'qualified', 'enrolled', 'lost']
    const allowedPriority = ['low', 'medium', 'high']

    const data: Record<string, unknown> = {}
    if (status && allowedStatus.includes(status)) data.status = status
    if (priority && allowedPriority.includes(priority)) data.priority = priority
    if (assignedTo !== undefined) data.assignedTo = assignedTo || null
    if (notes !== undefined) data.notes = notes ? String(notes).slice(0, 5000) : null

    const lead = await db.lead.update({
      where: { id },
      data,
    })

    return jsonResponse({ lead })
  } catch (error) {
    console.error('Update lead error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* DELETE /api/leads/[id] — admin only */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const { id } = await params
    await db.lead.delete({ where: { id } })
    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return errorResponse('Internal server error', 500)
  }
}
