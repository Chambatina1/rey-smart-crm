import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
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
  return request.headers.get('x-real-ip') || 'unknown'
}

const ALLOWED_TYPES = ['course', 'debt_strategy', 'guide', 'consultation']

/* GET /api/service-requests — admin/agent only */
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
    const type = searchParams.get('type') || ''

    const where: Prisma.ServiceRequestWhereInput = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (type) where.type = type

    const [requests, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.serviceRequest.count({ where }),
    ])

    return jsonResponse({
      requests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('List service requests error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* POST /api/service-requests — PUBLIC */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (rateLimited(ip)) {
      return errorResponse('Too many requests. Please try again later.', 429)
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, type, courseTitle, debtAmount, creditorCount, guideTopic, goal, message, language } = body

    if (!firstName || !lastName || !email || !phone || !type) {
      return errorResponse('First name, last name, email, phone and type are required', 422)
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) return errorResponse('Please provide a valid email address', 422)

    const cleanType = ALLOWED_TYPES.includes(type) ? type : 'consultation'

    const req = await db.serviceRequest.create({
      data: {
        firstName: String(firstName).trim().slice(0, 80),
        lastName: String(lastName).trim().slice(0, 80),
        email: String(email).trim().toLowerCase().slice(0, 160),
        phone: String(phone).trim().slice(0, 32),
        type: cleanType,
        courseTitle: courseTitle ? String(courseTitle).slice(0, 200) : null,
        debtAmount: debtAmount ? String(debtAmount).slice(0, 50) : null,
        creditorCount: creditorCount ? String(creditorCount).slice(0, 20) : null,
        guideTopic: guideTopic ? String(guideTopic).slice(0, 200) : null,
        goal: goal ? String(goal).slice(0, 500) : null,
        message: message ? String(message).slice(0, 2000) : null,
        language: language === 'es' ? 'es' : 'en',
      },
    })

    return jsonResponse({ success: true, id: req.id }, 201)
  } catch (error) {
    console.error('Create service request error:', error)
    return errorResponse('Internal server error', 500)
  }
}
