import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const { id: courseId } = await params

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return errorResponse('Course not found', 404)
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: auth.userId,
          courseId,
        },
      },
    })

    if (existing) {
      return errorResponse('Already enrolled in this course', 409)
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: auth.userId,
        courseId,
        status: 'active',
        progress: 0,
      },
      include: {
        course: {
          select: { id: true, titleEn: true, titleEs: true },
        },
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'course_enrolled',
        description: `Enrolled in course: ${course.titleEn}`,
        metadata: JSON.stringify({ courseId, enrollmentId: enrollment.id }),
      },
    })

    return jsonResponse(enrollment, 201)
  } catch (error) {
    console.error('Enroll error:', error)
    return errorResponse('Internal server error', 500)
  }
}
