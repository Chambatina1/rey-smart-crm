'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  MessageSquare,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  Download,
  Pencil,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileBarChart,
  FileSpreadsheet,
} from 'lucide-react';

/* ─── Demo Data ─────────────────────────────────────────── */

const demoClient = {
  id: '1',
  name: 'Maria Garcia',
  email: 'maria.garcia@email.com',
  phone: '(407) 123-4567',
  creditScore: 642,
  status: 'active',
  ssnLast4: '4567',
  dob: '1985-03-15',
  address: '123 Main Street',
  city: 'Orlando',
  state: 'FL',
  zip: '32801',
  startDate: '2024-01-15',
};

const bureauReports = [
  { bureau: 'Equifax', score: 638, lastPull: 'Jun 10, 2024', change: +24, color: '#0d9488' },
  { bureau: 'Experian', score: 655, lastPull: 'Jun 8, 2024', change: +18, color: '#059669' },
  { bureau: 'TransUnion', score: 632, lastPull: 'Jun 12, 2024', change: +31, color: '#14b8a6' },
];

const demoDisputes = [
  { id: 'd1', item: 'Late Payment – Bank of America', bureau: 'Equifax', status: 'in_progress', round: 1, date: 'Jun 15, 2024' },
  { id: 'd2', item: 'Collection – Capitol One', bureau: 'Experian', status: 'completed', round: 1, date: 'May 20, 2024' },
  { id: 'd3', item: 'Incorrect Balance – Wells Fargo', bureau: 'TransUnion', status: 'sent', round: 2, date: 'Jun 1, 2024' },
  { id: 'd4', item: 'Charge Off – Chase', bureau: 'Equifax', status: 'draft', round: 1, date: 'Jun 22, 2024' },
];

const demoDocuments = [
  { id: 'doc1', name: 'Government ID - Front', type: 'Identification', size: '2.4 MB', date: 'Jan 15, 2024' },
  { id: 'doc2', name: 'Government ID - Back', type: 'Identification', size: '2.1 MB', date: 'Jan 15, 2024' },
  { id: 'doc3', name: 'Utility Bill - Electric', type: 'Proof of Address', size: '890 KB', date: 'Jan 20, 2024' },
  { id: 'doc4', name: 'Credit Report - Equifax', type: 'Credit Report', size: '1.8 MB', date: 'Jun 10, 2024' },
  { id: 'doc5', name: 'Dispute Letter - Round 1', type: 'Dispute Letter', size: '450 KB', date: 'Jun 15, 2024' },
  { id: 'doc6', name: 'Payment Receipt - June', type: 'Payment', size: '120 KB', date: 'Jun 1, 2024' },
];

const demoInvoices = [
  { id: 'inv1', number: 'INV-1042', amount: '$450.00', date: 'Jun 1, 2024', dueDate: 'Jun 15, 2024', status: 'paid' },
  { id: 'inv2', number: 'INV-1058', amount: '$450.00', date: 'Jul 1, 2024', dueDate: 'Jul 15, 2024', status: 'pending' },
  { id: 'inv3', number: 'INV-1010', amount: '$450.00', date: 'May 1, 2024', dueDate: 'May 15, 2024', status: 'paid' },
  { id: 'inv4', number: 'INV-0985', amount: '$450.00', date: 'Apr 1, 2024', dueDate: 'Apr 15, 2024', status: 'paid' },
];

const demoNotes = [
  { id: 'n1', author: 'Admin', date: '2024-01-15T10:00:00Z', content: 'Client enrolled in credit repair program. Initial credit score: 489. Set up dispute strategy for all three bureaus.' },
  { id: 'n2', author: 'Agent Smith', date: '2024-02-10T14:30:00Z', content: 'First round of disputes sent to all bureaus. Identified 8 negative items across reports. Focused on late payments and collections first.' },
  { id: 'n3', author: 'Agent Smith', date: '2024-05-25T09:15:00Z', content: '2 items removed from TransUnion. Score improved to 642. Client is very happy with the progress. Continuing with Equifax disputes.' },
  { id: 'n4', author: 'Admin', date: '2024-06-01T11:00:00Z', content: 'Client completed Credit Basics course. Recommended to schedule follow-up consultation to review progress.' },
  { id: 'n5', author: 'Agent Smith', date: '2024-06-15T16:45:00Z', content: 'Sent second round dispute to Equifax for remaining items. Requested debt validation from collection agencies.' },
];

/* ─── Helpers ───────────────────────────────────────────── */

function disputeStatusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const labelMap: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return <Badge className={`${map[status] || map.draft} text-[11px]`}>{labelMap[status] || status}</Badge>;
}

function invoiceStatusBadge(status: string) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  };
  return <Badge className={`${map[status] || map.pending} text-[11px] capitalize`}>{status}</Badge>;
}

function docTypeBadge(type: string) {
  const map: Record<string, string> = {
    Identification: 'bg-teal-100 text-teal-700',
    'Proof of Address': 'bg-blue-100 text-blue-700',
    'Credit Report': 'bg-amber-100 text-amber-700',
    'Dispute Letter': 'bg-purple-100 text-purple-700',
    Payment: 'bg-emerald-100 text-emerald-700',
  };
  return <Badge className={`${map[type] || 'bg-gray-100 text-gray-600'} text-[11px]`}>{type}</Badge>;
}

/* ─── Component ────────────────────────────────────────── */

export function ClientDetailPage() {
  const { t } = useT();
  const { navigate, selectedClientId } = useNavigationStore();
  const [activeTab, setActiveTab] = useState('overview');

  const c = demoClient;
  const initials = c.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const scoreColor = c.creditScore >= 700 ? 'text-emerald-600' : c.creditScore >= 600 ? 'text-teal-600' : c.creditScore >= 500 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = c.creditScore >= 700 ? 'bg-emerald-100' : c.creditScore >= 600 ? 'bg-teal-100' : c.creditScore >= 500 ? 'bg-amber-100' : 'bg-red-100';
  const scoreLabel = c.creditScore >= 700 ? 'Excellent' : c.creditScore >= 600 ? 'Good' : c.creditScore >= 500 ? 'Fair' : 'Poor';
  const completedDisputes = demoDisputes.filter((d) => d.status === 'completed').length;
  const disputeProgress = Math.round((completedDisputes / demoDisputes.length) * 100);

  const quickStats = [
    { label: 'Disputes Filed', value: demoDisputes.length, icon: FileText, color: 'text-teal-600' },
    { label: 'Items Removed', value: '5', icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Documents', value: demoDocuments.length, icon: FileBarChart, color: 'text-blue-600' },
    { label: 'Score Change', value: '+153', icon: CreditCard, color: 'text-amber-600' },
  ];

  if (!selectedClientId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('clients')}>
          <ArrowLeft className="w-4 h-4 mr-2" />{t.common.back}
        </Button>
        <p className="text-gray-500 mt-4">{t.common.noData}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => navigate('clients')}>
          <ArrowLeft className="w-4 h-4 mr-1" />{t.common.back}
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="text-gray-600">
          <MessageSquare className="w-4 h-4 mr-2" />Message
        </Button>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />{t.disputes.newDispute}
        </Button>
      </motion.div>

      {/* ── Client Header Card ──────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Avatar className="w-20 h-20 border-4 border-teal-100">
                <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{c.name}</h2>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{t.clients.active}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{c.email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{c.phone}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{c.city}, {c.state} {c.zip}</span>
                </div>
              </div>
              {/* Credit Score Circle */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${scoreBg} relative`}>
                  <div className="absolute inset-1.5 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${scoreColor}`}>{c.creditScore}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{scoreLabel}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t.clients.creditScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Quick Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 overflow-x-auto">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="credit" className="text-sm">Credit Reports</TabsTrigger>
            <TabsTrigger value="disputes" className="text-sm">Disputes</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">Documents</TabsTrigger>
            <TabsTrigger value="billing" className="text-sm">Billing</TabsTrigger>
            <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ────────────────────────────── */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Client Info */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.auth.fullName}</p>
                      <p className="font-medium text-gray-900">{c.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.auth.email}</p>
                      <p className="font-medium text-gray-900">{c.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.auth.phone}</p>
                      <p className="font-medium text-gray-900">{c.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.clients.dateOfBirth}</p>
                      <p className="font-medium text-gray-900">{new Date(c.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">SSN (Last 4)</p>
                      <p className="font-medium text-gray-900">***-{c.ssnLast4}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.clients.address}</p>
                      <p className="font-medium text-gray-900">{c.address}, {c.city}, {c.state} {c.zip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Gauge & Progress */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Credit Score Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                          <circle
                            cx="60" cy="60" r="52" fill="none" stroke="#0d9488" strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            strokeDashoffset={`${2 * Math.PI * 52 * (1 - (c.creditScore - 300) / 550)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-3xl font-bold text-teal-600">{c.creditScore}</p>
                          <p className="text-xs text-gray-500">{scoreLabel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 px-4">
                      <span>300</span><span>500</span><span>650</span><span>850</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">{t.dashboard.disputeProgress}</p>
                      <span className="text-sm font-bold text-teal-600">{disputeProgress}%</span>
                    </div>
                    <Progress value={disputeProgress} className="h-2 mb-3" />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-600">{completedDisputes} completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-600">{demoDisputes.length - completedDisputes} pending</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Credit Reports Tab ──────────────────────── */}
          <TabsContent value="credit">
            <div className="grid md:grid-cols-3 gap-6">
              {bureauReports.map((bureau) => (
                <Card key={bureau.bureau} className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${bureau.color}15` }}>
                      <ShieldCheck className="w-7 h-7" style={{ color: bureau.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{bureau.bureau}</h3>
                    <p className="text-4xl font-bold mb-1" style={{ color: bureau.color }}>{bureau.score}</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {bureau.change > 0 && <span className="text-emerald-600 text-sm font-medium">+{bureau.change}</span>}
                      <span className="text-xs text-gray-400">from last pull</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      <Calendar className="w-3 h-3 inline mr-1" />Last pulled: {bureau.lastPull}
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />View Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Disputes Tab ────────────────────────────── */}
          <TabsContent value="disputes">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Client Disputes</CardTitle>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="w-4 h-4 mr-1.5" />New Dispute
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="font-semibold pl-6">Item</TableHead>
                      <TableHead className="font-semibold">Bureau</TableHead>
                      <TableHead className="font-semibold">Round</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoDisputes.map((d) => (
                      <TableRow key={d.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="pl-6">
                          <p className="text-sm font-medium text-gray-900">{d.item}</p>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{d.bureau}</TableCell>
                        <TableCell className="text-sm text-gray-600">R{d.round}</TableCell>
                        <TableCell>{disputeStatusBadge(d.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{d.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Documents Tab ───────────────────────────── */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Documents</CardTitle>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="w-4 h-4 mr-1.5" />Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.size} · {doc.date}</p>
                      </div>
                      <div className="hidden sm:block">{docTypeBadge(doc.type)}</div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-teal-600 shrink-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Billing Tab ─────────────────────────────── */}
          <TabsContent value="billing">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Invoices & Payments</CardTitle>
                  <Button size="sm" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                    <Plus className="w-4 h-4 mr-1.5" />Create Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="font-semibold pl-6">Invoice</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Due Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoInvoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{inv.number}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900">{inv.amount}</TableCell>
                        <TableCell className="text-sm text-gray-500">{inv.date}</TableCell>
                        <TableCell className="text-sm text-gray-500">{inv.dueDate}</TableCell>
                        <TableCell>{invoiceStatusBadge(inv.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notes Tab ───────────────────────────────── */}
          <TabsContent value="notes">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Activity & Notes</CardTitle>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Pencil className="w-4 h-4 mr-1.5" />Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

                  {demoNotes.map((note) => (
                    <div key={note.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-5 w-4 h-4 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {note.author.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{note.author}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
