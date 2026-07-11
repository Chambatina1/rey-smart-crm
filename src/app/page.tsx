'use client';

import { useEffect, useSyncExternalStore } from 'react';
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
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ClientPortalPage } from '@/components/portal/ClientPortalPage';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function Home() {
  const currentView = useNavigationStore((s) => s.currentView);
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );
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
