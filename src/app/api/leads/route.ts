import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

/* ── In-memory rate limiter (per IP, 5 leads / hour) ────────────────
   Lightweight protection against spam. Resets on server restart.
   For higher volumes, swap for Redis-based limiter later. */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5
const ipHits = new Map<string, { count: number; firstHit: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now - entry.firstHit > RATE_LIMIT_WINDOW_MS) {
    ipHits.set(ip, { count: 1, firstHit: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

/* GET /api/leads — admin/agent only: list leads with search & filters */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role === 'client') return errorResponse('Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''

    const where: Prisma.LeadWhereInput = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    if (status) where.status = status
    if (priority) where.priority = priority

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lead.count({ where }),
    ])

    return jsonResponse({
      leads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('List leads error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* POST /api/leads — PUBLIC (no auth): landing-page lead capture */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (rateLimited(ip)) {
      return errorResponse('Too many requests. Please try again later.', 429)
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, state, goal, creditScore, message, language, source } = body

    // Basic validation — required fields
    if (!firstName || !lastName || !email || !phone) {
      return errorResponse('First name, last name, email and phone are required', 422)
    }

    // Simple email format check (zod schema is also enforced client-side)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      return errorResponse('Please provide a valid email address', 422)
    }

    // Allowed goal values (ignore anything else)
    const allowedGoals = ['credit_repair', 'consolidation', 'home_buying', 'business_credit', 'education']
    const cleanGoal = goal && allowedGoals.includes(goal) ? goal : null

    const lead = await db.lead.create({
      data: {
        firstName: String(firstName).trim().slice(0, 80),
        lastName: String(lastName).trim().slice(0, 80),
        email: String(email).trim().toLowerCase().slice(0, 160),
        phone: String(phone).trim().slice(0, 32),
        state: state ? String(state).trim().slice(0, 60) : null,
        goal: cleanGoal,
        creditScore: creditScore ? String(creditScore).slice(0, 20) : null,
        message: message ? String(message).trim().slice(0, 2000) : null,
        language: language === 'es' ? 'es' : 'en',
        source: source || 'landing',
        status: 'new',
        priority: 'medium',
      },
    })

    // Sync to GoHighLevel (non-blocking — doesn't fail the lead if GHL is down)
    const { sendLeadToGoHighLevel } = await import('@/lib/gohighlevel')
    sendLeadToGoHighLevel({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      state: lead.state,
      goal: lead.goal,
      creditScore: lead.creditScore,
      message: lead.message,
      language: lead.language,
    }).catch((e) => console.error('GHL sync failed (lead still saved):', e))

    return jsonResponse({ success: true, id: lead.id }, 201)
  } catch (error) {
    console.error('Create lead error:', error)
    return errorResponse('Internal server error', 500)
  }
}
