'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, CreditCard, TrendingUp, Plus, Download, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/useT';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 12400, expenses: 4200 },
  { month: 'Feb', revenue: 15600, expenses: 5100 },
  { month: 'Mar', revenue: 14200, expenses: 4800 },
  { month: 'Apr', revenue: 18900, expenses: 6200 },
  { month: 'May', revenue: 21300, expenses: 7100 },
  { month: 'Jun', revenue: 18450, expenses: 5900 },
];

const invoices = [
  { id: 'INV-001', client: 'Maria Rodriguez', amount: 450, status: 'paid', dueDate: '2024-06-01', paidDate: '2024-05-28' },
  { id: 'INV-002', client: 'James Wilson', amount: 750, status: 'pending', dueDate: '2024-06-15', paidDate: null },
  { id: 'INV-003', client: 'Sarah Johnson', amount: 350, status: 'paid', dueDate: '2024-05-20', paidDate: '2024-05-18' },
  { id: 'INV-004', client: 'Carlos Hernandez', amount: 600, status: 'overdue', dueDate: '2024-05-10', paidDate: null },
  { id: 'INV-005', client: 'Emily Chen', amount: 450, status: 'paid', dueDate: '2024-05-30', paidDate: '2024-05-29' },
  { id: 'INV-006', client: 'David Brown', amount: 900, status: 'pending', dueDate: '2024-06-25', paidDate: null },
  { id: 'INV-007', client: 'Ana Martinez', amount: 350, status: 'paid', dueDate: '2024-05-15', paidDate: '2024-05-14' },
  { id: 'INV-008', client: 'Robert Taylor', amount: 550, status: 'pending', dueDate: '2024-07-01', paidDate: null },
];

const payments = [
  { id: 'TXN-001', client: 'Maria Rodriguez', amount: 450, method: 'Credit Card', status: 'completed', date: '2024-05-28' },
  { id: 'TXN-002', client: 'Sarah Johnson', amount: 350, method: 'Bank Transfer', status: 'completed', date: '2024-05-18' },
  { id: 'TXN-003', client: 'Emily Chen', amount: 450, method: 'Credit Card', status: 'completed', date: '2024-05-29' },
  { id: 'TXN-004', client: 'Ana Martinez', amount: 350, method: 'Bank Transfer', status: 'completed', date: '2024-05-14' },
  { id: 'TXN-005', client: 'James Wilson', amount: 750, method: 'Credit Card', status: 'pending', date: '2024-06-10' },
  { id: 'TXN-006', client: 'David Brown', amount: 450, method: 'Cash', status: 'completed', date: '2024-05-22' },
];

const statusColor = (s: string) => {
  switch (s) {
    case 'paid': case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'pending': return 'bg-amber-100 text-amber-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'failed': case 'refunded': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function BillingPage() {
  const { t } = useT();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const filteredInvoices = filterStatus === 'all' ? invoices : invoices.filter(i => i.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t.billing.title}</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="w-4 h-4 mr-2" />{t.billing.createInvoice}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.billing.createInvoice}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>{t.clients.name}</Label><Select><SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger><SelectContent><SelectItem value="maria">Maria Rodriguez</SelectItem><SelectItem value="james">James Wilson</SelectItem><SelectItem value="sarah">Sarah Johnson</SelectItem></SelectContent></Select></div>
              <div><Label>{t.billing.amount}</Label><Input type="number" placeholder="$0.00" /></div>
              <div><Label>{t.billing.dueDate}</Label><Input type="date" /></div>
              <div><Label>Items</Label><Textarea placeholder="Itemized list..." /></div>
              <div><Label>{t.clients.notes}</Label><Textarea /></div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setCreateOpen(false)}>{t.common.save}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t.billing.paid, value: totalPaid, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t.billing.pending, value: totalPending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: t.billing.overdue, value: totalOverdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((card) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`p-3 rounded-full ${card.bg}`}><card.icon className={`w-6 h-6 ${card.color}`} /></div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold">${card.value.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">{t.billing.invoices}</TabsTrigger>
          <TabsTrigger value="payments">{t.billing.payments}</TabsTrigger>
          <TabsTrigger value="revenue">{t.billing.revenue}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t.billing.invoices}</CardTitle>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all}</SelectItem>
                    <SelectItem value="paid">{t.billing.paid}</SelectItem>
                    <SelectItem value="pending">{t.billing.pending}</SelectItem>
                    <SelectItem value="overdue">{t.billing.overdue}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>{t.clients.name}</TableHead>
                      <TableHead>{t.billing.amount}</TableHead>
                      <TableHead>{t.disputes.status}</TableHead>
                      <TableHead>{t.billing.dueDate}</TableHead>
                      <TableHead>{t.billing.paidDate}</TableHead>
                      <TableHead>{t.clients.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.id}</TableCell>
                        <TableCell>{inv.client}</TableCell>
                        <TableCell>${inv.amount}</TableCell>
                        <TableCell><Badge className={statusColor(inv.status)}>{t.billing[inv.status as keyof typeof t.billing] || inv.status}</Badge></TableCell>
                        <TableCell>{inv.dueDate}</TableCell>
                        <TableCell>{inv.paidDate || '—'}</TableCell>
                        <TableCell><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t.billing.payments}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.billing.transactionId}</TableHead>
                    <TableHead>{t.clients.name}</TableHead>
                    <TableHead>{t.billing.amount}</TableHead>
                    <TableHead>{t.billing.method}</TableHead>
                    <TableHead>{t.disputes.status}</TableHead>
                    <TableHead>{t.billing.paidDate}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.id}</TableCell>
                      <TableCell>{p.client}</TableCell>
                      <TableCell>${p.amount}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell><Badge className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                      <TableCell>{p.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t.billing.revenueChart}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-teal-50"><p className="text-sm text-gray-500">This Month</p><p className="text-2xl font-bold text-teal-700">$18,450</p></div>
                <div className="p-4 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">Last Month</p><p className="text-2xl font-bold">$21,300</p></div>
                <div className="p-4 rounded-lg bg-amber-50"><p className="text-sm text-gray-500">Change</p><p className="text-2xl font-bold text-amber-600">-13.4%</p></div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0f766e" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#059669" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
