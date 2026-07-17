'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useT } from '@/hooks/useT';
import { useNavigationStore, type AppView } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  GraduationCap,
  Calendar,
  CalendarDays,
  MessageSquare,
  FileText,
  DollarSign,
  Settings,
  Shield,
  Menu,
  Search,
  Bell,
  Globe,
  LogOut,
  User,
  CreditCard,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  Inbox,
  Wallet,
  Plug,
  Zap,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view: AppView;
  badge?: number;
}

const adminNavItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Leads', icon: Inbox, view: 'leads', badge: 0 },
  { label: 'Clients', icon: Users, view: 'clients', badge: 0 },
  { label: 'Disputes', icon: ShieldAlert, view: 'disputes', badge: 3 },
  { label: 'Courses', icon: GraduationCap, view: 'courses' },
  { label: 'Events', icon: Calendar, view: 'conferences' },
  { label: 'Appointments', icon: CalendarDays, view: 'appointments' },
  { label: 'Messages', icon: MessageSquare, view: 'messages', badge: 5 },
  { label: 'Documents', icon: FileText, view: 'documents' },
  { label: 'Billing', icon: DollarSign, view: 'billing' },
  { label: 'Finance', icon: Wallet, view: 'finance' },
  { label: 'Payment Methods', icon: CreditCard, view: 'payment-methods' },
  { label: 'QuickBooks', icon: Plug, view: 'quickbooks' },
  { label: 'GoHighLevel', icon: Zap, view: 'gohighlevel' },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

const clientNavItems: SidebarItem[] = [
  { label: 'Home', icon: Home, view: 'client-portal' },
  { label: 'My Credit', icon: CreditCard, view: 'client-portal-credit' },
  { label: 'My Disputes', icon: Shield, view: 'client-portal-disputes' },
  { label: 'My Courses', icon: BookOpen, view: 'client-portal-courses' },
  { label: 'Messages', icon: MessageSquare, view: 'client-portal-messages', badge: 2 },
  { label: 'Schedule', icon: CalendarDays, view: 'client-portal-schedule' },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { t, language, setLanguage } = useT();
  const { currentView, navigate, sidebarOpen, setSidebarOpen } = useNavigationStore();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // Default demo user for free access mode
  const displayName = user?.name || 'Rey Smart Solution';
  const displayEmail = user?.email || 'info@reysmartsolution.com';
  const isClient = user?.role === 'client';
  const navItems = isClient ? clientNavItems : adminNavItems;

  /* responsive: collapse sidebar on small screens */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
        setSidebarOpen(false);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setSidebarOpen]);

  /* derive page title from current view */
  const viewTitles: Record<AppView, string> = {
    landing: '',
    login: t.auth.login,
    register: t.auth.register,
    dashboard: t.nav.dashboard,
    leads: language === 'es' ? 'Prospectos' : 'Leads',
    clients: t.nav.clients,
    'client-detail': t.nav.clients,
    disputes: t.nav.disputes,
    'dispute-detail': t.nav.disputes,
    courses: t.nav.courses,
    'course-detail': t.nav.courses,
    conferences: t.nav.conferences,
    appointments: t.nav.appointments,
    messages: t.nav.messages,
    documents: t.nav.documents,
    billing: t.nav.billing,
    finance: language === 'es' ? 'Finanzas' : 'Finance',
    'payment-methods': language === 'es' ? 'Formas de Pago' : 'Payment Methods',
    quickbooks: 'QuickBooks',
    gohighlevel: 'GoHighLevel',
    settings: t.nav.settings,
    team: t.nav.settings,
    'client-portal': isClient ? (language === 'es' ? 'Mi Panel' : 'My Dashboard') : t.nav.dashboard,
    'client-portal-credit': t.nav.myCredit,
    'client-portal-disputes': t.nav.myDisputes,
    'client-portal-courses': t.nav.courses,
    'client-portal-messages': t.nav.messages,
    'client-portal-schedule': t.nav.appointments,
  };

  const pageTitle = viewTitles[currentView] || '';

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'RS';

  const roleBadgeColor = user?.role === 'admin'
    ? 'bg-red-100 text-red-700'
    : user?.role === 'agent'
      ? 'bg-teal-100 text-teal-700'
      : user?.role === 'client'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-teal-100 text-teal-700';

  const displayRole = user?.role || 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-sm text-gray-900 truncate">Rey Smart Solution</span>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-600' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="ml-auto bg-teal-600 text-white text-xs px-1.5 py-0 h-5 min-w-[20px] justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-teal-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User section + collapse toggle */}
        <div className="border-t border-gray-100">
          {!collapsed && (
            <div className="px-3 py-3 flex items-center gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadgeColor}`}>
                  {user?.role || 'admin'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[260px] bg-white shadow-xl z-50 flex flex-col animate-slide-in">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm text-gray-900">Rey Smart Solution</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => { navigate(item.view); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-600' : ''}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="ml-auto bg-teal-600 text-white text-xs px-1.5 py-0 h-5 min-w-[20px] justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile user section */}
            <div className="border-t border-gray-100 px-3 py-3 flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadgeColor}`}>
                  {user?.role || 'admin'}
                </span>
              </div>
              <button
                onClick={() => { navigate('landing'); setSidebarOpen(false); }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 absolute left-3 text-gray-400" />
              <Input
                placeholder={`${t.common.search}...`}
                className="pl-9 w-56 h-9 text-sm bg-gray-50 border-gray-200"
              />
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'ES'}</span>
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user?.name || 'Admin'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('settings')}>
                  <User className="w-4 h-4 mr-2" />
                  {t.common.profile}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t.nav.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('landing')}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.common.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
