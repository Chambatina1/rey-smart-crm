import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

/* GET /api/settings/gohighlevel — admin: get GHL config (token masked) */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const config = await db.goHighLevelConfig.findFirst()

    if (!config) {
      return jsonResponse({ config: null, message: 'GoHighLevel not configured' })
    }

    return jsonResponse({
      config: {
        id: config.id,
        apiKey: config.apiKey ? config.apiKey.slice(0, 12) + '••••••' : null,
        locationId: config.locationId,
        pipelineId: config.pipelineId,
        pipelineStageId: config.pipelineStageId,
        isActive: config.isActive,
        lastSyncAt: config.lastSyncAt,
        lastError: config.lastError,
      },
    })
  } catch (error) {
    console.error('Get GHL config error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* PUT /api/settings/gohighlevel — admin: save/update GHL credentials */
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const body = await request.json()
    const { apiKey, locationId, pipelineId, pipelineStageId, isActive } = body

    if (!apiKey || !locationId) {
      return errorResponse('API Token and Location ID are required', 422)
    }

    const existing = await db.goHighLevelConfig.findFirst()

    const data = {
      apiKey: String(apiKey).trim(),
      locationId: String(locationId).trim(),
      pipelineId: pipelineId || null,
      pipelineStageId: pipelineStageId || null,
      isActive: isActive !== undefined ? isActive : true,
    }

    if (existing) {
      const updated = await db.goHighLevelConfig.update({
        where: { id: existing.id },
        data,
      })
      return jsonResponse({
        config: { ...updated, apiKey: updated.apiKey.slice(0, 12) + '••••••' },
        message: 'GoHighLevel credentials saved',
      })
    } else {
      const created = await db.goHighLevelConfig.create({ data })
      return jsonResponse({
        config: { ...created, apiKey: created.apiKey.slice(0, 12) + '••••••' },
        message: 'GoHighLevel credentials saved',
      })
    }
  } catch (error) {
    console.error('Save GHL config error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* DELETE /api/settings/gohighlevel — admin: disconnect */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    await db.goHighLevelConfig.deleteMany({})
    return jsonResponse({ message: 'GoHighLevel disconnected' })
  } catch (error) {
    console.error('Delete GHL config error:', error)
    return errorResponse('Internal server error', 500)
  }
}
