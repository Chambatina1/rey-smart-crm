'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoginPage } from '@/components/landing/LoginPage';
import { RegisterPage } from '@/components/landing/RegisterPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-teal-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const currentView = useNavigationStore((s) => s.currentView);
  const mounted = useIsMounted();
  const checkAuthCalled = useRef(false);

  useEffect(() => {
    if (!checkAuthCalled.current) {
      checkAuthCalled.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && (currentView === 'landing' || currentView === 'login' || currentView === 'register')) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'client') {
        useNavigationStore.getState().navigate('client-portal');
      } else {
        useNavigationStore.getState().navigate('dashboard');
      }
    }
  }, [isAuthenticated, currentView]);

  if (!mounted || isLoading) return <LoadingScreen />;

  // Public views
  if (!isAuthenticated) {
    switch (currentView) {
      case 'login': return <LoginPage />;
      case 'register': return <RegisterPage />;
      default: return <LandingPage />;
    }
  }

  // Authenticated views
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardPage />;
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
