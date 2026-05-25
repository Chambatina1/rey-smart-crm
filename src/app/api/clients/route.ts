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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: Prisma.ClientWhereInput = {}

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { address: { contains: search } },
        { city: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Non-admin users can only see their own client profile
    if (auth.role === 'client') {
      where.userId = auth.userId
    }

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
          },
          _count: {
            select: {
              disputes: true,
              documents: true,
              payments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.client.count({ where }),
    ])

    return jsonResponse({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List clients error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { name, email, phone, password, ssnLastFour, dateOfBirth, address, city, state, zipCode, creditScore, referredBy, notes, tags } = body

    if (!name || !email) {
      return errorResponse('Name and email are required')
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return errorResponse('Email already registered', 409)
    }

    // Create user with client role
    const bcryptjs = await import('bcryptjs')
    const passwordHash = await bcryptjs.hash(password || 'ChangeMe123!', 12)

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        role: 'client',
      },
    })

    const client = await db.client.create({
      data: {
        userId: user.id,
        ssnLastFour: ssnLastFour || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        creditScore: creditScore || null,
        creditScoreDate: creditScore ? new Date() : null,
        status: 'active',
        referredBy: referredBy || null,
        notes: notes || null,
        tags: tags ? JSON.stringify(tags) : null,
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'client_created',
        description: `Created client profile for ${name}`,
        metadata: JSON.stringify({ clientId: client.id }),
      },
    })

    return jsonResponse({ client, user }, 201)
  } catch (error) {
    console.error('Create client error:', error)
    return errorResponse('Internal server error', 500)
  }
}
