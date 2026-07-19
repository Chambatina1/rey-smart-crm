import { db } from '@/lib/db'

/**
 * Creates a contact in GoHighLevel when a lead comes from the landing form.
 * If GHL is not configured or the API call fails, it silently continues
 * (the lead is still saved in our database).
 */
export async function sendLeadToGoHighLevel(lead: {
  firstName: string
  lastName: string
  email: string
  phone: string
  state?: string | null
  goal?: string | null
  creditScore?: string | null
  message?: string | null
  language?: string
}): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    const config = await db.goHighLevelConfig.findFirst({ where: { isActive: true } })

    if (!config) {
      return { success: false, error: 'GHL not configured' }
    }

    // Map goal code to readable label for GHL custom field
    const goalLabels: Record<string, string> = {
      credit_repair: 'Credit Repair',
      consolidation: 'Debt Consolidation',
      home_buying: 'Home Buying',
      business_credit: 'Business Credit',
      education: 'Financial Education',
    }

    const fullName = `${lead.firstName} ${lead.lastName}`.trim()

    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
        'Channel': 'API',
      },
      body: JSON.stringify({
        locationId: config.locationId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        name: fullName,
        email: [lead.email],
        phone: lead.phone,
        address1: lead.state || undefined,
        source: 'REYS Smart Solutions Website',
        tags: ['website-lead', lead.language === 'es' ? 'spanish' : 'english'],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GHL API error:', response.status, errorText)

      // Save error to config for admin to see
      await db.goHighLevelConfig.update({
        where: { id: config.id },
        data: { lastError: `HTTP ${response.status}: ${errorText.slice(0, 200)}` },
      })

      return { success: false, error: `GHL API error: ${response.status}` }
    }

    const data = await response.json()
    const contactId = data?.contact?.id || data?.id

    // Update last sync time
    await db.goHighLevelConfig.update({
      where: { id: config.id },
      data: { lastSyncAt: new Date(), lastError: null },
    })

    return { success: true, contactId }
  } catch (error) {
    console.error('GHL sync error:', error)
    return { success: false, error: 'Failed to sync with GHL' }
  }
}
