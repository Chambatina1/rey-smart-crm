'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, Eye, FileText, Send, ChevronLeft, ChevronRight,
  Mail, Clock, AlertCircle, XCircle, RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────
interface Dispute {
  id: string;
  clientName: string;
  bureau: 'Equifax' | 'Experian' | 'TransUnion';
  disputeType: 'Late Payment' | 'Collection' | 'Charge Off' | 'Identity Theft' | 'Incorrect Info';
  status: 'Draft' | 'Sent' | 'In Progress' | 'Completed' | 'Cancelled';
  round: number;
  sentDate: string;
  reason: string;
  tradeLine: string;
}

interface StatusHistoryEntry {
  date: string;
  status: string;
  note: string;
}

// ── Demo Data ─────────────────────────────────────────────────────────
const DEMO_DISPUTES: Dispute[] = [
  { id: 'DSP-001', clientName: 'Maria Garcia', bureau: 'Equifax', disputeType: 'Late Payment', status: 'In Progress', round: 1, sentDate: '2024-06-15', reason: 'Payment was made on time but reported as late', tradeLine: 'CapOne Visa - ****4521' },
  { id: 'DSP-002', clientName: 'Carlos Rodriguez', bureau: 'TransUnion', disputeType: 'Collection', status: 'Completed', round: 2, sentDate: '2024-05-20', reason: 'Account was settled but collection remains', tradeLine: 'LVNV Funding - ****8832' },
  { id: 'DSP-003', clientName: 'Ana Martinez', bureau: 'Experian', disputeType: 'Charge Off', status: 'Sent', round: 1, sentDate: '2024-07-10', reason: 'Charge off should be removed after settlement', tradeLine: 'Synchrony Bank - ****3391' },
  { id: 'DSP-004', clientName: 'Robert Lopez', bureau: 'Equifax', disputeType: 'Identity Theft', status: 'Draft', round: 1, sentDate: '', reason: 'Account opened fraudulently - never authorized', tradeLine: 'Credit One - ****7720' },
  { id: 'DSP-005', clientName: 'Maria Garcia', bureau: 'Experian', disputeType: 'Incorrect Info', status: 'Completed', round: 1, sentDate: '2024-04-10', reason: 'Balance reported is incorrect, should be $0', tradeLine: 'Discover Card - ****2298' },
  { id: 'DSP-006', clientName: 'Sofia Hernandez', bureau: 'TransUnion', disputeType: 'Late Payment', status: 'In Progress', round: 3, sentDate: '2024-07-22', reason: 'Third round dispute - late payments still not removed', tradeLine: 'Wells Fargo - ****5567' },
  { id: 'DSP-007', clientName: 'Jorge Ramirez', bureau: 'Equifax', disputeType: 'Collection', status: 'Sent', round: 2, sentDate: '2024-07-18', reason: 'Re-investigation request - debt was paid in full', tradeLine: 'Midland Credit - ****1190' },
  { id: 'DSP-008', clientName: 'Isabella Cruz', bureau: 'Experian', disputeType: 'Incorrect Info', status: 'Draft', round: 1, sentDate: '', reason: 'Incorrect credit limit reported on account', tradeLine: 'Amex Gold - ****4480' },
  { id: 'DSP-009', clientName: 'Carlos Rodriguez', bureau: 'Equifax', disputeType: 'Charge Off', status: 'Cancelled', round: 1, sentDate: '2024-03-05', reason: 'Client decided to handle directly with creditor', tradeLine: 'Citi Bank - ****6634' },
  { id: 'DSP-010', clientName: 'Ana Martinez', bureau: 'TransUnion', disputeType: 'Identity Theft', status: 'In Progress', round: 2, sentDate: '2024-07-25', reason: 'FCRA identity theft report filed - awaiting investigation', tradeLine: 'Capital One Auto - ****9012' },
];

const DEMO_STATUS_HISTORY: Record<string, StatusHistoryEntry[]> = {
  'DSP-001': [
    { date: '2024-06-14', status: 'Draft', note: 'Dispute letter created' },
    { date: '2024-06-15', status: 'Sent', note: 'Sent certified mail to Equifax' },
    { date: '2024-06-25', status: 'In Progress', note: '30-day investigation period started' },
  ],
  'DSP-002': [
    { date: '2024-04-10', status: 'Draft', note: 'Initial dispute drafted' },
    { date: '2024-04-12', status: 'Sent', note: 'First round sent to TransUnion' },
    { date: '2024-05-10', status: 'In Progress', note: 'Investigation in progress' },
    { date: '2024-05-18', status: 'Sent', note: 'Round 2 sent after item verified' },
    { date: '2024-05-20', status: 'Completed', note: 'Item deleted successfully' },
  ],
};

// ── Constants ─────────────────────────────────────────────────────────
const BUREAU_COLORS: Record<string, string> = {
  Equifax: 'bg-teal-100 text-teal-700 border-teal-200',
  Experian: 'bg-amber-100 text-amber-700 border-amber-200',
  TransUnion: 'bg-purple-100 text-purple-700 border-purple-200',
};

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
};

const TYPE_OPTIONS = ['All', 'Late Payment', 'Collection', 'Charge Off', 'Identity Theft', 'Incorrect Info'];
const BUREAU_OPTIONS = ['All', 'Equifax', 'Experian', 'TransUnion'];
const STATUS_OPTIONS = ['All', 'Draft', 'Sent', 'In Progress', 'Completed', 'Cancelled'];
const ITEMS_PER_PAGE = 8;

// ── Component ─────────────────────────────────────────────────────────
export function DisputesPage() {
  const { t, language } = useT();
  const [search, setSearch] = useState('');
  const [bureauFilter, setBureauFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailDispute, setDetailDispute] = useState<Dispute | null>(null);

  // ── New Dispute Form State ──
  const [newClient, setNewClient] = useState('');
  const [newTradeLine, setNewTradeLine] = useState('');
  const [newBureau, setNewBureau] = useState('');
  const [newType, setNewType] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newRound, setNewRound] = useState('1');

  // ── Filtering & Pagination ──
  const filtered = useMemo(() => {
    return DEMO_DISPUTES.filter(d => {
      const s = search.toLowerCase();
      const matchSearch = !s || d.clientName.toLowerCase().includes(s) || d.id.toLowerCase().includes(s) || d.tradeLine.toLowerCase().includes(s);
      const matchBureau = bureauFilter === 'All' || d.bureau === bureauFilter;
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchType = typeFilter === 'All' || d.disputeType === typeFilter;
      return matchSearch && matchBureau && matchStatus && matchType;
    });
  }, [search, bureauFilter, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = useCallback((setter: (v: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  }, []);

  // ── Selection ──
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map(d => d.id)));
    }
  }, [paged, selectedIds.size]);

  // ── Detail Panel ──
  const openDetail = useCallback((dispute: Dispute) => {
    setDetailDispute(dispute);
    setShowDetail(true);
  }, []);

  // ── Reset form ──
  const resetForm = useCallback(() => {
    setNewClient(''); setNewTradeLine(''); setNewBureau('');
    setNewType(''); setNewReason(''); setNewRound('1');
  }, []);

  const closeNewDispute = useCallback(() => {
    setShowNewDispute(false);
    resetForm();
  }, [resetForm]);

  const statusHistory = detailDispute ? (DEMO_STATUS_HISTORY[detailDispute.id] || [
    { date: detailDispute.sentDate || '2024-06-01', status: detailDispute.status, note: 'Status updated' },
  ]) : [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.disputes.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t.common.showing} {filtered.length} {t.common.of} {DEMO_DISPUTES.length} {t.common.results}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowNewDispute(true)}>
          <Plus className="w-4 h-4 mr-2" />{t.disputes.newDispute}
        </Button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t.disputes.search}
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={bureauFilter} onValueChange={handleFilterChange(setBureauFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t.disputes.allBureaus} />
          </SelectTrigger>
          <SelectContent>
            {BUREAU_OPTIONS.map(b => (
              <SelectItem key={b} value={b}>{b === 'All' ? t.disputes.allBureaus : b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t.disputes.allStatuses} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s === 'All' ? t.disputes.allStatuses : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t.disputes.allTypes} />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map(tp => (
              <SelectItem key={tp} value={tp}>{tp === 'All' ? t.disputes.allTypes : tp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3"
        >
          <span className="text-sm font-medium text-teal-700">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-100">
              <FileText className="w-4 h-4 mr-2" />{t.disputes.generateLetters}
            </Button>
            <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-100">
              <RefreshCw className="w-4 h-4 mr-2" />Update Status
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Data Table ── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={paged.length > 0 && selectedIds.size === paged.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">{t.disputes.client}</TableHead>
                  <TableHead className="font-semibold">{t.disputes.bureau}</TableHead>
                  <TableHead className="font-semibold">{t.disputes.type}</TableHead>
                  <TableHead className="font-semibold">{t.disputes.status}</TableHead>
                  <TableHead className="font-semibold">{t.disputes.round}</TableHead>
                  <TableHead className="font-semibold">{t.disputes.sentDate}</TableHead>
                  <TableHead className="font-semibold text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      {t.common.noData}
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map(dispute => (
                    <TableRow
                      key={dispute.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(dispute.id)}
                          onCheckedChange={() => toggleSelect(dispute.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{dispute.clientName}</span>
                          <span className="text-xs text-gray-400">{dispute.tradeLine}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={BUREAU_COLORS[dispute.bureau]}>
                          {dispute.bureau}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">{dispute.disputeType}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[dispute.status]}>{dispute.status}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 font-mono text-sm">R{dispute.round}</TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {dispute.sentDate ? new Date(dispute.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openDetail(dispute)} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                          <Eye className="w-4 h-4 mr-1" />
                          {t.clients.view}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {t.common.showing} {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} {t.common.of} {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="icon"
                  className={`h-8 w-8 ${page === currentPage ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── New Dispute Dialog ── */}
      <Dialog open={showNewDispute} onOpenChange={closeNewDispute}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.disputes.newDispute}</DialogTitle>
            <DialogDescription>Create a new dispute letter for a client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={newClient} onValueChange={setNewClient}>
                <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">Maria Garcia</SelectItem>
                  <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
                  <SelectItem value="ana">Ana Martinez</SelectItem>
                  <SelectItem value="robert">Robert Lopez</SelectItem>
                  <SelectItem value="sofia">Sofia Hernandez</SelectItem>
                  <SelectItem value="jorge">Jorge Ramirez</SelectItem>
                  <SelectItem value="isabella">Isabella Cruz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trade Line</Label>
              <Select value={newTradeLine} onValueChange={setNewTradeLine}>
                <SelectTrigger><SelectValue placeholder="Select trade line..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="capone">CapOne Visa - ****4521</SelectItem>
                  <SelectItem value="lvnv">LVNV Funding - ****8832</SelectItem>
                  <SelectItem value="synchrony">Synchrony Bank - ****3391</SelectItem>
                  <SelectItem value="creditone">Credit One - ****7720</SelectItem>
                  <SelectItem value="discover">Discover Card - ****2298</SelectItem>
                  <SelectItem value="wells">Wells Fargo - ****5567</SelectItem>
                  <SelectItem value="midland">Midland Credit - ****1190</SelectItem>
                  <SelectItem value="amex">Amex Gold - ****4480</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.disputes.bureau}</Label>
                <Select value={newBureau} onValueChange={setNewBureau}>
                  <SelectTrigger><SelectValue placeholder="Select bureau..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equifax">Equifax</SelectItem>
                    <SelectItem value="Experian">Experian</SelectItem>
                    <SelectItem value="TransUnion">TransUnion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Round</Label>
                <Select value={newRound} onValueChange={setNewRound}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Round 1</SelectItem>
                    <SelectItem value="2">Round 2</SelectItem>
                    <SelectItem value="3">Round 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.disputes.type}</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue placeholder="Select dispute type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Late Payment">Late Payment</SelectItem>
                  <SelectItem value="Collection">Collection</SelectItem>
                  <SelectItem value="Charge Off">Charge Off</SelectItem>
                  <SelectItem value="Identity Theft">Identity Theft</SelectItem>
                  <SelectItem value="Incorrect Info">Incorrect Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.disputes.disputeReason}</Label>
              <Textarea
                rows={3}
                placeholder="Explain the reason for this dispute..."
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeNewDispute}>{t.common.cancel}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={closeNewDispute}>
              <Send className="w-4 h-4 mr-2" />{t.disputes.generateLetters}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dispute Detail Panel (Sheet) ── */}
      <Sheet open={showDetail} onOpenChange={setShowDetail}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {detailDispute && (
            <>
              <SheetHeader className="space-y-1 pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  {detailDispute.id}
                  <Badge className={STATUS_COLORS[detailDispute.status]}>{detailDispute.status}</Badge>
                </SheetTitle>
                <SheetDescription>
                  {detailDispute.clientName} · {detailDispute.tradeLine}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-6 pb-6">
                  {/* Dispute Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border border-gray-100">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.disputes.bureau}</p>
                        <Badge variant="outline" className={BUREAU_COLORS[detailDispute.bureau]}>{detailDispute.bureau}</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-100">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.disputes.round}</p>
                        <p className="text-lg font-semibold text-gray-900">Round {detailDispute.round}</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-100">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.disputes.type}</p>
                        <p className="text-sm font-medium text-gray-900">{detailDispute.disputeType}</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-100">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.disputes.sentDate}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {detailDispute.sentDate ? new Date(detailDispute.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Reason */}
                  <Card className="border border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        {t.disputes.disputeReason}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{detailDispute.reason}</p>
                    </CardContent>
                  </Card>

                  {/* Letter Preview */}
                  <Card className="border border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-teal-600" />
                        {t.disputes.letterPreview}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-600 leading-relaxed whitespace-pre-wrap border">
{`REY SMART SOLUTION
700 Professional Drive, Suite 200
Miami, FL 33101

Date: ${detailDispute.sentDate || new Date().toLocaleDateString('en-US')}

${detailDispute.bureau}
P.O. Box 100
Atlanta, GA 30348

Subject: Dispute of Inaccurate Information

To Whom It May Concern,

I am writing to dispute the following information on my credit report:

Trade Line: ${detailDispute.tradeLine}
Dispute Type: ${detailDispute.disputeType}

Reason: ${detailDispute.reason}

Under the Fair Credit Reporting Act (FCRA), 15 USC § 1681i, I am requesting a reinvestigation of this item. Please investigate and remove or correct the inaccurate information within 30 days.

Sincerely,
${detailDispute.clientName}`}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Response Timeline */}
                  <Card className="border border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        Status History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                        <div className="space-y-4">
                          {statusHistory.map((entry, i) => (
                            <div key={i} className="relative flex gap-3">
                              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-300 z-10" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${STATUS_COLORS[entry.status]}`}>{entry.status}</Badge>
                                  <span className="text-xs text-gray-400">
                                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5">{entry.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                      <FileText className="w-4 h-4 mr-2" />{t.disputes.generateLetters}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />Update Status
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
