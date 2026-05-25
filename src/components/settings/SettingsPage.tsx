'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Bell, Globe, Building2, Save, UserPlus, ShieldCheck, Mail, Smartphone, ToggleLeft, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useT } from '@/hooks/useT';

const teamMembers = [
  { id: '1', name: 'Admin User', email: 'admin@reysmart.com', role: 'admin', status: 'active', initials: 'AU' },
  { id: '2', name: 'Maria Counselor', email: 'maria@reysmart.com', role: 'agent', status: 'active', initials: 'MC' },
  { id: '3', name: 'Carlos Agent', email: 'carlos@reysmart.com', role: 'agent', status: 'active', initials: 'CA' },
  { id: '4', name: 'Sarah Specialist', email: 'sarah@reysmart.com', role: 'agent', status: 'inactive', initials: 'SS' },
];

const roleColor = (r: string) => r === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800';

export function SettingsPage() {
  const { t } = useT();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Rey Smart Solution',
    phone: '(407) 432-8872',
    email: 'info@reysmartsolution.com',
    address: '7800 S US Hwy 17/92, Ste 194, Fern Park, FL 32730',
    website: 'https://reysmartsolution.com',
    primaryColor: 'teal',
    timezone: 'America/New_York',
    currency: 'USD',
    defaultLang: 'en',
    enableEmail: true,
    enableSms: false,
    autoReminders: true,
  });

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.settings.title}</h1>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="company" className="gap-2"><Building2 className="w-4 h-4" />{t.settings.companyProfile}</TabsTrigger>
          <TabsTrigger value="team" className="gap-2"><Users className="w-4 h-4" />{t.settings.team}</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />{t.settings.notifications}</TabsTrigger>
          <TabsTrigger value="language" className="gap-2"><Globe className="w-4 h-4" />{t.settings.language}</TabsTrigger>
        </TabsList>

        {/* Company Profile */}
        <TabsContent value="company">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.companyProfile}</CardTitle>
                <CardDescription>Manage your company information and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>{t.settings.companyName}</Label><Input value={settings.companyName} onChange={e => updateSetting('companyName', e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t.settings.phone}</Label><Input value={settings.phone} onChange={e => updateSetting('phone', e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t.settings.email}</Label><Input value={settings.email} onChange={e => updateSetting('email', e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t.settings.website}</Label><Input value={settings.website} onChange={e => updateSetting('website', e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>{t.settings.address}</Label><Textarea value={settings.address} onChange={e => updateSetting('address', e.target.value)} rows={2} /></div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Palette className="w-4 h-4" />{t.settings.primaryColor}</Label>
                  <div className="flex gap-3">
                    {['teal', 'emerald', 'blue', 'purple', 'orange'].map(c => (
                      <button key={c} onClick={() => updateSetting('primaryColor', c)} className={`w-10 h-10 rounded-full border-2 ${settings.primaryColor === c ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent'} bg-${c}-500`} />
                    ))}
                  </div>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white"><Save className="w-4 h-4 mr-2" />{t.settings.save}</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t.settings.team}</CardTitle>
                  <CardDescription>Manage team members and permissions</CardDescription>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white"><UserPlus className="w-4 h-4 mr-2" />{t.settings.inviteMember}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>{t.settings.inviteMember}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>{t.auth.fullName}</Label><Input placeholder="Full name" /></div>
                      <div><Label>{t.auth.email}</Label><Input type="email" placeholder="email@example.com" /></div>
                      <div><Label>{t.settings.role}</Label>
                        <Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">{t.settings.admin}</SelectItem><SelectItem value="agent">{t.settings.agent}</SelectItem></SelectContent></Select>
                      </div>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setInviteOpen(false)}>{t.common.save}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.clients.name}</TableHead>
                      <TableHead>{t.auth.email}</TableHead>
                      <TableHead>{t.settings.role}</TableHead>
                      <TableHead>{t.disputes.status}</TableHead>
                      <TableHead>{t.clients.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8"><AvatarFallback className="bg-teal-100 text-teal-700 text-xs">{m.initials}</AvatarFallback></Avatar>
                            <span className="font-medium">{m.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell><Badge className={roleColor(m.role)}>{m.role === 'admin' ? t.settings.admin : t.settings.agent}</Badge></TableCell>
                        <TableCell><Badge className={m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}>{m.status}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="sm">{m.status === 'active' ? t.settings.deactivate : 'Activate'}</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.notifications}</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'enableEmail', icon: Mail, label: t.settings.enableEmail, desc: 'Send email notifications for important events' },
                    { key: 'enableSms', icon: Smartphone, label: t.settings.enableSms, desc: 'Send SMS notifications to clients and team' },
                    { key: 'autoReminders', icon: Bell, label: t.settings.autoReminders, desc: 'Automatically remind clients of appointments and deadlines' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-teal-50"><item.icon className="w-5 h-5 text-teal-600" /></div>
                        <div><p className="font-medium">{item.label}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
                      </div>
                      <Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={(v) => updateSetting(item.key, v)} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Email Template</Label><Textarea placeholder="Welcome email template..." rows={4} /></div>
                  <div className="space-y-2"><Label>SMS Template</Label><Textarea placeholder="SMS reminder template..." rows={4} /></div>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white"><Save className="w-4 h-4 mr-2" />{t.settings.save}</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Language & Locale */}
        <TabsContent value="language">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.language}</CardTitle>
                <CardDescription>Configure language and regional settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>{t.settings.defaultLanguage}</Label>
                    <Select value={settings.defaultLang} onValueChange={v => updateSetting('defaultLang', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="en">{t.settings.english}</SelectItem><SelectItem value="es">{t.settings.spanish}</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t.settings.timezone}</Label>
                    <Select value={settings.timezone} onValueChange={v => updateSetting('timezone', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t.settings.currency}</Label>
                    <Select value={settings.currency} onValueChange={v => updateSetting('currency', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white"><Save className="w-4 h-4 mr-2" />{t.settings.save}</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
