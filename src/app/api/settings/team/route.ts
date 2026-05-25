import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Only admins can view team', 403)

    const teamMembers = await db.user.findMany({
      where: {
        role: { in: ['admin', 'agent'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return jsonResponse(teamMembers)
  } catch (error) {
    console.error('Get team error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Only admins can invite team members', 403)

    const body = await request.json()
    const { name, email, password, phone, role } = body

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required')
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return errorResponse('Email already registered', 409)
    }

    const passwordHash = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        role: role || 'agent',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    })

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'team_member_invited',
        description: `Invited ${name} as ${role || 'agent'}`,
      },
    })

    return jsonResponse(user, 201)
  } catch (error) {
    console.error('Invite team member error:', error)
    return errorResponse('Internal server error', 500)
  }
}
