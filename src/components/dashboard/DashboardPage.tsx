'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  ShieldAlert,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  UserPlus,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/* ─── Demo Data ─────────────────────────────────────────── */

const revenueData = [
  { month: 'Jan', revenue: 14200, expenses: 8900 },
  { month: 'Feb', revenue: 15800, expenses: 9200 },
  { month: 'Mar', revenue: 13500, expenses: 8700 },
  { month: 'Apr', revenue: 17200, expenses: 10100 },
  { month: 'May', revenue: 16800, expenses: 9800 },
  { month: 'Jun', revenue: 18450, expenses: 10500 },
];

const disputePieData = [
  { name: 'In Progress', value: 45, color: '#0d9488' },
  { name: 'Completed', value: 30, color: '#059669' },
  { name: 'Draft', value: 15, color: '#f59e0b' },
  { name: 'Sent', value: 10, color: '#3b82f6' },
];

const recentActivities = [
  { id: '1', icon: UserPlus, desc: 'New client registered – James Wilson', time: '5m ago' },
  { id: '2', icon: FileText, desc: 'Dispute sent to Equifax for Maria Garcia', time: '22m ago' },
  { id: '3', icon: DollarSign, desc: 'Payment received – $450 from Ana Martinez', time: '1h ago' },
  { id: '4', icon: ShieldAlert, desc: 'Dispute response received from TransUnion', time: '2h ago' },
  { id: '5', icon: MessageSquare, desc: 'New message from Carlos Rodriguez', time: '3h ago' },
  { id: '6', icon: CreditCard, desc: 'Invoice #1042 paid by Sofia Hernandez', time: '4h ago' },
];

const upcomingAppointments = [
  { id: '1', client: 'Maria Garcia', date: 'Today, 2:00 PM', type: 'Consultation' },
  { id: '2', client: 'Carlos Rodriguez', date: 'Today, 3:30 PM', type: 'Follow Up' },
  { id: '3', client: 'Ana Martinez', date: 'Tomorrow, 10:00 AM', type: 'Credit Review' },
  { id: '4', client: 'Robert Lopez', date: 'Tomorrow, 1:00 PM', type: 'Enrollment' },
];

/* ─── Component ────────────────────────────────────────── */

export function DashboardPage() {
  const { t } = useT();
  const navigate = useNavigationStore((s) => s.navigate);
  const [mounted, setMounted] = useState(false);
  if (!mounted) {
    // ensure motion animations run client-side only
    setTimeout(() => setMounted(true), 0);
  }

  const statCards = [
    {
      label: t.dashboard.totalClients,
      value: '248',
      trend: '+12%',
      trendUp: true,
      icon: Users,
      bg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      label: t.dashboard.activeDisputes,
      value: '57',
      trend: '+8%',
      trendUp: true,
      icon: ShieldAlert,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: t.dashboard.pendingTasks,
      value: '12',
      trend: '-3%',
      trendUp: false,
      icon: Clock,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: t.dashboard.monthlyRevenue,
      value: '$18,450',
      trend: '+15%',
      trendUp: true,
      icon: DollarSign,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  const quickActions = [
    { label: t.dashboard.newClient, icon: UserPlus, view: 'clients' as const },
    { label: t.dashboard.newDispute, icon: FileText, view: 'disputes' as const },
    { label: t.dashboard.scheduleAppointment, icon: Calendar, view: 'appointments' as const },
    { label: 'Generate Reports', icon: BarChart3, view: 'billing' as const },
  ];

  const apptBadgeColor = (type: string) => {
    switch (type) {
      case 'Consultation': return 'bg-teal-100 text-teal-700';
      case 'Follow Up': return 'bg-blue-100 text-blue-700';
      case 'Credit Review': return 'bg-amber-100 text-amber-700';
      case 'Enrollment': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const fadeUp = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.35 },
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Row: 4 Stat Cards ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} {...fadeUp(i)}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${card.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                      {card.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{card.trend}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Middle Row: Charts ─────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Overview (2/3) */}
        <motion.div {...fadeUp(4)} className="lg:col-span-2">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t.dashboard.revenueChart}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Expenses']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: '#0d9488', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 3 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dispute Progress Donut (1/3) */}
        <motion.div {...fadeUp(5)}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t.dashboard.disputeProgress}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={disputePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {disputePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mt-2">
                {disputePieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 text-xs">{item.name}</span>
                    <span className="font-semibold text-gray-900 text-xs ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row: 3 columns ─────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div {...fadeUp(6)}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{t.dashboard.recentActivity}</CardTitle>
                <Button variant="ghost" size="sm" className="text-teal-600 text-xs">{t.dashboard.viewAll}</Button>
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <ScrollArea className="max-h-80">
                <div className="space-y-1 px-4 pb-4">
                  {recentActivities.map((a) => {
                    const Icon = a.icon;
                    return (
                      <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-700 leading-snug">{a.desc}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div {...fadeUp(7)}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{t.dashboard.upcomingAppointments}</CardTitle>
                <Button variant="ghost" size="sm" className="text-teal-600 text-xs">{t.dashboard.viewAll}</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{appt.client}</p>
                      <p className="text-xs text-gray-500">{appt.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`${apptBadgeColor(appt.type)} text-[10px] px-1.5 py-0`}>
                        {appt.type}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-teal-600">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...fadeUp(8)}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t.dashboard.quickActions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto flex-col gap-2 py-5 rounded-xl border-dashed border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-700 hover:text-teal-800 transition-all"
                      onClick={() => navigate(action.view)}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
