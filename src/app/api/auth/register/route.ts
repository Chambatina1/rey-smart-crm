import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken, errorResponse, jsonResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required')
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters')
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
        role: role || 'client',
      },
    })

    // Create client profile if role is client
    if (user.role === 'client') {
      await db.client.create({
        data: {
          userId: user.id,
          status: 'active',
        },
      })
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: user.id,
        action: 'user_registered',
        description: `${user.name} registered as ${user.role}`,
      },
    })

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Internal server error', 500)
  }
}
