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
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  CreditCard, Plus, Loader2, RefreshCw, Trash2, Edit3, CheckCircle2, Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  code: string;
  displayName: string;
  type: string;
  description?: string | null;
  publicKey?: string | null;
  secretKey?: string | null;
  webhookSecret?: string | null;
  accountId?: string | null;
  isActive: boolean;
  isDefault: boolean;
  feePercent?: number | null;
  feeFlat?: number | null;
  icon?: string | null;
  sortOrder: number;
  instructions?: any;
}

const PRESETS = [
  { code: 'stripe', displayName: 'Credit/Debit Card (Stripe)', type: 'card', icon: '💳', feePercent: 2.9, feeFlat: 0.30 },
  { code: 'paypal', displayName: 'PayPal', type: 'digital', icon: '🅿️', feePercent: 3.49, feeFlat: 0.49 },
  { code: 'square', displayName: 'Square', type: 'card', icon: '⬜', feePercent: 2.6, feeFlat: 0.10 },
  { code: 'zelle', displayName: 'Zelle', type: 'bank', icon: '⚡', feePercent: 0, feeFlat: 0 },
  { code: 'bank_transfer', displayName: 'Bank Transfer (ACH)', type: 'bank', icon: '🏦', feePercent: 0, feeFlat: 0 },
  { code: 'cash', displayName: 'Cash', type: 'cash', icon: '💵', feePercent: 0, feeFlat: 0 },
  { code: 'check', displayName: 'Check', type: 'cash', icon: '📝', feePercent: 0, feeFlat: 0 },
];

export function PaymentMethodsPage() {
  const { token, language } = useAuthStore();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMethod, setEditMethod] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: 'stripe',
    displayName: '',
    type: 'card',
    description: '',
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    accountId: '',
    feePercent: 0,
    feeFlat: 0,
    icon: '💳',
    isActive: true,
    isDefault: false,
    sortOrder: 0,
    instructions: '',
  });

  const t = (en: string, es: string) => (language === 'es' ? es : en);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/payment-methods?admin=true', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setMethods(data.methods || []);
    } catch {
      toast.error(t('Failed to load payment methods', 'Error al cargar métodos de pago'));
    } finally {
      setLoading(false);
    }
  }, [token, language]);

  useEffect(() => { fetchMethods(); /* eslint-disable-next-line */ }, []);

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setForm({
      ...form,
      code: preset.code,
      displayName: preset.displayName,
      type: preset.type,
      icon: preset.icon,
      feePercent: preset.feePercent,
      feeFlat: preset.feeFlat,
    });
  };

  const handleSave = async () => {
    if (!form.displayName) {
      toast.error(t('Display name required', 'Nombre requerido'));
      return;
    }
    setSaving(true);
    try {
      const isEditing = !!editMethod;
      const payload = {
        ...form,
        id: editMethod?.id,
        instructions: form.instructions ? { text: form.instructions } : null,
      };
      const res = await fetch('/api/settings/payment-methods', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? t('Method updated', 'Método actualizado') : t('Method added', 'Método agregado'));
      setShowAdd(false);
      setEditMethod(null);
      setForm({ code: 'stripe', displayName: '', type: 'card', description: '', publicKey: '', secretKey: '', webhookSecret: '', accountId: '', feePercent: 0, feeFlat: 0, icon: '💳', isActive: true, isDefault: false, sortOrder: 0, instructions: '' });
      fetchMethods();
    } catch {
      toast.error(t('Failed to save', 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/settings/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, isActive }),
      });
      fetchMethods();
    } catch { /* */ }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch('/api/settings/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, isDefault: true }),
      });
      toast.success(t('Default payment method updated', 'Método predeterminado actualizado'));
      fetchMethods();
    } catch { /* */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Delete this payment method?', '¿Eliminar este método de pago?'))) return;
    try {
      await fetch(`/api/settings/payment-methods?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success(t('Method deleted', 'Método eliminado'));
      fetchMethods();
    } catch { toast.error(t('Delete failed', 'Error al eliminar')); }
  };

  const startEdit = (m: PaymentMethod) => {
    setEditMethod(m);
    setForm({
      code: m.code,
      displayName: m.displayName,
      type: m.type,
      description: m.description || '',
      publicKey: m.publicKey || '',
      secretKey: '', // never prefill secret
      webhookSecret: '',
      accountId: m.accountId || '',
      feePercent: m.feePercent || 0,
      feeFlat: m.feeFlat || 0,
      icon: m.icon || '💳',
      isActive: m.isActive,
      isDefault: m.isDefault,
      sortOrder: m.sortOrder,
      instructions: m.instructions?.text || '',
    });
    setShowAdd(true);
  };

  const activeCount = methods.filter((m) => m.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CreditCard className="h-6 w-6 text-[var(--color-gold)]" />
            {t('Payment Methods', 'Formas de Pago')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Configure how your customers pay you', 'Configura cómo te pagan tus clientes')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMethods} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh', 'Actualizar')}
          </Button>
          <Button size="sm" onClick={() => { setEditMethod(null); setForm({ code: 'stripe', displayName: '', type: 'card', description: '', publicKey: '', secretKey: '', webhookSecret: '', accountId: '', feePercent: 0, feeFlat: 0, icon: '💳', isActive: true, isDefault: false, sortOrder: 0, instructions: '' }); setShowAdd(true); }} className="bg-[var(--color-accent)] text-white hover:brightness-110">
            <Plus className="mr-2 h-4 w-4" />
            {t('Add Method', 'Agregar Método')}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Badge variant="outline" className="border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1.5">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[var(--color-accent)]" />
          {activeCount} {t('active', 'activos')}
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5">
          {methods.length} {t('total configured', 'total configurados')}
        </Badge>
      </div>

      {/* Methods list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : methods.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CreditCard className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">{t('No payment methods yet', 'Sin métodos de pago')}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {t('Add your first payment method to start accepting payments from customers.', 'Agrega tu primer método de pago para empezar a recibir pagos de tus clientes.')}
            </p>
            <Button onClick={() => setShowAdd(true)} className="mt-5 bg-[var(--color-gold)] text-[var(--color-primary)] hover:brightness-110">
              <Plus className="mr-2 h-4 w-4" />
              {t('Add Your First Method', 'Agregar Primer Método')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {methods.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`relative ${m.isDefault ? 'ring-2 ring-[var(--color-gold)]/40' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl">
                        {m.icon || '💳'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{m.displayName}</h3>
                          {m.isDefault && (
                            <Badge className="bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              {t('Default', 'Predeterminado')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {m.code} · {m.type}
                          {m.feePercent ? ` · ${m.feePercent}% + $${m.feeFlat}` : ''}
                        </p>
                      </div>
                    </div>
                    <Switch checked={m.isActive} onCheckedChange={(v) => handleToggleActive(m.id, v)} />
                  </div>

                  {/* Credentials preview */}
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-3 text-xs">
                    {m.publicKey && (
                      <div>
                        <span className="text-muted-foreground">{t('Public Key', 'Public Key')}:</span>
                        <p className="font-mono">{m.publicKey.slice(0, 12)}...</p>
                      </div>
                    )}
                    {m.secretKey && (
                      <div>
                        <span className="text-muted-foreground">{t('Secret Key', 'Secret Key')}:</span>
                        <p className="font-mono">{m.secretKey}</p>
                      </div>
                    )}
                    {m.accountId && (
                      <div>
                        <span className="text-muted-foreground">{t('Account', 'Cuenta')}:</span>
                        <p className="font-mono">{m.accountId}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {!m.isDefault && m.isActive && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(m.id)}>
                        <Star className="mr-1.5 h-3.5 w-3.5" />
                        {t('Set Default', 'Predeterminar')}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => startEdit(m)}>
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                      {t('Edit', 'Editar')}
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMethod ? t('Edit Payment Method', 'Editar Método') : t('Add Payment Method', 'Agregar Método')}</DialogTitle>
            <DialogDescription>
              {t('Configure how customers can pay. Credentials are stored securely.', 'Configura cómo pueden pagar tus clientes. Las credenciales se guardan de forma segura.')}
            </DialogDescription>
          </DialogHeader>

          {/* Preset selector (only on new) */}
          {!editMethod && (
            <div className="mb-4">
              <Label className="mb-2 block text-sm font-medium">{t('Quick presets', 'Presets rápidos')}</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.code}
                    onClick={() => handlePreset(p)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition ${
                      form.code === p.code ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="font-medium">{p.displayName.split(' (')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">{t('Display name', 'Nombre a mostrar')} *</Label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Credit Card" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">{t('Type', 'Tipo')}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">💳 {t('Card', 'Tarjeta')}</SelectItem>
                    <SelectItem value="bank">🏦 {t('Bank', 'Banco')}</SelectItem>
                    <SelectItem value="digital">🌐 {t('Digital', 'Digital')}</SelectItem>
                    <SelectItem value="cash">💵 {t('Cash', 'Efectivo')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">{t('Icon (emoji)', 'Icono (emoji)')}</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="💳" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Description', 'Descripción')}</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('Pay with your credit card', 'Paga con tu tarjeta')} />
            </div>

            {/* Credentials */}
            <div className="space-y-3 rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{t('Credentials (optional)', 'Credenciales (opcional)')}</p>
              <div>
                <Label className="mb-1 block text-xs">{t('Public Key / Client ID', 'Public Key / Client ID')}</Label>
                <Input value={form.publicKey} onChange={(e) => setForm({ ...form, publicKey: e.target.value })} placeholder="pk_live_..." />
              </div>
              <div>
                <Label className="mb-1 block text-xs">
                  {t('Secret Key', 'Secret Key')} {editMethod && <span className="text-amber-600">({t('leave blank to keep current', 'dejar vacío para mantener')})</span>}
                </Label>
                <Input type="password" value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} placeholder="sk_live_..." />
              </div>
              <div>
                <Label className="mb-1 block text-xs">{t('Webhook Secret', 'Webhook Secret')}</Label>
                <Input type="password" value={form.webhookSecret} onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })} placeholder="whsec_..." />
              </div>
              <div>
                <Label className="mb-1 block text-xs">{t('Account ID / Email', 'Account ID / Email')}</Label>
                <Input value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} placeholder="AC1234 / pay@business.com" />
              </div>
            </div>

            {/* Fees */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">{t('Fee %', 'Comisión %')}</Label>
                <Input type="number" step="0.01" value={form.feePercent} onChange={(e) => setForm({ ...form, feePercent: Number(e.target.value) })} placeholder="2.9" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">{t('Flat fee $', 'Comisión fija $')}</Label>
                <Input type="number" step="0.01" value={form.feeFlat} onChange={(e) => setForm({ ...form, feeFlat: Number(e.target.value) })} placeholder="0.30" />
              </div>
            </div>

            {/* Manual instructions (for Zelle, bank, etc.) */}
            {(form.type === 'bank' || form.type === 'cash') && (
              <div>
                <Label className="mb-1.5 block text-xs">{t('Payment instructions', 'Instrucciones de pago')}</Label>
                <Textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder={t('e.g. Send Zelle to 407-716-3478', 'ej. Envía Zelle a 407-716-3478')}
                />
              </div>
            )}

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <span className="text-sm">{t('Active', 'Activo')}</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={form.isDefault} onCheckedChange={(v) => setForm({ ...form, isDefault: v })} />
                <span className="text-sm">{t('Default', 'Predeterminado')}</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>{t('Cancel', 'Cancelar')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editMethod ? t('Save Changes', 'Guardar Cambios') : t('Add Method', 'Agregar Método')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
