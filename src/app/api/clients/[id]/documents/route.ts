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

    const documents = await db.document.findMany({
      where: { clientId: id },
      orderBy: { uploadedAt: 'desc' },
    })

    return jsonResponse(documents)
  } catch (error) {
    console.error('Get documents error:', error)
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
    const { name, type, fileUrl, fileSize, mimeType } = body

    if (!name || !type || !fileUrl) {
      return errorResponse('Name, type, and fileUrl are required')
    }

    const client = await db.client.findUnique({ where: { id: clientId } })
    if (!client) {
      return errorResponse('Client not found', 404)
    }

    const document = await db.document.create({
      data: {
        clientId,
        name,
        type,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
      },
    })

    return jsonResponse(document, 201)
  } catch (error) {
    console.error('Upload document error:', error)
    return errorResponse('Internal server error', 500)
  }
}
