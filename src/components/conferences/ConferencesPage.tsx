'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar, Clock, Users, Video, Plus, ExternalLink, ChevronRight,
  MapPin, UserPlus, CalendarDays, LayoutList,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────
interface Registrant {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

interface Conference {
  id: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  type: 'Webinar' | 'Workshop' | 'Seminar' | 'One on One';
  date: string;
  time: string;
  duration: string;
  maxAttendees: number;
  registeredCount: number;
  meetingLink: string;
  isRecurring: boolean;
  registrants: Registrant[];
}

// ── Demo Data ─────────────────────────────────────────────────────────
const DEMO_EVENTS: Conference[] = [
  {
    id: 'EVT-001',
    title: 'Credit Repair Workshop',
    titleEs: 'Taller de Reparación de Crédito',
    description: 'Learn proven strategies to repair your credit from industry experts. Topics include dispute letters, bureau communication, and monitoring your progress.',
    descriptionEs: 'Aprende estrategias probadas para reparar tu crédito con expertos de la industria.',
    type: 'Workshop',
    date: '2025-06-15',
    time: '10:00 AM',
    duration: '2 hours',
    maxAttendees: 50,
    registeredCount: 32,
    meetingLink: '',
    isRecurring: false,
    registrants: [
      { id: 'R1', name: 'Maria Garcia', email: 'maria@email.com', registeredAt: '2025-05-20' },
      { id: 'R2', name: 'Carlos Rodriguez', email: 'carlos@email.com', registeredAt: '2025-05-22' },
      { id: 'R3', name: 'Ana Martinez', email: 'ana@email.com', registeredAt: '2025-05-25' },
    ],
  },
  {
    id: 'EVT-002',
    title: 'First-Time Homebuyer Seminar',
    titleEs: 'Seminario para Primer Comprador',
    description: 'Comprehensive seminar covering everything first-time buyers need to know: credit requirements, down payment programs, and the mortgage process.',
    descriptionEs: 'Seminario completo que cubre todo lo que los primeros compradores necesitan saber.',
    type: 'Seminar',
    date: '2025-06-22',
    time: '1:00 PM',
    duration: '3 hours',
    maxAttendees: 40,
    registeredCount: 28,
    meetingLink: '',
    isRecurring: false,
    registrants: [
      { id: 'R4', name: 'Sofia Hernandez', email: 'sofia@email.com', registeredAt: '2025-06-01' },
      { id: 'R5', name: 'Jorge Ramirez', email: 'jorge@email.com', registeredAt: '2025-06-03' },
    ],
  },
  {
    id: 'EVT-003',
    title: 'Budgeting 101 Webinar',
    titleEs: 'Seminario Web de Presupuesto',
    description: 'Interactive webinar on creating a budget that works. Includes live Q&A with financial counselors and downloadable budgeting templates.',
    descriptionEs: 'Seminario web interactivo sobre cómo crear un presupuesto que funcione.',
    type: 'Webinar',
    date: '2025-07-01',
    time: '6:00 PM',
    duration: '1 hour',
    maxAttendees: 200,
    registeredCount: 145,
    meetingLink: 'https://zoom.us/j/1234567890',
    isRecurring: true,
    registrants: [
      { id: 'R6', name: 'Isabella Cruz', email: 'isabella@email.com', registeredAt: '2025-06-10' },
      { id: 'R7', name: 'Robert Lopez', email: 'robert@email.com', registeredAt: '2025-06-12' },
      { id: 'R8', name: 'Maria Garcia', email: 'maria@email.com', registeredAt: '2025-06-15' },
      { id: 'R9', name: 'Ana Martinez', email: 'ana@email.com', registeredAt: '2025-06-18' },
    ],
  },
  {
    id: 'EVT-004',
    title: 'One-on-One Credit Counseling',
    titleEs: 'Asesoría Individual',
    description: 'Personalized 30-minute credit counseling sessions with certified counselors. Get a custom action plan for your credit improvement journey.',
    descriptionEs: 'Sesiones de 30 minutos de asesoría crediticia personalizada con consejeros certificados.',
    type: 'One on One',
    date: '2025-07-05',
    time: '9:00 AM',
    duration: '30 min',
    maxAttendees: 8,
    registeredCount: 5,
    meetingLink: 'https://zoom.us/j/9876543210',
    isRecurring: true,
    registrants: [
      { id: 'R10', name: 'Carlos Rodriguez', email: 'carlos@email.com', registeredAt: '2025-06-20' },
    ],
  },
  {
    id: 'EVT-005',
    title: 'Debt Management Workshop',
    titleEs: 'Taller de Manejo de Deudas',
    description: 'Hands-on workshop teaching practical debt management techniques including snowball vs avalanche methods and negotiation strategies.',
    descriptionEs: 'Taller práctico que enseña técnicas de manejo de deudas incluyendo métodos bola de nieve vs avalancha.',
    type: 'Workshop',
    date: '2025-07-15',
    time: '2:00 PM',
    duration: '2 hours',
    maxAttendees: 60,
    registeredCount: 41,
    meetingLink: '',
    isRecurring: false,
    registrants: [
      { id: 'R11', name: 'Sofia Hernandez', email: 'sofia@email.com', registeredAt: '2025-06-25' },
      { id: 'R12', name: 'Jorge Ramirez', email: 'jorge@email.com', registeredAt: '2025-06-28' },
    ],
  },
];

// ── Constants ─────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Webinar: 'bg-purple-100 text-purple-700',
  Workshop: 'bg-teal-100 text-teal-700',
  Seminar: 'bg-amber-100 text-amber-700',
  'One on One': 'bg-rose-100 text-rose-700',
};

const TYPE_ICONS: Record<string, typeof Video> = {
  Webinar: Video,
  Workshop: Users,
  Seminar: Calendar,
  'One on One': MapPin,
};

// ── Component ─────────────────────────────────────────────────────────
export function ConferencesPage() {
  const { t, language } = useT();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Conference | null>(null);
  const [showRegistrants, setShowRegistrants] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');

  // ── Create Form State ──
  const [newType, setNewType] = useState('');
  const [newRecurring, setNewRecurring] = useState(false);

  // ── Filtering ──
  const filtered = useMemo(() => {
    if (typeFilter === 'All') return DEMO_EVENTS;
    return DEMO_EVENTS.filter(e => e.type === typeFilter);
  }, [typeFilter]);

  // ── Helpers ──
  const getText = useCallback((event: Conference, field: 'title' | 'description') => {
    if (language === 'es') {
      return field === 'title' ? event.titleEs : event.descriptionEs;
    }
    return event[field];
  }, [language]);

  const typeLabel = useCallback((type: string) => {
    if (language === 'es') {
      switch (type) {
        case 'Webinar': return t.conferences.webinar;
        case 'Workshop': return t.conferences.workshop;
        case 'Seminar': return t.conferences.seminar;
        case 'One on One': return t.conferences.oneOnOne;
        case 'All': return t.conferences.allTypes;
        default: return type;
      }
    }
    return type;
  }, [language, t]);

  const formatDate = useCallback((dateStr: string) => {
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  }, [language]);

  const openRegistrants = useCallback((event: Conference) => {
    setSelectedEvent(event);
    setShowRegistrants(true);
  }, []);

  // ── Calendar View: Group events by month ──
  const calendarGroups = useMemo(() => {
    const groups: Record<string, Conference[]> = {};
    filtered.forEach(event => {
      const month = new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[month]) groups[month] = [];
      groups[month].push(event);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.conferences.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} {language === 'es' ? 'eventos' : 'events'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'list' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'calendar' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />{t.conferences.createEvent}
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t.conferences.allTypes} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{typeLabel('All')}</SelectItem>
            <SelectItem value="Webinar">{typeLabel('Webinar')}</SelectItem>
            <SelectItem value="Workshop">{typeLabel('Workshop')}</SelectItem>
            <SelectItem value="Seminar">{typeLabel('Seminar')}</SelectItem>
            <SelectItem value="One on One">{typeLabel('One on One')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Upcoming Events Section Header ── */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          {t.conferences.upcoming}
        </h3>
      </div>

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">{t.common.noResults}</p>
            </div>
          ) : (
            filtered.map((event, i) => {
              const isFull = event.registeredCount >= event.maxAttendees;
              const fillPercent = Math.min((event.registeredCount / event.maxAttendees) * 100, 100);
              const TypeIcon = TYPE_ICONS[event.type] || Calendar;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-6">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={TYPE_COLORS[event.type]}>{typeLabel(event.type)}</Badge>
                        {event.isRecurring && (
                          <Badge className="bg-gray-100 text-gray-600">
                            {t.conferences.recurring}
                          </Badge>
                        )}
                        {isFull && (
                          <Badge className="bg-red-100 text-red-600">
                            {language === 'es' ? 'Lleno' : 'Full'}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                        {getText(event, 'title')}
                      </h4>

                      {/* Description */}
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {getText(event, 'description')}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {event.time} · {event.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          {event.registeredCount} / {event.maxAttendees} {t.conferences.registered.toLowerCase()}
                        </div>
                        {event.meetingLink && (
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-gray-400" />
                            <span className="text-teal-600 flex items-center gap-1">
                              Meeting Link <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            fillPercent >= 90 ? 'bg-red-500' : fillPercent >= 70 ? 'bg-amber-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                          size="sm"
                          disabled={isFull}
                        >
                          {isFull ? (language === 'es' ? 'Lleno' : 'Full') : t.conferences.register}
                          {!isFull && <ChevronRight className="w-4 h-4 ml-1" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRegistrants(event)}
                          className="text-gray-600"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── Calendar View ── */}
      {viewMode === 'calendar' && (
        <div className="space-y-8">
          {Object.entries(calendarGroups).length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">{t.common.noResults}</p>
            </div>
          ) : (
            Object.entries(calendarGroups).map(([month, events]) => (
              <div key={month}>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{month}</h4>
                <div className="space-y-3">
                  {events.map(event => {
                    const TypeIcon = TYPE_ICONS[event.type] || Calendar;
                    const isFull = event.registeredCount >= event.maxAttendees;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openRegistrants(event)}>
                          <CardContent className="py-4 flex items-center gap-4">
                            {/* Date Block */}
                            <div className="w-14 h-14 rounded-lg bg-teal-50 flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-teal-600 uppercase">
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold text-teal-700">
                                {new Date(event.date).getDate()}
                              </span>
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <Badge className={`text-xs ${TYPE_COLORS[event.type]}`}>{typeLabel(event.type)}</Badge>
                                {event.isRecurring && (
                                  <Badge className="text-xs bg-gray-100 text-gray-600">{t.conferences.recurring}</Badge>
                                )}
                              </div>
                              <h5 className="font-semibold text-gray-900 truncate">{getText(event, 'title')}</h5>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time} · {event.duration}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.registeredCount}/{event.maxAttendees}</span>
                              </div>
                            </div>

                            {/* Register Button */}
                            <Button
                              className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white"
                              size="sm"
                              disabled={isFull}
                              onClick={e => e.stopPropagation()}
                            >
                              {isFull ? (language === 'es' ? 'Lleno' : 'Full') : t.conferences.register}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Registrants Panel (Sheet) ── */}
      <Sheet open={showRegistrants} onOpenChange={setShowRegistrants}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selectedEvent && (
            <>
              <SheetHeader className="space-y-1 pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  {t.conferences.registrants}
                </SheetTitle>
                <SheetDescription>
                  {getText(selectedEvent, 'title')} · {selectedEvent.registeredCount}/{selectedEvent.maxAttendees}
                </SheetDescription>
              </SheetHeader>

              {/* Event Summary */}
              <Card className="border border-gray-100 mb-4">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={TYPE_COLORS[selectedEvent.type]}>{typeLabel(selectedEvent.type)}</Badge>
                    <span className="text-gray-500">{formatDate(selectedEvent.date)} · {selectedEvent.time}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((selectedEvent.registeredCount / selectedEvent.maxAttendees) * 100, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Separator className="mb-4" />

              {/* Registrants List */}
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-3">
                  {selectedEvent.registrants.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">{language === 'es' ? 'Sin registrados aún' : 'No registrants yet'}</p>
                  ) : (
                    selectedEvent.registrants.map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-teal-50 text-teal-700 text-xs font-semibold">
                            {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(r.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Create Event Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.conferences.createEvent}</DialogTitle>
            <DialogDescription>Add a new event or conference to the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input placeholder="Event title..." />
            </div>
            <div className="space-y-2">
              <Label>Title (Spanish)</Label>
              <Input placeholder="Título del evento..." />
            </div>
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea rows={2} placeholder="Event description..." />
            </div>
            <div className="space-y-2">
              <Label>Description (Spanish)</Label>
              <Textarea rows={2} placeholder="Descripción del evento..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.conferences.type}</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="One on One">One on One</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.conferences.duration}</Label>
                <Input placeholder="e.g. 2 hours" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.conferences.date}</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t.conferences.time}</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.conferences.maxAttendees}</Label>
                <Input type="number" placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label>{t.conferences.meetingLink}</Label>
                <Input placeholder="https://zoom.us/j/..." />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">{t.conferences.recurring}</Label>
                <p className="text-xs text-gray-400">
                  {language === 'es' ? 'Este evento se repite periódicamente' : 'This event repeats on a schedule'}
                </p>
              </div>
              <Switch checked={newRecurring} onCheckedChange={setNewRecurring} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t.common.cancel}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">{t.common.create}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
