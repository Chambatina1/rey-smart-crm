import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken, errorResponse, jsonResponse } from '@/lib/auth'

/**
 * POST /api/setup-admin
 * Creates the admin user if it doesn't exist.
 * This is safe to call multiple times — only creates if missing.
 * After first login, admin should change password in settings.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'admin' },
    })

    if (existingAdmin) {
      return errorResponse('Admin user already exists. Use login endpoint.', 409)
    }

    const body = await request.json().catch(() => ({}))

    // Allow custom credentials, or use defaults
    const email = (body.email || 'admin@reysmartsolution.com').toLowerCase().trim()
    const password = body.password || 'Admin123!'
    const name = body.name || 'REYS Admin'

    // Check if email is taken
    const emailTaken = await db.user.findUnique({ where: { email } })
    if (emailTaken) {
      return errorResponse('Email already registered', 409)
    }

    // Create admin user
    const passwordHash = await hashPassword(password)
    const admin = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'admin',
        language: 'es',
      },
    })

    // Generate token for immediate login
    const token = await signToken({ userId: admin.id, email: admin.email, role: 'admin' })

    return jsonResponse({
      success: true,
      message: 'Admin user created successfully',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      warning: 'Please change the default password in Settings after logging in.',
    }, 201)
  } catch (error) {
    console.error('Setup admin error:', error)
    return errorResponse('Failed to create admin user', 500)
  }
}
