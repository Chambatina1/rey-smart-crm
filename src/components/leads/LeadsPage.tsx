'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Inbox, Download, Phone, Mail, MapPin, Loader2, RefreshCw, Trash2, MessageSquare,
  Table as TableIcon, Columns3,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── Types ──────────────────────────────────────────────────────── */
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string | null;
  goal: string | null;
  creditScore: string | null;
  message: string | null;
  language: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  notes: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'enrolled', 'lost'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

/* ── status badge colors (premium palette) ──────────────────────── */
const statusStyles: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  qualified: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30',
  enrolled: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-gray-100 text-gray-500 border-gray-200',
};

const priorityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-500',
};

/* ── column dot colors for kanban ─────────────────── */
const statusDotColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  qualified: 'bg-[var(--color-gold)]',
  enrolled: 'bg-green-500',
  lost: 'bg-gray-400',
};

const goalLabels: Record<string, { en: string; es: string }> = {
  credit_repair: { en: 'Credit Repair', es: 'Reparación de Crédito' },
  consolidation: { en: 'Consolidation', es: 'Consolidación' },
  home_buying: { en: 'Home Buying', es: 'Compra de Vivienda' },
  business_credit: { en: 'Business Credit', es: 'Crédito Empresarial' },
  education: { en: 'Education', es: 'Educación' },
};

export function LeadsPage() {
  const { t, language } = useT();
  const { token } = useAuthStore();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  /* ── fetch leads ──────────────────────────────────────────────── */
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/leads?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      toast.error(language === 'es' ? 'Error al cargar prospectos' : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, token, language]);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  /* debounce search */
  useEffect(() => {
    const timer = setTimeout(() => fetchLeads(), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* ── stats ────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === 'new').length;
    const qualified = leads.filter((l) => l.status === 'qualified').length;
    const enrolled = leads.filter((l) => l.status === 'enrolled').length;
    return { total, newCount, qualified, enrolled };
  }, [leads]);

  /* ── update lead ──────────────────────────────────────────────── */
  const updateLead = async (id: string, payload: Partial<Lead>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('update failed');
      const data = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data.lead } : l)));
      setSelectedLead((prev) => (prev ? { ...prev, ...data.lead } : prev));
      toast.success(language === 'es' ? 'Actualizado' : 'Updated');
    } catch {
      toast.error(language === 'es' ? 'Error al actualizar' : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  /* ── delete lead ──────────────────────────────────────────────── */
  const deleteLead = async (id: string) => {
    if (!confirm(language === 'es' ? '¿Eliminar este prospecto?' : 'Delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('delete failed');
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setDialogOpen(false);
      toast.success(language === 'es' ? 'Eliminado' : 'Deleted');
    } catch {
      toast.error(language === 'es' ? 'Error al eliminar' : 'Delete failed');
    }
  };

  /* ── export CSV ───────────────────────────────────────────────── */
  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'State', 'Goal', 'Credit Score', 'Status', 'Priority', 'Language', 'Created At'];
    const rows = leads.map((l) => [
      l.firstName, l.lastName, l.email, l.phone, l.state || '', l.goal || '', l.creditScore || '', l.status, l.priority, l.language, new Date(l.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'es' ? 'CSV exportado' : 'CSV exported');
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const label = (en: string, es: string) => (language === 'es' ? es : en);

  /* ── stat cards ───────────────────────────────────────────────── */
  const statCards = [
    { label: label('Total Leads', 'Total'), value: stats.total, color: 'text-foreground' },
    { label: label('New', 'Nuevos'), value: stats.newCount, color: 'text-blue-600' },
    { label: label('Qualified', 'Calificados'), value: stats.qualified, color: 'text-[var(--color-gold)]' },
    { label: label('Enrolled', 'Inscritos'), value: stats.enrolled, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Inbox className="h-6 w-6 text-[var(--color-gold)]" />
            {label('Leads', 'Prospectos')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {label('Manage inquiries from your landing page', 'Gestiona las solicitudes de tu landing page')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              {label('Table', 'Tabla')}
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              {label('Pipeline', 'Pipeline')}
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {label('Refresh', 'Actualizar')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={leads.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {label('Export CSV', 'Exportar CSV')}
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
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={label('Search by name, email, phone...', 'Buscar por nombre, email, teléfono...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{label('All Status', 'Todos')}</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {label(s.charAt(0).toUpperCase() + s.slice(1), { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', enrolled: 'Inscrito', lost: 'Perdido' }[s] || s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table view ──────────────────────────────────── */}
      {viewMode === 'table' && (
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {label('No leads yet. They will appear here when visitors submit the form.', 'Aún no hay prospectos. Aparecerán aquí cuando los visitantes envíen el formulario.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{label('Name', 'Nombre')}</TableHead>
                    <TableHead>{label('Contact', 'Contacto')}</TableHead>
                    <TableHead>{label('Goal', 'Objetivo')}</TableHead>
                    <TableHead>{label('Score', 'Puntaje')}</TableHead>
                    <TableHead>{label('Status', 'Estado')}</TableHead>
                    <TableHead>{label('Priority', 'Prioridad')}</TableHead>
                    <TableHead>{label('Date', 'Fecha')}</TableHead>
                    <TableHead className="text-right">{label('Actions', 'Acciones')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetail(lead)}
                    >
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                        {lead.language === 'es' && (
                          <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">ES</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="truncate">{lead.email}</div>
                        <div className="text-xs">{lead.phone}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.goal ? (goalLabels[lead.goal]?.[language] || lead.goal) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">{lead.creditScore || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[lead.status] || ''}>
                          {label(lead.status, { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', enrolled: 'Inscrito', lost: 'Perdido' }[lead.status] || lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={priorityStyles[lead.priority] || ''}>
                          {label(lead.priority, { high: 'Alta', medium: 'Media', low: 'Baja' }[lead.priority] || lead.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(lead); }}>
                          {label('View', 'Ver')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* ── Kanban / Pipeline view ─────────────────────── */}
      {viewMode === 'kanban' && !loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {STATUS_OPTIONS.map((col) => {
            const colLeads = leads.filter((l) => l.status === col);
            return (
              <div
                key={col}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => {
                  if (draggedLead && draggedLead.status !== col) {
                    updateLead(draggedLead.id, { status: col });
                  }
                  setDraggedLead(null);
                  setDragOverCol(null);
                }}
                className={`flex flex-col rounded-xl border bg-muted/20 transition-colors ${
                  dragOverCol === col ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-border'
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusDotColors[col]}`} />
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                      {label(col.charAt(0).toUpperCase() + col.slice(1),
                            { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', enrolled: 'Inscrito', lost: 'Perdido' }[col] || col)}
                    </span>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: '60vh' }}>
                  {colLeads.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground/50">
                      {label('Drop leads here', 'Arrastra prospectos aquí')}
                    </p>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggedLead(lead)}
                        onClick={() => openDetail(lead)}
                        className="cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                          {lead.priority === 'high' && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                              {label('HIGH', 'ALTA')}
                            </span>
                          )}
                        </div>
                        {lead.goal && (
                          <p className="mt-1.5 text-xs text-[var(--color-accent)]">
                            {goalLabels[lead.goal]?.[language] || lead.goal}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-muted-foreground/60">
                          {new Date(lead.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedLead.firstName} {selectedLead.lastName}
                  <Badge variant="outline" className={statusStyles[selectedLead.status] || ''}>
                    {label(selectedLead.status, { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', enrolled: 'Inscrito', lost: 'Perdido' }[selectedLead.status] || selectedLead.status)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {label('Submitted on', 'Enviado el')} {new Date(selectedLead.createdAt).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* contact info */}
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Mail className="h-4 w-4 text-[var(--color-gold)]" /> {selectedLead.email}
                  </a>
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4 text-[var(--color-gold)]" /> {selectedLead.phone}
                  </a>
                  {selectedLead.state && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-[var(--color-gold)]" /> {selectedLead.state}
                    </span>
                  )}
                  {selectedLead.goal && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">{label('Goal:', 'Objetivo:')}</span>
                      {goalLabels[selectedLead.goal]?.[language] || selectedLead.goal}
                    </span>
                  )}
                </div>

                {/* message */}
                {selectedLead.message && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1.5 font-medium">
                      <MessageSquare className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                      {label('Message', 'Mensaje')}
                    </p>
                    <p className="text-muted-foreground">{selectedLead.message}</p>
                  </div>
                )}

                {/* status & priority controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium">{label('Status', 'Estado')}</Label>
                    <Select
                      value={selectedLead.status}
                      onValueChange={(v) => updateLead(selectedLead.id, { status: v })}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {label(s.charAt(0).toUpperCase() + s.slice(1), { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', enrolled: 'Inscrito', lost: 'Perdido' }[s] || s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium">{label('Priority', 'Prioridad')}</Label>
                    <Select
                      value={selectedLead.priority}
                      onValueChange={(v) => updateLead(selectedLead.id, { priority: v })}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {label(p.charAt(0).toUpperCase() + p.slice(1), { high: 'Alta', medium: 'Media', low: 'Baja' }[p] || p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* notes */}
                <div>
                  <Label className="mb-1.5 block text-xs font-medium">{label('Internal Notes', 'Notas Internas')}</Label>
                  <Textarea
                    rows={3}
                    placeholder={label('Add notes about this lead...', 'Agrega notas sobre este prospecto...')}
                    defaultValue={selectedLead.notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (selectedLead.notes || '')) {
                        updateLead(selectedLead.id, { notes: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <DialogFooter className="flex !justify-between">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteLead(selectedLead.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {label('Delete', 'Eliminar')}
                </Button>
                <Button onClick={() => setDialogOpen(false)}>
                  {label('Close', 'Cerrar')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
