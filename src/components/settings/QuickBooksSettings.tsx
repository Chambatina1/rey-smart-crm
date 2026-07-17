'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, ShieldCheck, AlertCircle, CheckCircle2, Plug, Trash2, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface QBConfig {
  id?: string;
  clientId?: string;
  clientSecret?: string;
  environment?: string;
  realmId?: string | null;
  redirectUri?: string | null;
  isConnected?: boolean;
  connectedAt?: string | null;
  tokenExpiresAt?: string | null;
}

export function QuickBooksSettings() {
  const { token, language } = useAuthStore();
  const [config, setConfig] = useState<QBConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    clientSecret: '',
    environment: 'production',
    redirectUri: '',
  });

  const t = (en: string, es: string) => (language === 'es' ? es : en);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/quickbooks', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setConfig(data.config);
    } catch {
      toast.error(t('Failed to load QuickBooks settings', 'Error al cargar configuración'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); /* eslint-disable-next-line */ }, []);

  const handleSave = async () => {
    if (!form.clientId || !form.clientSecret) {
      toast.error(t('Client ID and Secret are required', 'Client ID y Secret son obligatorios'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings/quickbooks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(t('QuickBooks credentials saved', 'Credenciales guardadas'));
      setShowForm(false);
      setForm({ clientId: '', clientSecret: '', environment: 'production', redirectUri: '' });
      fetchConfig();
    } catch {
      toast.error(t('Failed to save credentials', 'Error al guardar credenciales'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch('/api/settings/quickbooks', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      toast.success(t('QuickBooks disconnected', 'QuickBooks desconectado'));
      setConfirmDelete(false);
      fetchConfig();
    } catch {
      toast.error(t('Failed to disconnect', 'Error al desconectar'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Plug className="h-6 w-6 text-[var(--color-gold)]" />
          {t('QuickBooks Integration', 'Integración con QuickBooks')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            'Connect your own QuickBooks account to sync income, expenses, and invoices.',
            'Conecta tu propia cuenta de QuickBooks para sincronizar ingresos, gastos y facturas.'
          )}
        </p>
      </div>

      {/* Status card */}
      <Card>
        <CardContent className="p-6">
          {config ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.isConnected ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {config.isConnected ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {config.isConnected
                        ? t('QuickBooks Connected', 'QuickBooks Conectado')
                        : t('Credentials Saved — Not Connected', 'Credenciales Guardadas — No Conectado')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('Environment', 'Entorno')}: <Badge variant="outline" className="ml-1">{config.environment}</Badge>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('Disconnect', 'Desconectar')}
                </Button>
              </div>

              {/* Credential preview (masked) */}
              <div className="grid gap-3 rounded-lg bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">{t('Client ID', 'Client ID')}</p>
                  <p className="font-mono text-sm">{config.clientId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">{t('Client Secret', 'Client Secret')}</p>
                  <p className="font-mono text-sm">{config.clientSecret || '—'}</p>
                </div>
                {config.realmId && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">{t('Realm ID', 'Realm ID')}</p>
                    <p className="font-mono text-sm">{config.realmId}</p>
                  </div>
                )}
                {config.connectedAt && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">{t('Connected on', 'Conectado el')}</p>
                    <p className="text-sm">{new Date(config.connectedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
                {t('Update Credentials', 'Actualizar Credenciales')}
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Plug className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold">{t('QuickBooks not configured', 'QuickBooks no configurado')}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t(
                  'Enter your QuickBooks app credentials to start syncing your finances.',
                  'Ingresa las credenciales de tu app de QuickBooks para empezar a sincronizar tus finanzas.'
                )}
              </p>
              <Button onClick={() => setShowForm(true)} className="mt-5 bg-[var(--color-gold)] text-[var(--color-primary)] hover:brightness-110">
                <Plug className="mr-2 h-4 w-4" />
                {t('Configure QuickBooks', 'Configurar QuickBooks')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
            {t('How to get your QuickBooks credentials', 'Cómo obtener tus credenciales de QuickBooks')}
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. {t('Go to', 'Ve a')} <a href="https://developer.intuit.com/app/developer/myapps" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium text-[var(--color-accent)] hover:underline">Intuit Developer <ExternalLink className="h-3 w-3" /></a></li>
            <li>2. {t('Create a new app (or select an existing one)', 'Crea una nueva app (o selecciona una existente)')}</li>
            <li>3. {t('Copy your Client ID and Client Secret from the Keys tab', 'Copia tu Client ID y Client Secret de la pestaña Keys')}</li>
            <li>4. {t('Add this Redirect URI:', 'Agrega esta Redirect URI:')} <code className="rounded bg-muted px-1.5 py-0.5 text-xs">https://rey-smart-crm.onrender.com/api/quickbooks/callback</code></li>
            <li>5. {t('Paste them below — they are stored encrypted and never shared', 'Pégalas abajo — se guardan encriptadas y nunca se comparten')}</li>
          </ol>
        </CardContent>
      </Card>

      {/* Edit/Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{config ? t('Update QuickBooks Credentials', 'Actualizar Credenciales') : t('Configure QuickBooks', 'Configurar QuickBooks')}</DialogTitle>
            <DialogDescription>
              {t('Enter your Intuit Developer app credentials.', 'Ingresa las credenciales de tu app de Intuit Developer.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Client ID *</Label>
              <Input
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                placeholder="AB1234567890abcdef..."
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Client Secret *</Label>
              <Input
                type="password"
                value={form.clientSecret}
                onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
                placeholder="••••••••••••••••"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Environment', 'Entorno')}</Label>
              <Select value={form.environment} onValueChange={(v) => setForm({ ...form, environment: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">{t('Production (Live)', 'Producción (Real)')}</SelectItem>
                  <SelectItem value="sandbox">Sandbox ({t('Testing', 'Pruebas')})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Redirect URI (optional)', 'Redirect URI (opcional)')}</Label>
              <Input
                value={form.redirectUri}
                onChange={(e) => setForm({ ...form, redirectUri: e.target.value })}
                placeholder="https://rey-smart-crm.onrender.com/api/quickbooks/callback"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t('Cancel', 'Cancelar')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('Save Credentials', 'Guardar Credenciales')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('Disconnect QuickBooks?', '¿Desconectar QuickBooks?')}</DialogTitle>
            <DialogDescription>
              {t('This will remove all credentials. You can reconfigure anytime.', 'Esto eliminará todas las credenciales. Puedes reconfigurar cuando quieras.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t('Cancel', 'Cancelar')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('Disconnect', 'Desconectar')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
