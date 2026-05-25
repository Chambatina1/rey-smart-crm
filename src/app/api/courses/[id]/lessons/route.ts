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

    const lessons = await db.lesson.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' },
    })

    return jsonResponse(lessons)
  } catch (error) {
    console.error('Get lessons error:', error)
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

    const { id: courseId } = await params
    const body = await request.json()
    const { titleEn, titleEs, content, videoUrl, order, duration, isPublished } = body

    if (!titleEn || !titleEs) {
      return errorResponse('titleEn and titleEs are required')
    }

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return errorResponse('Course not found', 404)
    }

    const lesson = await db.lesson.create({
      data: {
        courseId,
        titleEn,
        titleEs,
        content: content || null,
        videoUrl: videoUrl || null,
        order: order || 0,
        duration: duration || null,
        isPublished: isPublished || false,
      },
    })

    return jsonResponse(lesson, 201)
  } catch (error) {
    console.error('Create lesson error:', error)
    return errorResponse('Internal server error', 500)
  }
}
