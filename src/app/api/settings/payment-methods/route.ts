import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

const ALLOWED_CODES = ['stripe', 'paypal', 'square', 'zelle', 'bank_transfer', 'cash', 'check']

/* GET /api/settings/payment-methods — PUBLIC: list active methods for checkout */
/* (admin query param shows all including inactive + masked secrets) */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminView = searchParams.get('admin') === 'true'

    let where = { isActive: true }
    if (adminView) {
      const auth = await getAuthUser(request)
      if (!auth) return errorResponse('Unauthorized', 401)
      if (auth.role !== 'admin') return errorResponse('Forbidden', 403)
      where = {} as never // show all
    }

    const methods = await db.paymentMethod.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    const parsed = methods.map((m) => ({
      ...m,
      secretKey: adminView && m.secretKey ? m.secretKey.slice(0, 6) + '••••••' : null,
      webhookSecret: adminView && m.webhookSecret ? '••••••' : null,
      instructions: m.instructions ? JSON.parse(m.instructions) : null,
    }))

    return jsonResponse({ methods: parsed })
  } catch (error) {
    console.error('List payment methods error:', error)
    return jsonResponse({ methods: [] })
  }
}

/* POST /api/settings/payment-methods — admin: create a payment method */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const body = await request.json()
    const { code, displayName, type, description, publicKey, secretKey, webhookSecret, accountId, isActive, isDefault, feePercent, feeFlat, icon, sortOrder, instructions } = body

    if (!code || !displayName) {
      return errorResponse('Code and display name are required', 422)
    }
    if (!ALLOWED_CODES.includes(code)) {
      return errorResponse(`Code must be one of: ${ALLOWED_CODES.join(', ')}`, 422)
    }

    // If setting as default, unset others
    if (isDefault) {
      await db.paymentMethod.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    const method = await db.paymentMethod.create({
      data: {
        code,
        displayName,
        type: type || 'card',
        description: description || null,
        publicKey: publicKey || null,
        secretKey: secretKey || null,
        webhookSecret: webhookSecret || null,
        accountId: accountId || null,
        isActive: isActive ?? false,
        isDefault: isDefault || false,
        feePercent: feePercent ?? null,
        feeFlat: feeFlat ?? null,
        icon: icon || null,
        sortOrder: sortOrder || 0,
        instructions: instructions ? JSON.stringify(instructions) : null,
      },
    })

    return jsonResponse({ method: { ...method, secretKey: '••••••', webhookSecret: '••••••' } }, 201)
  } catch (error) {
    console.error('Create payment method error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* PUT /api/settings/payment-methods — admin: update */
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const body = await request.json()
    const { id, displayName, type, description, publicKey, secretKey, webhookSecret, accountId, isActive, isDefault, feePercent, feeFlat, icon, sortOrder, instructions } = body

    if (!id) return errorResponse('Method ID is required', 422)

    if (isDefault) {
      await db.paymentMethod.updateMany({ where: { isDefault: true, NOT: { id } }, data: { isDefault: false } })
    }

    const data: Record<string, unknown> = {}
    if (displayName !== undefined) data.displayName = displayName
    if (type !== undefined) data.type = type
    if (description !== undefined) data.description = description
    if (publicKey !== undefined) data.publicKey = publicKey
    if (secretKey) data.secretKey = secretKey // only update if provided (non-empty)
    if (webhookSecret) data.webhookSecret = webhookSecret
    if (accountId !== undefined) data.accountId = accountId
    if (isActive !== undefined) data.isActive = isActive
    if (isDefault !== undefined) data.isDefault = isDefault
    if (feePercent !== undefined) data.feePercent = feePercent
    if (feeFlat !== undefined) data.feeFlat = feeFlat
    if (icon !== undefined) data.icon = icon
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (instructions !== undefined) data.instructions = JSON.stringify(instructions)

    const method = await db.paymentMethod.update({ where: { id }, data })

    return jsonResponse({ method: { ...method, secretKey: '••••••', webhookSecret: '••••••' } })
  } catch (error) {
    console.error('Update payment method error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* DELETE /api/settings/payment-methods?id=xxx — admin: delete */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return errorResponse('Method ID is required', 422)

    await db.paymentMethod.delete({ where: { id } })

    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Delete payment method error:', error)
    return errorResponse('Internal server error', 500)
  }
}
