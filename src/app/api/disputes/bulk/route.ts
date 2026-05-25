import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, errorResponse, jsonResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { disputeIds, template, status } = body

    if (!disputeIds || !Array.isArray(disputeIds) || disputeIds.length === 0) {
      return errorResponse('disputeIds array is required')
    }

    // Get all disputes
    const disputes = await db.dispute.findMany({
      where: { id: { in: disputeIds } },
      include: {
        client: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        tradeLine: true,
      },
    })

    if (disputes.length === 0) {
      return errorResponse('No valid disputes found', 404)
    }

    // Generate letter content for each dispute
    const updatedDisputes = []
    for (const dispute of disputes) {
      const letterContent = template || generateDisputeLetter(dispute)

      const updated = await db.dispute.update({
        where: { id: dispute.id },
        data: {
          status: status || 'sent',
          sentDate: new Date(),
          letterContent,
        },
        include: {
          client: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      })
      updatedDisputes.push(updated)
    }

    await db.activity.create({
      data: {
        userId: auth.userId,
        action: 'bulk_dispute_sent',
        description: `Bulk sent ${disputeIds.length} dispute letters`,
        metadata: JSON.stringify({ disputeIds }),
      },
    })

    return jsonResponse({
      message: `Successfully generated and sent ${updatedDisputes.length} dispute letters`,
      disputes: updatedDisputes,
    })
  } catch (error) {
    console.error('Bulk dispute error:', error)
    return errorResponse('Internal server error', 500)
  }
}

function generateDisputeLetter(dispute: {
  bureau: string
  disputeType: string
  disputeReason?: string | null
  round: number
  client: {
    user: { name: string; email: string }
  }
  tradeLine?: {
    accountName: string
    accountType?: string | null
  } | null
}): string {
  const bureauAddress = getBureauAddress(dispute.bureau)
  const clientName = dispute.client.user.name
  const accountName = dispute.tradeLine?.accountName || 'Unknown Account'
  const disputeReasonText = dispute.disputeReason || getDefaultReason(dispute.disputeType)

  return `
DISPUTE LETTER - ROUND ${dispute.round}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${bureauAddress}

RE: Dispute of Inaccurate Information
To Whom It May Concern,

I am writing to dispute the following information that appears on my credit report:

Account: ${accountName}
Bureau: ${dispute.bureau.toUpperCase()}
Reason: ${disputeReasonText}

Under the Fair Credit Reporting Act (FCRA), I request that you investigate this item and remove it from my credit report if it cannot be verified as accurate. I have the right to a fair and accurate credit report.

Please investigate this matter and respond within 30 days as required by law.

Sincerely,
${clientName}
`.trim()
}

function getBureauAddress(bureau: string): string {
  const addresses: Record<string, string> = {
    equifax: 'Equifax Information Services LLC\nP.O. Box 740241\nAtlanta, GA 30374',
    experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
    transunion: 'TransUnion LLC\nP.O. Box 2000\nChester, PA 19016',
  }
  return addresses[bureau] || 'Credit Bureau\nP.O. Box 1000\nUnknown, ST 00000'
}

function getDefaultReason(disputeType: string): string {
  const reasons: Record<string, string> = {
    late_payment: 'I do not have a record of late payment for this account.',
    collection: 'This collection item is inaccurate and/or does not belong to me.',
    charge_off: 'This charge-off was not properly notified and/or is inaccurate.',
    identity_theft: 'This account was opened fraudulently as a result of identity theft.',
    incorrect_info: 'The information reported is incorrect or incomplete.',
    outdated: 'This negative item has exceeded the reporting period and should be removed.',
    other: 'This item contains inaccurate information that needs to be investigated.',
  }
  return reasons[disputeType] || 'This item contains inaccurate information.'
}
