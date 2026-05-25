import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    let settings = await db.companySettings.findFirst()

    if (!settings) {
      // Create default settings
      settings = await db.companySettings.create({})
    }

    return jsonResponse(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)
    if (auth.role !== 'admin') return errorResponse('Only admins can update settings', 403)

    const body = await request.json()
    const {
      companyName, companyLogo, phone, email, address, website,
      primaryColor, accentColor, currency, timezone, language,
      enableSms, enableEmail, autoReminders, welcomeEmail, smsTemplate,
    } = body

    let settings = await db.companySettings.findFirst()

    if (!settings) {
      settings = await db.companySettings.create({
        data: {
          ...(companyName && { companyName }),
          ...(companyLogo !== undefined && { companyLogo }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address && { address }),
          ...(website && { website }),
          ...(primaryColor && { primaryColor }),
          ...(accentColor && { accentColor }),
          ...(currency && { currency }),
          ...(timezone && { timezone }),
          ...(language && { language }),
          ...(enableSms !== undefined && { enableSms }),
          ...(enableEmail !== undefined && { enableEmail }),
          ...(autoReminders !== undefined && { autoReminders }),
          ...(welcomeEmail !== undefined && { welcomeEmail }),
          ...(smsTemplate !== undefined && { smsTemplate }),
        },
      })
    } else {
      settings = await db.companySettings.update({
        where: { id: settings.id },
        data: {
          ...(companyName && { companyName }),
          ...(companyLogo !== undefined && { companyLogo }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address && { address }),
          ...(website && { website }),
          ...(primaryColor && { primaryColor }),
          ...(accentColor && { accentColor }),
          ...(currency && { currency }),
          ...(timezone && { timezone }),
          ...(language && { language }),
          ...(enableSms !== undefined && { enableSms }),
          ...(enableEmail !== undefined && { enableEmail }),
          ...(autoReminders !== undefined && { autoReminders }),
          ...(welcomeEmail !== undefined && { welcomeEmail }),
          ...(smsTemplate !== undefined && { smsTemplate }),
        },
      })
    }

    return jsonResponse(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return errorResponse('Internal server error', 500)
  }
}
