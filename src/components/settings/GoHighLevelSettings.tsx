'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Loader2, Zap, CheckCircle2, AlertCircle, ExternalLink, Trash2, Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

interface GHLConfig {
  id?: string;
  apiKey?: string;
  locationId?: string;
  pipelineId?: string | null;
  pipelineStageId?: string | null;
  isActive?: boolean;
  lastSyncAt?: string | null;
  lastError?: string | null;
}

export function GoHighLevelSettings() {
  const { token, language } = useAuthStore();
  const [config, setConfig] = useState<GHLConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    apiKey: '',
    locationId: '',
    pipelineId: '',
    pipelineStageId: '',
    isActive: true,
  });

  const t = (en: string, es: string) => (language === 'es' ? es : en);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/gohighlevel', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setConfig(data.config);
    } catch {
      toast.error(t('Failed to load settings', 'Error al cargar configuración'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); /* eslint-disable-next-line */ }, []);

  const handleSave = async () => {
    if (!form.apiKey || !form.locationId) {
      toast.error(t('API Token and Location ID required', 'API Token y Location ID obligatorios'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings/gohighlevel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(t('GoHighLevel connected!', '¡GoHighLevel conectado!'));
      setShowForm(false);
      setForm({ apiKey: '', locationId: '', pipelineId: '', pipelineStageId: '', isActive: true });
      fetchConfig();
    } catch {
      toast.error(t('Failed to save', 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/settings/gohighlevel', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success(t('Disconnected', 'Desconectado'));
      setConfirmDelete(false);
      fetchConfig();
    } catch {
      toast.error(t('Failed', 'Error'));
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
          <Zap className="h-6 w-6 text-[var(--color-gold)]" />
          {t('GoHighLevel Integration', 'Integración con GoHighLevel')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            'Sync leads from your website directly to GoHighLevel CRM automatically.',
            'Sincroniza los leads de tu web directamente con GoHighLevel automáticamente.'
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
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {config.isActive ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {config.isActive ? t('Connected', 'Conectado') : t('Inactive', 'Inactivo')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Location: <code className="rounded bg-muted px-1 text-[10px]">{config.locationId?.slice(0, 16)}...</code>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setForm({ apiKey: '', locationId: config.locationId || '', pipelineId: config.pipelineId || '', pipelineStageId: config.pipelineStageId || '', isActive: config.isActive }); setShowForm(true); }}>
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                    {t('Edit', 'Editar')}
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {t('Disconnect', 'Desconectar')}
                  </Button>
                </div>
              </div>

              {/* Credentials preview */}
              <div className="grid gap-3 rounded-lg bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">API Token</p>
                  <p className="font-mono text-sm">{config.apiKey || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">{t('Last sync', 'Última sync')}</p>
                  <p className="text-sm">{config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : t('Never', 'Nunca')}</p>
                </div>
              </div>

              {config.lastError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('Last error', 'Último error')}:</p>
                    <p className="text-xs">{config.lastError}</p>
                  </div>
                </div>
              )}

              {/* Info badge */}
              <div className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)]/5 p-3">
                <Zap className="h-4 w-4 text-[var(--color-accent)]" />
                <p className="text-xs text-muted-foreground">
                  {t(
                    'Every lead from the website form is automatically sent to your GoHighLevel as a new contact.',
                    'Cada lead del formulario web se envía automáticamente a tu GoHighLevel como un nuevo contacto.'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Zap className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold">{t('GoHighLevel not connected', 'GoHighLevel no conectado')}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t(
                  'Connect your GoHighLevel account to automatically sync every website lead to your CRM.',
                  'Conecta tu cuenta de GoHighLevel para sincronizar automáticamente cada lead de la web con tu CRM.'
                )}
              </p>
              <Button onClick={() => setShowForm(true)} className="mt-5 bg-[var(--color-gold)] text-[var(--color-primary)] hover:brightness-110">
                <Zap className="mr-2 h-4 w-4" />
                {t('Connect GoHighLevel', 'Conectar GoHighLevel')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-3 font-semibold">{t('How to get your credentials', 'Cómo obtener tus credenciales')}</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. {t('Go to your GoHighLevel → Settings → API / Developer', 'Ve a GoHighLevel → Settings → API / Developer')}</li>
            <li>2. {t('Generate a Private Access Token (starts with "pit-")', 'Genera un Private Access Token (empieza con "pit-")')}</li>
            <li>3. {t('Copy the token and your Location ID', 'Copia el token y tu Location ID')}</li>
            <li>4. {t('Paste them below — they are stored encrypted', 'Pégalos abajo — se guardan encriptados')}</li>
          </ol>
        </CardContent>
      </Card>

      {/* Edit/Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{config ? t('Update GoHighLevel', 'Actualizar GoHighLevel') : t('Connect GoHighLevel', 'Conectar GoHighLevel')}</DialogTitle>
            <DialogDescription>
              {t('Enter your GoHighLevel API credentials.', 'Ingresa tus credenciales de GoHighLevel API.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">API Token (pit-...) *</Label>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Location ID', 'Location ID')} *</Label>
              <Input
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">{t('Pipeline ID (optional)', 'Pipeline ID (opcional)')}</Label>
              <Input
                value={form.pipelineId}
                onChange={(e) => setForm({ ...form, pipelineId: e.target.value })}
                placeholder={t('Assign to specific pipeline', 'Asignar a pipeline específico')}
              />
            </div>
            <label className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <span className="text-sm">{t('Active (sync leads)', 'Activo (sincronizar leads)')}</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t('Cancel', 'Cancelar')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('Save & Connect', 'Guardar y Conectar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('Disconnect GoHighLevel?', '¿Desconectar GoHighLevel?')}</DialogTitle>
            <DialogDescription>
              {t('Leads will stop syncing to GHL. They still save in your dashboard.', 'Los leads dejarán de sincronizarse con GHL. Se seguirán guardando en tu panel.')}
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
