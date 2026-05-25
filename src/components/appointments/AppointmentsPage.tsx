'use client';

import { useState, useMemo } from 'react';
import { useT } from '@/hooks/useT';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  CalendarIcon, Clock, Plus, List, CheckCircle2, XCircle, Eye,
  ChevronLeft, ChevronRight, CalendarDays,
} from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  agentName: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', clientName: 'Maria Garcia', agentName: 'Sarah Johnson', date: '2025-07-14', time: '09:00', duration: '30 min', type: 'Consultation', status: 'confirmed', notes: 'First consultation' },
  { id: '2', clientName: 'Carlos Rodriguez', agentName: 'Sarah Johnson', date: '2025-07-14', time: '11:00', duration: '60 min', type: 'Follow Up', status: 'scheduled', notes: 'Review credit report' },
  { id: '3', clientName: 'Ana Martinez', agentName: 'Mike Chen', date: '2025-07-15', time: '14:00', duration: '45 min', type: 'Review', status: 'scheduled', notes: '' },
  { id: '4', clientName: 'Robert Lopez', agentName: 'Mike Chen', date: '2025-07-15', time: '10:30', duration: '30 min', type: 'Consultation', status: 'confirmed', notes: 'New client' },
  { id: '5', clientName: 'Sofia Hernandez', agentName: 'Sarah Johnson', date: '2025-07-16', time: '15:00', duration: '60 min', type: 'Follow Up', status: 'completed', notes: 'Dispute review' },
  { id: '6', clientName: 'Luis Gonzalez', agentName: 'Mike Chen', date: '2025-07-17', time: '09:30', duration: '30 min', type: 'Enrollment', status: 'scheduled', notes: '' },
  { id: '7', clientName: 'Elena Torres', agentName: 'Sarah Johnson', date: '2025-07-10', time: '11:00', duration: '45 min', type: 'Review', status: 'completed', notes: 'Score improvement discussion' },
  { id: '8', clientName: 'David Ruiz', agentName: 'Mike Chen', date: '2025-07-08', time: '14:30', duration: '30 min', type: 'Consultation', status: 'cancelled', notes: 'Client rescheduled' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Confirmed', className: 'bg-teal-100 text-teal-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-600' },
  no_show: { label: 'No Show', className: 'bg-gray-100 text-gray-600' },
};

export function AppointmentsPage() {
  const { t } = useT();
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6, 1)); // July 2025
  const [formData, setFormData] = useState({
    client: '',
    agent: '',
    date: '',
    time: '',
    duration: '30',
    type: '',
    notes: '',
  });

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const calendarDays: Array<{ date: string; isCurrentMonth: boolean; appointments: Appointment[] }> = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ date: dateStr, isCurrentMonth: false, appointments: [] });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(a => a.date === dateStr);
    calendarDays.push({ date: dateStr, isCurrentMonth: true, appointments: dayAppointments });
  }

  // Next month leading days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ date: dateStr, isCurrentMonth: false, appointments: [] });
  }

  const monthLabel = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const selectedDateAppointments = selectedDate
    ? appointments.filter(a => a.date === selectedDate)
    : [];

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function handleStatusChange(id: string, newStatus: Appointment['status']) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  }

  function handleCreate() {
    if (!formData.client || !formData.agent || !formData.date || !formData.time || !formData.type) return;
    const newAppt: Appointment = {
      id: String(Date.now()),
      clientName: formData.client,
      agentName: formData.agent,
      date: formData.date,
      time: formData.time,
      duration: `${formData.duration} min`,
      type: formData.type,
      status: 'scheduled',
      notes: formData.notes,
    };
    setAppointments(prev => [...prev, newAppt]);
    setShowCreateModal(false);
    setFormData({ client: '', agent: '', date: '', time: '', duration: '30', type: '', notes: '' });
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.appointments.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{appointments.length} total appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4 mr-1.5" /> Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1.5" /> List
            </Button>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> {t.appointments.create}
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardContent className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-semibold text-gray-900">{monthLabel}</h3>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-t-lg overflow-hidden">
                {DAYS.map(d => (
                  <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Cells */}
              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-b-lg overflow-hidden">
                {calendarDays.map((day, idx) => {
                  const isSelected = day.date === selectedDate;
                  const hasAppts = day.appointments.length > 0;
                  const dayNum = parseInt(day.date.split('-')[2], 10);

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (day.isCurrentMonth) {
                          setSelectedDate(isSelected ? null : day.date);
                        }
                      }}
                      className={`bg-white min-h-[72px] p-1.5 text-left transition-colors hover:bg-gray-50 ${
                        !day.isCurrentMonth ? 'opacity-40' : ''
                      } ${isSelected ? 'bg-teal-50 ring-2 ring-teal-500 ring-inset' : ''}`}
                    >
                      <span className={`text-xs font-medium ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {dayNum}
                      </span>
                      {hasAppts && day.isCurrentMonth && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {day.appointments.slice(0, 3).map(a => (
                            <span
                              key={a.id}
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                a.status === 'completed' ? 'bg-emerald-500' :
                                a.status === 'confirmed' ? 'bg-teal-500' :
                                a.status === 'cancelled' ? 'bg-red-400' :
                                'bg-blue-500'
                              }`}
                            />
                          ))}
                          {day.appointments.length > 3 && (
                            <span className="text-[10px] text-gray-400 ml-0.5">+{day.appointments.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Appointments */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedDate
                  ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                  : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No appointments</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDateAppointments.map(appt => (
                    <div key={appt.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-sm font-semibold text-gray-900">{appt.time}</span>
                        <span className="text-xs text-gray-400">({appt.duration})</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{appt.clientName}</p>
                      <p className="text-xs text-gray-500">{appt.agentName} • {appt.type}</p>
                      <div className="mt-2">
                        <Badge className={STATUS_CONFIG[appt.status]?.className || ''}>
                          {STATUS_CONFIG[appt.status]?.label || appt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View - Table */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 bg-gray-50/50">
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Agent</TableHead>
                    <TableHead className="font-semibold">Date / Time</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{appt.clientName}</TableCell>
                      <TableCell className="text-gray-600">{appt.agentName}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {new Date(appt.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500">{appt.time}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{appt.type}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{appt.duration}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[appt.status]?.className || ''}>
                          {STATUS_CONFIG[appt.status]?.label || appt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {appt.status === 'scheduled' && (
                            <>
                              <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700 h-8"
                                onClick={() => handleStatusChange(appt.id, 'confirmed')}>
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 h-8"
                                onClick={() => handleStatusChange(appt.id, 'cancelled')}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {appt.status === 'confirmed' && (
                            <>
                              <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 h-8"
                                onClick={() => handleStatusChange(appt.id, 'completed')}>
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 h-8"
                                onClick={() => handleStatusChange(appt.id, 'cancelled')}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-600 h-8"
                                onClick={() => handleStatusChange(appt.id, 'no_show')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {(appt.status === 'completed' || appt.status === 'cancelled' || appt.status === 'no_show') && (
                            <Button size="sm" variant="ghost" className="text-gray-400 h-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.appointments.create}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={formData.client} onValueChange={(v) => setFormData(p => ({ ...p, client: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maria Garcia">Maria Garcia</SelectItem>
                    <SelectItem value="Carlos Rodriguez">Carlos Rodriguez</SelectItem>
                    <SelectItem value="Ana Martinez">Ana Martinez</SelectItem>
                    <SelectItem value="Robert Lopez">Robert Lopez</SelectItem>
                    <SelectItem value="Sofia Hernandez">Sofia Hernandez</SelectItem>
                    <SelectItem value="Luis Gonzalez">Luis Gonzalez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select value={formData.agent} onValueChange={(v) => setFormData(p => ({ ...p, agent: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={formData.time} onValueChange={(v) => setFormData(p => ({ ...p, time: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(time => (
                      <SelectItem key={time} value={time}>
                        {new Date(`2025-01-01T${time}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData(p => ({ ...p, duration: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">{t.appointments.consultation}</SelectItem>
                    <SelectItem value="Follow Up">{t.appointments.followUp}</SelectItem>
                    <SelectItem value="Review">{t.appointments.review}</SelectItem>
                    <SelectItem value="Enrollment">{t.appointments.enrollment}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>{t.common.cancel}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleCreate}>{t.common.create}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
