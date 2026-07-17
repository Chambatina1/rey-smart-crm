'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  TrendingUp, TrendingDown, Wallet, Percent, Plus, Loader2, RefreshCw, DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

interface Entry {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  qbSynced: boolean;
}
interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  incomeCount: number;
  expenseCount: number;
}

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function FinancePage() {
  const { token, language } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'income',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const t = (en: string, es: string) => (language === 'es' ? es : en);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      const res = await fetch(`/api/finance?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntries(data.entries || []);
      setSummary(data.summary || null);
    } catch {
      toast.error(t('Failed to load finance data', 'Error al cargar datos financieros'));
    } finally {
      setLoading(false);
    }
  }, [filterType, token, language]);

  useEffect(() => { fetchFinance(); /* eslint-disable-next-line */ }, [filterType]);

  const handleAdd = async () => {
    if (!form.category || !form.description || !form.amount) {
      toast.error(t('Fill all required fields', 'Completa todos los campos requeridos'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(t('Entry added', 'Entrada agregada'));
      setShowAdd(false);
      setForm({ type: 'income', category: '', description: '', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });
      fetchFinance();
    } catch {
      toast.error(t('Failed to add entry', 'Error al agregar entrada'));
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    {
      label: t('Total Income', 'Ingresos Totales'),
      value: summary?.totalIncome ?? 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: t('Total Expenses', 'Gastos Totales'),
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      label: t('Net Profit', 'Utilidad Neta'),
      value: summary?.netProfit ?? 0,
      icon: Wallet,
      color: (summary?.netProfit ?? 0) >= 0 ? 'text-[var(--color-accent)]' : 'text-red-600',
      bg: 'bg-[var(--color-accent)]/10',
    },
    {
      label: t('Profit Margin', 'Margen de Utilidad'),
      value: summary?.margin ?? 0,
      icon: Percent,
      color: 'text-[var(--color-gold)]',
      bg: 'bg-[var(--color-gold)]/10',
      isPercent: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Wallet className="h-6 w-6 text-[var(--color-gold)]" />
            {t('Finance', 'Finanzas')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Track income, expenses, and profitability', 'Registra ingresos, gastos y rentabilidad')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchFinance} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh', 'Actualizar')}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="bg-[var(--color-accent)] text-white hover:brightness-110">
            <Plus className="mr-2 h-4 w-4" />
            {t('Add Entry', 'Nueva Entrada')}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <p className={`mt-2 text-2xl font-bold ${s.color}`}>
                  {s.isPercent ? `${s.value}%` : fmt(s.value)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{t('Filter', 'Filtro')}:</span>
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filterType === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? t('All', 'Todos') : f === 'income' ? t('Income', 'Ingresos') : t('Expenses', 'Gastos')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <DollarSign className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {t('No entries yet. Add your first income or expense.', 'Sin entradas todavía. Agrega tu primer ingreso o gasto.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Date', 'Fecha')}</TableHead>
                    <TableHead>{t('Type', 'Tipo')}</TableHead>
                    <TableHead>{t('Category', 'Categoría')}</TableHead>
                    <TableHead>{t('Description', 'Descripción')}</TableHead>
                    <TableHead className="text-right">{t('Amount', 'Monto')}</TableHead>
                    <TableHead>{t('QB', 'QB')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(e.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={e.type === 'income' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}>
                          {e.type === 'income' ? t('Income', 'Ingreso') : t('Expense', 'Gasto')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{e.category}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{e.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${e.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {e.type === 'income' ? '+' : '−'}{fmt(e.amount)}
                      </TableCell>
                      <TableCell>
                        {e.qbSynced ? (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600">✓ QB</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add entry dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Add Finance Entry', 'Nueva Entrada Financiera')}</DialogTitle>
            <DialogDescription>
              {t('Record an income or expense transaction.', 'Registra una transacción de ingreso o gasto.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">{t('Type', 'Tipo')} *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">📈 {t('Income', 'Ingreso')}</SelectItem>
                  <SelectItem value="expense">📉 {t('Expense', 'Gasto')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Category', 'Categoría')} *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('Select category', 'Selecciona categoría')} />
                </SelectTrigger>
                <SelectContent>
                  {form.type === 'income' ? (
                    <>
                      <SelectItem value="subscription">{t('Subscription', 'Suscripción')}</SelectItem>
                      <SelectItem value="setup_fee">{t('Setup Fee', 'Cuota de Inicio')}</SelectItem>
                      <SelectItem value="consultation">{t('Consultation', 'Consulta')}</SelectItem>
                      <SelectItem value="other_income">{t('Other Income', 'Otro Ingreso')}</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="salary">{t('Salaries', 'Salarios')}</SelectItem>
                      <SelectItem value="software">{t('Software', 'Software')}</SelectItem>
                      <SelectItem value="marketing">{t('Marketing', 'Marketing')}</SelectItem>
                      <SelectItem value="office">{t('Office', 'Oficina')}</SelectItem>
                      <SelectItem value="refund">{t('Refund', 'Reembolso')}</SelectItem>
                      <SelectItem value="other_expense">{t('Other Expense', 'Otro Gasto')}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Description', 'Descripción')} *</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={form.type === 'income' ? t('e.g. Plan Protección - Monthly', 'ej. Plan Protección - Mensual') : t('e.g. Zoom subscription', 'ej. Suscripción Zoom')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">{t('Amount', 'Monto')} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">{t('Date', 'Fecha')}</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Notes (optional)', 'Notas (opcional)')}</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>{t('Cancel', 'Cancelar')}</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('Add Entry', 'Agregar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
