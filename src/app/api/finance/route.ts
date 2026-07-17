import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'
import { Prisma } from '@prisma/client'

/* GET /api/finance — admin/agent: list entries with filters + summary */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role === 'client') return errorResponse('Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''        // income | expense
    const category = searchParams.get('category') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '200')

    const where: Prisma.FinanceEntryWhereInput = {}
    if (type) where.type = type
    if (category) where.category = category
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [entries, incomeAgg, expenseAgg] = await Promise.all([
      db.financeEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
      }),
      db.financeEntry.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
        _count: true,
      }),
      db.financeEntry.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const totalIncome = incomeAgg._sum.amount || 0
    const totalExpenses = expenseAgg._sum.amount || 0
    const netProfit = totalIncome - totalExpenses
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    // Category breakdown
    const categoryStats = await db.financeEntry.groupBy({
      by: ['type', 'category'],
      where,
      _sum: { amount: true },
      _count: true,
    })

    return jsonResponse({
      entries,
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        margin: Math.round(margin * 100) / 100,
        incomeCount: incomeAgg._count,
        expenseCount: expenseAgg._count,
      },
      categoryStats,
    })
  } catch (error) {
    console.error('List finance entries error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/* POST /api/finance — admin: create income/expense entry */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const body = await request.json()
    const { type, category, description, amount, date, clientId, planId, paymentId, notes } = body

    if (!type || !category || !description || amount === undefined) {
      return errorResponse('Type, category, description and amount are required', 422)
    }

    if (!['income', 'expense'].includes(type)) {
      return errorResponse('Type must be "income" or "expense"', 422)
    }

    const entry = await db.financeEntry.create({
      data: {
        type,
        category: String(category).slice(0, 60),
        description: String(description).slice(0, 300),
        amount: Math.abs(parseFloat(amount)),
        date: date ? new Date(date) : new Date(),
        clientId: clientId || null,
        planId: planId || null,
        paymentId: paymentId || null,
        notes: notes ? String(notes).slice(0, 1000) : null,
      },
    })

    return jsonResponse({ entry }, 201)
  } catch (error) {
    console.error('Create finance entry error:', error)
    return errorResponse('Internal server error', 500)
  }
}
