'use client';

import { useState, useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigation-store';
import { LandingPage } from '@/components/landing/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { LeadsPage } from '@/components/leads/LeadsPage';
import { ClientsPage } from '@/components/clients/ClientsPage';
import { ClientDetailPage } from '@/components/clients/ClientDetailPage';
import { DisputesPage } from '@/components/disputes/DisputesPage';
import { CoursesPage } from '@/components/courses/CoursesPage';
import { ConferencesPage } from '@/components/conferences/ConferencesPage';
import { AppointmentsPage } from '@/components/appointments/AppointmentsPage';
import { MessagesPage } from '@/components/messages/MessagesPage';
import { BillingPage } from '@/components/billing/BillingPage';
import { FinancePage } from '@/components/finance/FinancePage';
import { QuickBooksSettings } from '@/components/settings/QuickBooksSettings';
import { PaymentMethodsPage } from '@/components/settings/PaymentMethodsPage';
import { GoHighLevelSettings } from '@/components/settings/GoHighLevelSettings';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ClientPortalPage } from '@/components/portal/ClientPortalPage';

export default function Home() {
  const currentView = useNavigationStore((s) => s.currentView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show landing immediately on first render (avoids spinner stall)
  if (!mounted) {
    return <LandingPage />;
  }

  // Landing page (no auth needed)
  if (currentView === 'landing') {
    return <LandingPage />;
  }

  // All authenticated views (FREE ACCESS - no auth check)
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardPage />;
      case 'leads': return <LeadsPage />;
      case 'clients': return <ClientsPage />;
      case 'client-detail': return <ClientDetailPage />;
      case 'disputes': case 'dispute-detail': return <DisputesPage />;
      case 'courses': case 'course-detail': return <CoursesPage />;
      case 'conferences': return <ConferencesPage />;
      case 'appointments': return <AppointmentsPage />;
      case 'messages': return <MessagesPage />;
      case 'billing': return <BillingPage />;
      case 'finance': return <FinancePage />;
      case 'quickbooks': return <QuickBooksSettings />;
      case 'payment-methods': return <PaymentMethodsPage />;
      case 'gohighlevel': return <GoHighLevelSettings />;
      case 'settings': case 'team': return <SettingsPage />;
      case 'client-portal':
      case 'client-portal-credit':
      case 'client-portal-disputes':
      case 'client-portal-courses':
      case 'client-portal-messages':
      case 'client-portal-schedule':
        return <ClientPortalPage />;
      default: return <DashboardPage />;
    }
  };

  return <AppLayout>{renderView()}</AppLayout>;
}
