import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

/* GET /api/settings/quickbooks — admin: get QuickBooks config (secrets masked) */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const config = await db.quickBooksConfig.findFirst()

    if (!config) {
      return jsonResponse({ config: null, message: 'QuickBooks not configured yet' })
    }

    // Mask secrets for security
    return jsonResponse({
      config: {
        id: config.id,
        clientId: config.clientId ? config.clientId.slice(0, 6) + '••••••' : null,
        clientSecret: config.clientSecret ? '••••••••' : null,
        environment: config.environment,
        realmId: config.realmId,
        redirectUri: config.redirectUri,
        isConnected: config.isConnected,
        connectedAt: config.connectedAt,
        tokenExpiresAt: config.tokenExpiresAt,
      },
    })
  } catch (error) {
    console.error('Get QB config error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* PUT /api/settings/quickbooks — admin: save/update QuickBooks credentials */
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const body = await request.json()
    const { clientId, clientSecret, environment, redirectUri } = body

    if (!clientId || !clientSecret) {
      return errorResponse('Client ID and Client Secret are required', 422)
    }

    const existing = await db.quickBooksConfig.findFirst()

    if (existing) {
      const updated = await db.quickBooksConfig.update({
        where: { id: existing.id },
        data: {
          clientId: String(clientId).trim(),
          clientSecret: String(clientSecret).trim(),
          environment: environment === 'sandbox' ? 'sandbox' : 'production',
          redirectUri: redirectUri ? String(redirectUri).trim() : existing.redirectUri,
        },
      })
      return jsonResponse({
        config: { ...updated, clientSecret: '••••••••' },
        message: 'QuickBooks credentials saved successfully',
      })
    } else {
      const created = await db.quickBooksConfig.create({
        data: {
          clientId: String(clientId).trim(),
          clientSecret: String(clientSecret).trim(),
          environment: environment === 'sandbox' ? 'sandbox' : 'production',
          redirectUri: redirectUri ? String(redirectUri).trim() : null,
        },
      })
      return jsonResponse({
        config: { ...created, clientSecret: '••••••••' },
        message: 'QuickBooks credentials saved successfully',
      })
    }
  } catch (error) {
    console.error('Save QB config error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* DELETE /api/settings/quickbooks — admin: disconnect / clear QuickBooks */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    await db.quickBooksConfig.deleteMany({})

    return jsonResponse({ message: 'QuickBooks configuration cleared' })
  } catch (error) {
    console.error('Delete QB config error:', error)
    return errorResponse('Internal server error', 500)
  }
}
