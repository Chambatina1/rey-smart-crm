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
    const category = searchParams.get('category') || ''
    const level = searchParams.get('level') || ''
    const published = searchParams.get('published')

    const where: Prisma.CourseWhereInput = {}

    if (category) where.category = category
    if (level) where.level = level
    if (published !== null && published !== undefined) {
      where.isPublished = published === 'true'
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              conferences: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.course.count({ where }),
    ])

    return jsonResponse({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List courses error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { titleEn, titleEs, descriptionEn, descriptionEs, category, level, thumbnail, videoUrl, content, duration, isPublished, isFree, price } = body

    if (!titleEn || !titleEs || !category) {
      return errorResponse('titleEn, titleEs, and category are required')
    }

    const course = await db.course.create({
      data: {
        titleEn,
        titleEs,
        descriptionEn: descriptionEn || null,
        descriptionEs: descriptionEs || null,
        category,
        level: level || 'beginner',
        thumbnail: thumbnail || null,
        videoUrl: videoUrl || null,
        content: content || null,
        duration: duration || null,
        isPublished: isPublished || false,
        isFree: isFree !== undefined ? isFree : true,
        price: price || null,
        createdBy: auth.userId,
      },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'course_created',
        description: `Created course: ${titleEn}`,
        metadata: JSON.stringify({ courseId: course.id }),
      },
    })

    return jsonResponse(course, 201)
  } catch (error) {
    console.error('Create course error:', error)
    return errorResponse('Internal server error', 500)
  }
}
