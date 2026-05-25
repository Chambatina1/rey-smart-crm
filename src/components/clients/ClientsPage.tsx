'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, Eye, Pencil, Trash2, MoreHorizontal,
  ChevronUp, ChevronDown, ChevronsUpDown, UserPlus, Tag,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Demo Data ─────────────────────────────────────────── */

interface DemoClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditScore: number;
  status: 'active' | 'inactive' | 'completed' | 'suspended';
  tags: string[];
}

const demoClients: DemoClient[] = [
  { id: '1', name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '(407) 123-4567', creditScore: 642, status: 'active', tags: ['Priority', 'Credit Repair'] },
  { id: '2', name: 'Carlos Rodriguez', email: 'carlos.r@email.com', phone: '(305) 234-5678', creditScore: 589, status: 'active', tags: ['Consultation'] },
  { id: '3', name: 'Ana Martinez', email: 'ana.martinez@email.com', phone: '(786) 345-6789', creditScore: 712, status: 'completed', tags: ['Credit Repair', 'Dispute'] },
  { id: '4', name: 'Robert Lopez', email: 'robert.lopez@email.com', phone: '(407) 456-7890', creditScore: 456, status: 'active', tags: ['New Client'] },
  { id: '5', name: 'Sofia Hernandez', email: 'sofia.h@email.com', phone: '(305) 567-8901', creditScore: 689, status: 'active', tags: ['Priority'] },
  { id: '6', name: 'Luis Gonzalez', email: 'luis.g@email.com', phone: '(786) 678-9012', creditScore: 534, status: 'inactive', tags: ['Follow-up'] },
  { id: '7', name: 'Carmen Diaz', email: 'carmen.d@email.com', phone: '(407) 789-0123', creditScore: 615, status: 'active', tags: ['Credit Repair'] },
  { id: '8', name: 'Jose Torres', email: 'jose.t@email.com', phone: '(305) 890-1234', creditScore: 498, status: 'suspended', tags: ['On Hold'] },
  { id: '9', name: 'Patricia Flores', email: 'patricia.f@email.com', phone: '(786) 901-2345', creditScore: 728, status: 'completed', tags: ['Success Story'] },
  { id: '10', name: 'David Ramirez', email: 'david.r@email.com', phone: '(407) 012-3456', creditScore: 573, status: 'active', tags: ['Dispute', 'Priority'] },
];

type SortField = 'name' | 'email' | 'creditScore' | 'status';
type SortDir = 'asc' | 'desc';

/* ─── Component ────────────────────────────────────────── */

export function ClientsPage() {
  const { t } = useT();
  const { navigate, selectClient } = useNavigationStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ssnLast4: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    tags: '',
    notes: '',
  });
  const perPage = 10;

  /* Collect unique tags */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    demoClients.forEach((c) => c.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, []);

  /* Filter */
  const filtered = useMemo(() => {
    let list = [...demoClients];
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    if (tagFilter !== 'all') list = list.filter((c) => c.tags.includes(tagFilter));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.includes(s),
      );
    }
    /* Sort */
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'creditScore': cmp = a.creditScore - b.creditScore; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, tagFilter, sortField, sortDir]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const totalClients = 248;

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function renderSortIcon(field: SortField) {
    if (sortField !== field) return <ChevronsUpDown key={field} className="w-3.5 h-3.5 ml-1 inline text-gray-400" />;
    return sortDir === 'asc'
      ? <ChevronUp key={field} className="w-3.5 h-3.5 ml-1 inline text-teal-600" />
      : <ChevronDown key={field} className="w-3.5 h-3.5 ml-1 inline text-teal-600" />;
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactive: 'bg-gray-100 text-gray-600 border-gray-200',
      completed: 'bg-teal-100 text-teal-700 border-teal-200',
      suspended: 'bg-red-100 text-red-700 border-red-200',
    };
    const label: Record<string, string> = {
      active: t.clients.active,
      inactive: t.clients.inactive,
      completed: t.clients.completed,
      suspended: t.clients.suspended,
    };
    return <Badge className={`${map[status] || map.inactive} text-[11px]`}>{label[status] || status}</Badge>;
  }

  function scoreBadge(score: number) {
    if (score >= 700) return 'text-emerald-600 font-bold';
    if (score >= 600) return 'text-teal-600 font-semibold';
    if (score >= 500) return 'text-amber-600 font-semibold';
    return 'text-red-600 font-bold';
  }

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function avatarColor(name: string) {
    const colors = [
      'bg-teal-100 text-teal-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-blue-100 text-blue-700',
      'bg-rose-100 text-rose-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  function handleViewClient(id: string) {
    selectClient(id);
    navigate('client-detail');
  }

  function handleSubmitAdd() {
    setShowAddDialog(false);
    toast.success(t.clients.clientAdded);
    setFormData({ fullName: '', email: '', phone: '', ssnLast4: '', dob: '', address: '', city: '', state: '', zip: '', tags: '', notes: '' });
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.clients.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} {t.common.results.toLowerCase()}
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.clients.addClient}
        </Button>
      </motion.div>

      {/* ── Filter Bar ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t.clients.searchClients}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t.clients.allStatuses} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.clients.allStatuses}</SelectItem>
            <SelectItem value="active">{t.clients.active}</SelectItem>
            <SelectItem value="inactive">{t.clients.inactive}</SelectItem>
            <SelectItem value="completed">{t.clients.completed}</SelectItem>
            <SelectItem value="suspended">{t.clients.suspended}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <SelectValue placeholder="All Tags" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* ── Data Table ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                      <span className="flex items-center font-semibold">{t.clients.name}{renderSortIcon('name')}</span>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <span className="flex items-center font-semibold">{t.clients.email}{renderSortIcon('email')}</span>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">{t.clients.phone}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('creditScore')}>
                      <span className="flex items-center font-semibold">{t.clients.creditScore}{renderSortIcon('creditScore')}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                      <span className="flex items-center font-semibold">{t.clients.status}{renderSortIcon('status')}</span>
                    </TableHead>
                    <TableHead className="text-right font-semibold">{t.clients.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-gray-400">
                        {t.common.noResults}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((client) => (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer hover:bg-teal-50/40 transition-colors"
                        onClick={() => handleViewClient(client.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(client.name)}`}>
                              {initials(client.name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                              <div className="flex gap-1 md:hidden mt-0.5">
                                {client.tags.slice(0, 1).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-gray-600 text-sm">{client.email}</TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600 text-sm">{client.phone}</TableCell>
                        <TableCell>
                          <span className={`text-sm ${scoreBadge(client.creditScore)}`}>{client.creditScore}</span>
                        </TableCell>
                        <TableCell>{statusBadge(client.status)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                                <Eye className="w-4 h-4 mr-2" />{t.clients.view}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />{t.clients.edit}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />{t.clients.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Pagination ──────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {t.common.showing} <span className="font-medium">{(page - 1) * perPage + 1}</span>–
                <span className="font-medium">{Math.min(page * perPage, filtered.length)}</span> {t.common.of}{' '}
                <span className="font-medium">{totalClients}</span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t.common.previous}
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${page === i + 1 ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t.common.next}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Add Client Dialog ───────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              {t.clients.addClient}
            </DialogTitle>
            <DialogDescription>Fill in the client details below to add a new client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.auth.fullName} *</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.auth.email} *</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.auth.phone}</Label>
                <Input
                  type="tel"
                  placeholder="(407) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.clients.ssnLastFour}</Label>
                <Input
                  placeholder="XXXX"
                  maxLength={4}
                  value={formData.ssnLast4}
                  onChange={(e) => updateField('ssnLast4', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.clients.dateOfBirth}</Label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.clients.tags}</Label>
                <Input
                  placeholder="Priority, Credit Repair"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.clients.address}</Label>
              <Input
                placeholder="123 Main St"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t.clients.city}</Label>
                <Input
                  placeholder="Orlando"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.clients.state}</Label>
                <Select onValueChange={(v) => updateField('state', v)}>
                  <SelectTrigger><SelectValue placeholder="FL" /></SelectTrigger>
                  <SelectContent>
                    {['FL', 'CA', 'TX', 'NY', 'IL', 'GA', 'NC', 'AZ', 'NV', 'PA'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.clients.zipCode}</Label>
                <Input
                  placeholder="32801"
                  value={formData.zip}
                  onChange={(e) => updateField('zip', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.clients.notes}</Label>
              <Textarea
                rows={3}
                placeholder="Additional notes about the client..."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              onClick={handleSubmitAdd}
            >
              {t.clients.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
