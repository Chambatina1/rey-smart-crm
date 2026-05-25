import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    // Get all clients with credit scores
    const clients = await db.client.findMany({
      where: {
        creditScore: { not: null },
      },
      select: {
        creditScore: true,
      },
    })

    // Calculate distribution
    const ranges = [
      { label: '300-399', min: 300, max: 399 },
      { label: '400-499', min: 400, max: 499 },
      { label: '500-549', min: 500, max: 549 },
      { label: '550-599', min: 550, max: 599 },
      { label: '600-649', min: 600, max: 649 },
      { label: '650-699', min: 650, max: 699 },
      { label: '700-749', min: 700, max: 749 },
      { label: '750-799', min: 750, max: 799 },
      { label: '800-850', min: 800, max: 850 },
    ]

    const distribution = ranges.map((range) => {
      const count = clients.filter(
        (c) => c.creditScore! >= range.min && c.creditScore! <= range.max
      ).length

      return {
        range: range.label,
        count,
        min: range.min,
        max: range.max,
      }
    })

    // Calculate averages
    const scores = clients.map((c) => c.creditScore!)
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    const minScore = scores.length > 0 ? Math.min(...scores) : 0
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0
    const medianScore = scores.length > 0
      ? (() => {
          const sorted = [...scores].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        })()
      : 0

    return jsonResponse({
      distribution,
      totalClients: clients.length,
      average: avgScore,
      median: medianScore,
      min: minScore,
      max: maxScore,
    })
  } catch (error) {
    console.error('Credit distribution error:', error)
    return errorResponse('Internal server error', 500)
  }
}
