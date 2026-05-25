'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, BookOpen, MessageSquare, CalendarDays, Home, ChevronRight, TrendingUp, Award, Clock, User, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { useT } from '@/hooks/useT';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const scoreHistory = [
  { month: 'Jan', score: 580 }, { month: 'Feb', score: 595 }, { month: 'Mar', score: 612 },
  { month: 'Apr', score: 628 }, { month: 'May', score: 635 }, { month: 'Jun', score: 642 },
];

const myDisputes = [
  { id: '1', bureau: 'Equifax', item: 'Late Payment - Capital One', status: 'in_progress', date: '2024-05-15' },
  { id: '2', bureau: 'Experian', item: 'Collection - Medical Bill', status: 'sent', date: '2024-05-20' },
  { id: '3', bureau: 'TransUnion', item: 'Charge Off - Credit One', status: 'completed', date: '2024-04-10' },
];

const availableCourses = [
  { id: '1', titleEn: 'Credit Fundamentals 101', titleEs: 'Fundamentos de Crédito 101', level: 'beginner', duration: '45 min', enrolled: false },
  { id: '2', titleEn: 'Budgeting for Success', titleEs: 'Presupuesto para el Éxito', level: 'beginner', duration: '30 min', enrolled: true },
  { id: '3', titleEn: 'Debt Consolidation Strategies', titleEs: 'Estrategias de Consolidación', level: 'intermediate', duration: '60 min', enrolled: false },
  { id: '4', titleEn: 'First-Time Homebuyer Guide', titleEs: 'Guía para Primer Comprador', level: 'advanced', duration: '90 min', enrolled: false },
  { id: '5', titleEn: 'Understanding Credit Scores', titleEs: 'Entendiendo los Puntajes', level: 'beginner', duration: '45 min', enrolled: true },
];

const creditTips = [
  { icon: CreditCard, title: 'Pay on Time', desc: 'Payment history is 35% of your credit score. Set up auto-pay to never miss a due date.' },
  { icon: TrendingUp, title: 'Reduce Utilization', desc: 'Keep credit card balances below 30% of your limit to improve your score.' },
  { icon: Shield, title: 'Monitor Reports', desc: 'Check your credit reports from all three bureaus regularly for errors.' },
];

const statusColors: Record<string, string> = {
  in_progress: 'bg-amber-100 text-amber-800',
  sent: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-gray-100 text-gray-600',
};
const levelColors: Record<string, string> = {
  beginner: 'bg-teal-100 text-teal-800',
  intermediate: 'bg-amber-100 text-amber-800',
  advanced: 'bg-purple-100 text-purple-800',
};

const getScoreColor = (score: number) => {
  if (score >= 700) return 'text-emerald-500';
  if (score >= 600) return 'text-amber-500';
  return 'text-red-500';
};

const getScoreLabel = (score: number) => {
  if (score >= 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Fair';
  return 'Needs Work';
};

export function ClientPortalPage() {
  const { t, language } = useT();
  const currentView = useNavigationStore(s => s.currentView);
  const navigate = useNavigationStore(s => s.navigate);
  const user = useAuthStore(s => s.user);
  const [messageText, setMessageText] = useState('');
  const [bookOpen, setBookOpen] = useState(false);

  const portalNavItems = [
    { id: 'client-portal', icon: Home, label: t.common.dashboard },
    { id: 'client-portal-credit', icon: CreditCard, label: t.nav.myCredit },
    { id: 'client-portal-disputes', icon: Shield, label: t.nav.myDisputes },
    { id: 'client-portal-courses', icon: BookOpen, label: t.courses.myCourses },
    { id: 'client-portal-messages', icon: MessageSquare, label: t.nav.messages },
    { id: 'client-portal-schedule', icon: CalendarDays, label: t.nav.appointments },
  ];

  const renderPortalContent = () => {
    switch (currentView) {
      case 'client-portal-credit':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t.nav.myCredit}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { bureau: 'Equifax', score: 642, color: '#0f766e' },
                { bureau: 'Experian', score: 638, color: '#059669' },
                { bureau: 'TransUnion', score: 645, color: '#0d9488' },
              ].map((b) => (
                <Card key={b.bureau}>
                  <CardContent className="text-center p-6">
                    <p className="text-sm text-gray-500 mb-2">{b.bureau}</p>
                    <div className="relative w-28 h-28 mx-auto mb-3">
                      <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="50" cy="50" r="42" stroke={b.color} strokeWidth="8" fill="none" strokeDasharray={`${(b.score / 850) * 264} 264`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center"><span className={`text-3xl font-bold ${getScoreColor(b.score)}`}>{b.score}</span></div>
                    </div>
                    <Badge className={getScoreColor(b.score) === 'text-emerald-500' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>{getScoreLabel(b.score)}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader><CardTitle>Score History</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[500, 700]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} dot={{ fill: '#0f766e', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creditTips.map((tip, i) => (
                <Card key={i}><CardContent className="p-5 flex gap-4">
                  <div className="p-2 rounded-lg bg-teal-50 shrink-0"><tip.icon className="w-5 h-5 text-teal-600" /></div>
                  <div><p className="font-semibold text-sm">{tip.title}</p><p className="text-xs text-gray-500 mt-1">{tip.desc}</p></div>
                </CardContent></Card>
              ))}
            </div>
          </div>
        );

      case 'client-portal-disputes':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t.nav.myDisputes}</h2>
            <div className="space-y-4">
              {myDisputes.map((d) => (
                <Card key={d.id}>
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{d.bureau}</Badge>
                        <Badge className={statusColors[d.status]}>{d.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="font-medium">{d.item}</p>
                      <p className="text-sm text-gray-500">{d.date}</p>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'client-portal-courses':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t.courses.availableCourses}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.map((c) => (
                <Card key={c.id} className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={levelColors[c.level]}>{c.level}</Badge>
                      <span className="text-xs text-gray-500">{c.duration}</span>
                    </div>
                    <h3 className="font-semibold">{language === 'es' ? c.titleEs : c.titleEn}</h3>
                    {c.enrolled ? (
                      <div className="space-y-2"><Progress value={35} className="h-2" /><p className="text-xs text-gray-500">35% complete</p></div>
                    ) : (
                      <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white">{t.courses.enroll}</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'client-portal-messages':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t.nav.messages}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {[
                    { from: 'Maria Counselor', msg: 'Hi! I reviewed your credit report and we have a plan ready. Let\'s schedule a call to discuss.', time: '2 hours ago', isMe: false },
                    { from: 'You', msg: 'Thank you! I\'m available any afternoon this week.', time: '1 hour ago', isMe: true },
                    { from: 'Maria Counselor', msg: 'Great! I have availability on Thursday at 3 PM. I\'ll send you a calendar invite.', time: '30 min ago', isMe: false },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${m.isMe ? 'bg-teal-600 text-white rounded-br-md' : 'bg-gray-100 rounded-bl-md'}`}>
                        <p className="text-sm">{m.from}</p>
                        <p className="text-sm mt-1">{m.msg}</p>
                        <p className="text-xs mt-1 opacity-70">{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." value={messageText} onChange={e => setMessageText(e.target.value)} className="flex-1" />
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setMessageText('')}>{t.messages.send}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'client-portal-schedule':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t.nav.appointments}</h2>
            <Card className="border-dashed border-2 border-teal-200 bg-teal-50/50">
              <CardContent className="p-8 text-center">
                <CalendarDays className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Book an Appointment</h3>
                <p className="text-gray-500 mb-4">Schedule a consultation with your credit counselor</p>
                <Dialog open={bookOpen} onOpenChange={setBookOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white"><CalendarDays className="w-4 h-4 mr-2" />Schedule Now</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>Date</Label><Input type="date" /></div>
                      <div><Label>Time</Label>
                        <Select><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger><SelectContent>
                          <SelectItem value="9:00">9:00 AM</SelectItem><SelectItem value="10:00">10:00 AM</SelectItem><SelectItem value="11:00">11:00 AM</SelectItem><SelectItem value="14:00">2:00 PM</SelectItem><SelectItem value="15:00">3:00 PM</SelectItem><SelectItem value="16:00">4:00 PM</SelectItem>
                        </SelectContent></Select>
                      </div>
                      <div><Label>Type</Label>
                        <Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                          <SelectItem value="consultation">{t.appointments.consultation}</SelectItem><SelectItem value="follow_up">{t.appointments.followUp}</SelectItem><SelectItem value="review">{t.appointments.review}</SelectItem>
                        </SelectContent></Select>
                      </div>
                      <div><Label>Notes</Label><Textarea placeholder="Any specific topics..." /></div>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setBookOpen(false)}>Confirm Booking</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        );

      default: // Dashboard
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-teal-100 text-teal-700">{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback></Avatar>
              <div>
                <h2 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
                <p className="text-gray-500">Here&apos;s your credit health overview</p>
              </div>
            </div>

            {/* Credit Score Hero */}
            <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="8" fill="none" strokeDasharray={`${(642 / 850) * 264} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">642</span>
                    <span className="text-xs opacity-80">Fair</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold">Your Credit Score</h3>
                  <p className="opacity-80 mt-1">You&apos;ve improved by 62 points since joining!</p>
                  <div className="flex gap-4 mt-3">
                    <div className="text-center"><p className="text-2xl font-bold">3</p><p className="text-xs opacity-70">Active Disputes</p></div>
                    <div className="text-center"><p className="text-2xl font-bold">1</p><p className="text-xs opacity-70">Appointments</p></div>
                    <div className="text-center"><p className="text-2xl font-bold">2</p><p className="text-xs opacity-70">Courses</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portalNavItems.filter(n => n.id !== 'client-portal').map((item) => (
                <Button key={item.id} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:border-teal-300 hover:bg-teal-50" onClick={() => navigate(item.id as any)}>
                  <item.icon className="w-6 h-6 text-teal-600" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { icon: Shield, text: 'Dispute sent to Equifax - Late Payment', time: '2 days ago', color: 'text-amber-600 bg-amber-50' },
                    { icon: TrendingUp, text: 'Credit score updated: 635 → 642', time: '5 days ago', color: 'text-emerald-600 bg-emerald-50' },
                    { icon: BookOpen, text: 'Completed lesson: Budgeting Basics', time: '1 week ago', color: 'text-blue-600 bg-blue-50' },
                    { icon: CalendarDays, text: 'Appointment scheduled: Jun 20, 3:00 PM', time: '1 week ago', color: 'text-purple-600 bg-purple-50' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-full ${a.color}`}><a.icon className="w-4 h-4" /></div>
                      <div className="flex-1"><p className="text-sm">{a.text}</p></div>
                      <span className="text-xs text-gray-400">{a.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Portal Sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <Card className="sticky top-4">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {portalNavItems.map((item) => (
                <button key={item.id} onClick={() => navigate(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${currentView === item.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {currentView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div key={currentView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          {renderPortalContent()}
        </motion.div>
      </main>
    </div>
  );
}
