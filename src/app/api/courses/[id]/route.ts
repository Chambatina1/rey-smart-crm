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

    const course = await db.course.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        lessons: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            conferences: true,
          },
        },
      },
    })

    if (!course) {
      return errorResponse('Course not found', 404)
    }

    // Check if current user is enrolled
    let enrollment = null
    if (auth) {
      enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: auth.userId,
            courseId: course.id,
          },
        },
      })
    }

    return jsonResponse({ ...course, enrollment })
  } catch (error) {
    console.error('Get course error:', error)
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

    const existing = await db.course.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Course not found', 404)
    }

    const { titleEn, titleEs, descriptionEn, descriptionEs, category, level, thumbnail, videoUrl, content, duration, isPublished, isFree, price } = body

    const course = await db.course.update({
      where: { id },
      data: {
        ...(titleEn && { titleEn }),
        ...(titleEs && { titleEs }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionEs !== undefined && { descriptionEs }),
        ...(category && { category }),
        ...(level && { level }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(content !== undefined && { content }),
        ...(duration !== undefined && { duration }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFree !== undefined && { isFree }),
        ...(price !== undefined && { price }),
      },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    })

    return jsonResponse(course)
  } catch (error) {
    console.error('Update course error:', error)
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

    const course = await db.course.findUnique({ where: { id } })
    if (!course) {
      return errorResponse('Course not found', 404)
    }

    await db.course.delete({ where: { id } })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'course_deleted',
        description: `Deleted course: ${course.titleEn}`,
      },
    })

    return jsonResponse({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return errorResponse('Internal server error', 500)
  }
}
