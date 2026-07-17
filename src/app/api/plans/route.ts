import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

/* GET /api/plans — PUBLIC: list active plans for landing page */
export async function GET() {
  try {
    const plans = await db.servicePlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    if (plans.length === 0) {
      // Return fallback plans if DB not seeded yet
      return jsonResponse({ plans: getFallbackPlans() })
    }

    const parsed = plans.map((p) => ({
      ...p,
      features: JSON.parse(p.features || '[]'),
      featuresEs: p.featuresEs ? JSON.parse(p.featuresEs) : null,
    }))

    return jsonResponse({ plans: parsed })
  } catch (error) {
    console.error('List plans error:', error)
    return jsonResponse({ plans: getFallbackPlans() })
  }
}

/* POST /api/plans — admin only: create a plan */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Forbidden', 403)

    const body = await request.json()
    const { name, nameEs, code, description, descriptionEs, priceSetup, priceMonthly, features, featuresEs, isFeatured, sortOrder } = body

    if (!name || !code) return errorResponse('Name and code are required', 422)

    const plan = await db.servicePlan.create({
      data: {
        name,
        nameEs: nameEs || null,
        code,
        description: description || '',
        descriptionEs: descriptionEs || null,
        priceSetup: priceSetup || 0,
        priceMonthly: priceMonthly || 0,
        features: JSON.stringify(features || []),
        featuresEs: featuresEs ? JSON.stringify(featuresEs) : null,
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0,
      },
    })

    return jsonResponse({ plan }, 201)
  } catch (error) {
    console.error('Create plan error:', error)
    return errorResponse('Internal server error', 500)
  }
}

function getFallbackPlans() {
  return [
    {
      id: 'protection',
      code: 'protection',
      name: 'Protection',
      nameEs: 'Protección',
      description: 'Disputes and removal of negative items',
      descriptionEs: 'Disputas y eliminación de items negativos',
      priceSetup: 0,
      priceMonthly: 99,
      currency: 'USD',
      isFeatured: false,
      features: ['Disputes with 3 bureaus', 'Debt validation', 'Monthly monitoring', 'No upfront fees'],
      featuresEs: ['Disputas con los 3 burós', 'Validación de deuda', 'Monitoreo mensual', 'Sin cobros por adelantado'],
    },
    {
      id: 'building',
      code: 'building',
      name: 'Building',
      nameEs: 'Construcción',
      description: 'Build positive credit history',
      descriptionEs: 'Construye historial crediticio positivo',
      priceSetup: 0,
      priceMonthly: 149,
      currency: 'USD',
      isFeatured: true,
      features: ['Everything in Protection', 'Secured card strategy', 'Credit builder loans', 'Credit mix optimization'],
      featuresEs: ['Todo lo de Protección', 'Estrategia de tarjetas aseguradas', 'Préstamos constructores', 'Optimización de mezcla de crédito'],
    },
    {
      id: 'education',
      code: 'education',
      name: 'Education',
      nameEs: 'Educación',
      description: 'Full mentoring and education',
      descriptionEs: 'Mentoría y educación completas',
      priceSetup: 0,
      priceMonthly: 199,
      currency: 'USD',
      isFeatured: false,
      features: ['Everything in Building', 'Monthly 1-on-1 sessions', 'Live workshops (EN/ES)', 'Resource library'],
      featuresEs: ['Todo lo de Construcción', 'Sesiones 1-a-1 mensuales', 'Talleres en vivo (EN/ES)', 'Biblioteca de recursos'],
    },
  ]
}
