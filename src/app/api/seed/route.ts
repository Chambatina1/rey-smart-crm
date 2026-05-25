import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { jsonResponse, errorResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if data already exists
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      return errorResponse('Database already has data. Reset first if you want to re-seed.', 400)
    }

    const results: Record<string, number> = {}

    // 1. Create admin user
    const adminPassword = await hashPassword('Admin123!')
    const admin = await db.user.create({
      data: {
        email: 'admin@reysmartsolution.com',
        name: 'Rey Admin',
        passwordHash: adminPassword,
        phone: '(407) 432-8872',
        role: 'admin',
        language: 'en',
      },
    })
    results.users = 1

    // 2. Create agent users
    const agentPassword = await hashPassword('Agent123!')
    const agent1 = await db.user.create({
      data: {
        email: 'maria@reysmartsolution.com',
        name: 'Maria Rodriguez',
        passwordHash: agentPassword,
        phone: '(407) 555-0101',
        role: 'agent',
        language: 'es',
      },
    })
    const agent2 = await db.user.create({
      data: {
        email: 'james@reysmartsolution.com',
        name: 'James Wilson',
        passwordHash: agentPassword,
        phone: '(407) 555-0102',
        role: 'agent',
        language: 'en',
      },
    })
    results.users += 2

    // 3. Create sample clients
    const clientPassword = await hashPassword('Client123!')
    const clientData = [
      {
        name: 'Carlos Martinez', email: 'carlos@email.com', phone: '(407) 555-0201',
        ssnLastFour: '1234', city: 'Orlando', state: 'FL', zipCode: '32801',
        creditScore: 520, status: 'active',
      },
      {
        name: 'Sarah Johnson', email: 'sarah@email.com', phone: '(407) 555-0202',
        ssnLastFour: '5678', city: 'Kissimmee', state: 'FL', zipCode: '34741',
        creditScore: 610, status: 'active',
      },
      {
        name: 'Miguel Hernandez', email: 'miguel@email.com', phone: '(407) 555-0203',
        ssnLastFour: '9012', city: 'Sanford', state: 'FL', zipCode: '32771',
        creditScore: 480, status: 'active',
      },
      {
        name: 'Emily Davis', email: 'emily@email.com', phone: '(407) 555-0204',
        ssnLastFour: '3456', city: 'Winter Park', state: 'FL', zipCode: '32789',
        creditScore: 700, status: 'active',
      },
      {
        name: 'Ana Lopez', email: 'ana@email.com', phone: '(407) 555-0205',
        ssnLastFour: '7890', city: 'Altamonte Springs', state: 'FL', zipCode: '32701',
        creditScore: 550, status: 'active',
      },
      {
        name: 'Robert Brown', email: 'robert@email.com', phone: '(407) 555-0206',
        ssnLastFour: '2345', city: 'Oviedo', state: 'FL', zipCode: '32765',
        creditScore: 650, status: 'completed',
      },
    ]

    const clients = []
    for (const cd of clientData) {
      const user = await db.user.create({
        data: {
          email: cd.email,
          name: cd.name,
          passwordHash: clientPassword,
          phone: cd.phone,
          role: 'client',
          language: ['Carlos Martinez', 'Miguel Hernandez', 'Ana Lopez'].includes(cd.name) ? 'es' : 'en',
        },
      })
      const client = await db.client.create({
        data: {
          userId: user.id,
          ssnLastFour: cd.ssnLastFour,
          city: cd.city,
          state: cd.state,
          zipCode: cd.zipCode,
          creditScore: cd.creditScore,
          creditScoreDate: new Date(),
          status: cd.status,
          address: `${100 + Math.floor(Math.random() * 9000)} Main St`,
          tags: JSON.stringify(cd.creditScore < 550 ? ['priority', 'needs-attention'] : ['regular']),
        },
      })
      clients.push({ user, client })
    }
    results.users += 6
    results.clients = 6

    // 4. Create credit reports and trade lines
    const bureaus = ['equifax', 'experian', 'transunion']
    const accountTypes = ['revolving', 'installment', 'collection', 'mortgage']
    const paymentStatuses = ['current', 'late', 'charge_off', 'collection']

    const creditReports = []
    for (const { client } of clients) {
      for (const bureau of bureaus) {
        const report = await db.creditReport.create({
          data: {
            clientId: client.id,
            bureau,
            score: client.creditScore ? client.creditScore + Math.floor(Math.random() * 40 - 20) : null,
            pullDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            status: 'loaded',
          },
        })

        // Add trade lines
        const numTradeLines = 3 + Math.floor(Math.random() * 5)
        for (let j = 0; j < numTradeLines; j++) {
          await db.tradeLine.create({
            data: {
              creditReportId: report.id,
              accountName: ['Bank of America', 'Chase', 'Wells Fargo', 'Capital One', 'Discover', 'Citibank', 'US Bank', 'Synchrony'][Math.floor(Math.random() * 8)],
              accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
              accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
              balance: Math.floor(Math.random() * 15000),
              creditLimit: Math.floor(Math.random() * 20000) + 1000,
              paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
              monthsReviewed: 6 + Math.floor(Math.random() * 60),
              dateOpened: new Date(Date.now() - Math.floor(Math.random() * 365 * 10) * 24 * 60 * 60 * 1000),
              disputeStatus: 'none',
            },
          })
        }

        creditReports.push(report)
      }
    }
    results.creditReports = creditReports.length

    // 5. Create disputes
    const disputeTypes = ['late_payment', 'collection', 'charge_off', 'incorrect_info', 'outdated']
    const disputeReasons = [
      'This item was never late',
      'I have no knowledge of this collection',
      'This charge-off is inaccurate',
      'The balance shown is incorrect',
      'This item should have been removed after 7 years',
    ]

    const disputes = []
    for (const { client } of clients.slice(0, 4)) {
      const clientReports = await db.creditReport.findMany({
        where: { clientId: client.id },
        include: { tradeLines: true },
      })

      for (const report of clientReports) {
        const disputableLines = report.tradeLines.filter(
          (tl) => tl.paymentStatus === 'late' || tl.paymentStatus === 'collection' || tl.paymentStatus === 'charge_off'
        )

        for (const tl of disputableLines.slice(0, 2)) {
          const dispute = await db.dispute.create({
            data: {
              clientId: client.id,
              tradeLineId: tl.id,
              bureau: report.bureau,
              disputeType: disputeTypes[Math.floor(Math.random() * disputeTypes.length)],
              disputeReason: disputeReasons[Math.floor(Math.random() * disputeReasons.length)],
              status: ['draft', 'sent', 'in_progress', 'completed'][Math.floor(Math.random() * 4)],
              round: Math.random() > 0.5 ? 2 : 1,
              sentDate: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) : null,
            },
          })
          disputes.push(dispute)

          // Some disputes have responses
          if (dispute.status === 'completed' || dispute.status === 'in_progress') {
            await db.disputeResponse.create({
              data: {
                disputeId: dispute.id,
                outcome: ['deleted', 'verified', 'updated', 'reinvestigate'][Math.floor(Math.random() * 4)],
                receivedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
              },
            })
          }
        }
      }
    }
    results.disputes = disputes.length

    // 6. Create courses
    const courses = [
      {
        titleEn: 'Credit Score Fundamentals',
        titleEs: 'Fundamentos del Score de Crédito',
        descriptionEn: 'Learn how credit scores work and what affects them.',
        descriptionEs: 'Aprenda cómo funcionan los scores de crédito y qué los afecta.',
        category: 'credit_basics',
        level: 'beginner',
        duration: 45,
        isPublished: true,
        isFree: true,
      },
      {
        titleEn: 'Debt Consolidation Strategies',
        titleEs: 'Estrategias de Consolidación de Deuda',
        descriptionEn: 'Explore different approaches to consolidating your debt.',
        descriptionEs: 'Explore diferentes enfoques para consolidar su deuda.',
        category: 'consolidation',
        level: 'intermediate',
        duration: 60,
        isPublished: true,
        isFree: false,
        price: 29.99,
      },
      {
        titleEn: 'Budgeting for Financial Freedom',
        titleEs: 'Presupuesto para la Libertad Financiera',
        descriptionEn: 'Master budgeting techniques to achieve financial goals.',
        descriptionEs: 'Domine las técnicas de presupuesto para alcanzar metas financieras.',
        category: 'budgeting',
        level: 'beginner',
        duration: 30,
        isPublished: true,
        isFree: true,
      },
      {
        titleEn: 'Home Buying After Credit Repair',
        titleEs: 'Compra de Casa Después de Reparación de Crédito',
        descriptionEn: 'Steps to buying a home after improving your credit.',
        descriptionEs: 'Pasos para comprar una casa después de mejorar su crédito.',
        category: 'home_buying',
        level: 'advanced',
        duration: 90,
        isPublished: true,
        isFree: false,
        price: 49.99,
      },
      {
        titleEn: 'Building Business Credit',
        titleEs: 'Construyendo Crédito Empresarial',
        descriptionEn: 'How to establish and build business credit from scratch.',
        descriptionEs: 'Cómo establecer y construir crédito empresarial desde cero.',
        category: 'business_credit',
        level: 'intermediate',
        duration: 75,
        isPublished: false,
        isFree: false,
        price: 79.99,
      },
    ]

    const createdCourses = []
    for (const course of courses) {
      const c = await db.course.create({
        data: {
          ...course,
          createdBy: admin.id,
        },
      })
      createdCourses.push(c)

      // Add lessons to each published course
      if (c.isPublished) {
        await db.lesson.createMany({
          data: [
            { courseId: c.id, titleEn: 'Introduction', titleEs: 'Introducción', order: 1, duration: 10, isPublished: true },
            { courseId: c.id, titleEn: 'Core Concepts', titleEs: 'Conceptos Clave', order: 2, duration: 15, isPublished: true },
            { courseId: c.id, titleEn: 'Practical Application', titleEs: 'Aplicación Práctica', order: 3, duration: 20, isPublished: true },
            { courseId: c.id, titleEn: 'Review & Quiz', titleEs: 'Repaso y Examen', order: 4, duration: 10, isPublished: true },
          ],
        })
      }
    }
    results.courses = createdCourses.length

    // 7. Create enrollments
    for (const { client } of clients.slice(0, 4)) {
      const numEnrollments = 1 + Math.floor(Math.random() * 3)
      const shuffledCourses = [...createdCourses].filter((c) => c.isPublished).sort(() => Math.random() - 0.5)

      for (let i = 0; i < numEnrollments && i < shuffledCourses.length; i++) {
        const course = shuffledCourses[i]
        try {
          await db.enrollment.create({
            data: {
              userId: client.userId,
              courseId: course.id,
              status: Math.random() > 0.3 ? 'active' : 'completed',
              progress: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : 100,
              completedAt: Math.random() > 0.3 ? null : new Date(),
            },
          })
        } catch {
          // Skip duplicate enrollments
        }
      }
    }

    // 8. Create conferences
    const conferences = [
      {
        titleEn: 'Monthly Credit Workshop',
        titleEs: 'Taller Mensual de Crédito',
        descriptionEn: 'Join our monthly workshop on credit improvement strategies.',
        descriptionEs: 'Únase a nuestro taller mensual sobre estrategias de mejora de crédito.',
        type: 'workshop',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxAttendees: 50,
        isPublished: true,
      },
      {
        titleEn: 'First-Time Home Buyer Webinar',
        titleEs: 'Seminario Web para Primeros Compradores de Casa',
        descriptionEn: 'Learn about the home buying process after credit repair.',
        descriptionEs: 'Aprenda sobre el proceso de compra de casa después de reparar su crédito.',
        type: 'webinar',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 90,
        maxAttendees: 100,
        isPublished: true,
      },
      {
        titleEn: 'One-on-One Credit Consultation',
        titleEs: 'Consulta de Crédito Individual',
        descriptionEn: 'Personal credit consultation session.',
        descriptionEs: 'Sesión de consulta de crédito personal.',
        type: 'one_on_one',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        maxAttendees: 1,
        isPublished: true,
      },
    ]

    const createdConferences = []
    for (const conf of conferences) {
      const c = await db.conference.create({
        data: {
          ...conf,
          meetingLink: 'https://zoom.us/meeting/' + Math.random().toString(36).substring(7),
        },
      })
      createdConferences.push(c)
    }
    results.conferences = createdConferences.length

    // Register some clients to conferences
    for (const { client } of clients.slice(0, 3)) {
      const conf = createdConferences[Math.floor(Math.random() * createdConferences.length)]
      try {
        await db.conferenceRegistration.create({
          data: {
            userId: client.userId,
            conferenceId: conf.id,
            status: 'registered',
          },
        })
      } catch {
        // Skip duplicate registrations
      }
    }

    // 9. Create appointments
    const appointmentTypes = ['consultation', 'follow_up', 'review', 'enrollment']
    const appointmentStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled']

    for (const { client } of clients.slice(0, 5)) {
      const numAppointments = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numAppointments; i++) {
        const daysOffset = i === 0
          ? Math.floor(Math.random() * 7) + 1  // upcoming
          : -Math.floor(Math.random() * 30)     // past
        const agent = Math.random() > 0.5 ? agent1 : agent2

        await db.appointment.create({
          data: {
            clientId: client.userId,
            agentId: agent.id,
            title: `${appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)]} with ${client.user.name}`,
            description: 'Discuss credit repair progress and next steps.',
            date: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000),
            duration: [30, 45, 60][Math.floor(Math.random() * 3)],
            type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
            status: daysOffset > 0
              ? ['scheduled', 'confirmed'][Math.floor(Math.random() * 2)]
              : appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)],
            meetingLink: 'https://zoom.us/meeting/' + Math.random().toString(36).substring(7),
          },
        })
      }
    }
    results.appointments = true

    // 10. Create messages
    const messageSubjects = [
      'Credit Report Update', 'Dispute Status Change', 'Welcome to Rey Smart Solution',
      'Appointment Confirmation', 'Document Request', 'Payment Receipt',
    ]

    for (let i = 0; i < 10; i++) {
      const senderIsAdmin = Math.random() > 0.5
      const client = clients[Math.floor(Math.random() * clients.length)]

      await db.message.create({
        data: {
          senderId: senderIsAdmin ? admin.id : client.user.id,
          receiverId: senderIsAdmin ? client.user.id : admin.id,
          subject: messageSubjects[Math.floor(Math.random() * messageSubjects.length)],
          content: `This is a sample message regarding your credit repair account. Please review the details and let us know if you have any questions.`,
          isRead: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? new Date() : null,
        },
      })
    }
    results.messages = 10

    // 11. Create documents
    const documentTypes = ['id_proof', 'address_proof', 'credit_report', 'dispute_letter', 'other']
    for (const { client } of clients) {
      const numDocs = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numDocs; i++) {
        await db.document.create({
          data: {
            clientId: client.id,
            name: `${documentTypes[Math.floor(Math.random() * documentTypes.length)].replace('_', ' ')} - ${client.user.name}`,
            type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
            fileUrl: `/uploads/${client.id}/document_${i + 1}.pdf`,
            fileSize: Math.floor(Math.random() * 5000000) + 100000,
            mimeType: 'application/pdf',
          },
        })
      }
    }
    results.documents = true

    // 12. Create invoices and payments
    for (const { client } of clients) {
      const invoiceAmount = 99 + Math.floor(Math.random() * 400)
      const invoice = await db.invoice.create({
        data: {
          userId: client.userId,
          clientId: client.id,
          amount: invoiceAmount,
          status: Math.random() > 0.3 ? 'paid' : 'pending',
          dueDate: new Date(Date.now() + (Math.random() > 0.5 ? 30 : -10) * 24 * 60 * 60 * 1000),
          items: JSON.stringify([
            { description: 'Credit Repair Monthly Fee', amount: 99 },
            { description: 'Dispute Letter Generation', amount: invoiceAmount - 99 },
          ]),
          notes: 'Monthly credit repair service',
          paidDate: Math.random() > 0.3 ? new Date() : null,
        },
      })

      if (invoice.status === 'paid') {
        await db.payment.create({
          data: {
            invoiceId: invoice.id,
            clientId: client.id,
            amount: invoiceAmount,
            method: ['credit_card', 'bank_transfer', 'cash'][Math.floor(Math.random() * 3)],
            status: 'completed',
            transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
          },
        })
      }
    }
    results.invoices = true
    results.payments = true

    // 13. Create company settings
    await db.companySettings.create({
      data: {
        companyName: 'Rey Smart Solution',
        phone: '(407) 432-8872',
        email: 'info@reysmartsolution.com',
        address: '7800 S US Hwy 17/92, Ste 194, Fern Park, FL 32730',
        website: 'https://reysmartsolution.com',
        primaryColor: '#0f766e',
        accentColor: '#14b8a6',
        enableEmail: true,
        autoReminders: true,
      },
    })
    results.settings = true

    // 14. Create activities
    await db.activity.createMany({
      data: [
        { userId: admin.id, action: 'system_init', description: 'System initialized and seeded' },
        { userId: admin.id, action: 'client_created', description: 'Onboarded new client Carlos Martinez' },
        { userId: agent1.id, action: 'dispute_sent', description: 'Sent dispute letter to Equifax' },
        { userId: agent2.id, action: 'dispute_response', description: 'Received dispute response from TransUnion' },
        { userId: admin.id, action: 'course_published', description: 'Published course: Credit Score Fundamentals' },
        { userId: agent1.id, action: 'appointment_completed', description: 'Completed consultation with Sarah Johnson' },
        { userId: agent2.id, action: 'invoice_created', description: 'Created monthly invoice for Emily Davis' },
      ],
    })
    results.activities = 7

    // 15. Create notifications
    await db.notification.createMany({
      data: [
        { userId: admin.id, title: 'Welcome!', message: 'Welcome to Rey Smart Solution CRM. Your system is ready.', type: 'success' },
        { userId: admin.id, title: 'New Client', message: 'A new client has been registered and needs review.', type: 'info' },
        { userId: agent1.id, title: 'Dispute Response', titleEs: 'Respuesta de Disputa', message: 'You have a new dispute response to review.', messageEs: 'Tiene una nueva respuesta de disputa para revisar.', type: 'info' },
        { userId: agent2.id, title: 'Appointment Tomorrow', titleEs: 'Cita Mañana', message: 'You have an appointment scheduled for tomorrow.', messageEs: 'Tiene una cita programada para mañana.', type: 'warning' },
      ],
    })
    results.notifications = 4

    return jsonResponse({
      message: 'Database seeded successfully!',
      stats: results,
      credentials: {
        admin: { email: 'admin@reysmartsolution.com', password: 'Admin123!' },
        agent: { email: 'maria@reysmartsolution.com', password: 'Agent123!' },
        client: { email: 'carlos@email.com', password: 'Client123!' },
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return errorResponse('Internal server error during seed: ' + String(error), 500)
  }
}
