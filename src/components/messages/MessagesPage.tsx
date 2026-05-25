'use client';

import { useState } from 'react';
import { useT } from '@/hooks/useT';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Mail, Send, Inbox, Reply, Trash2, Plus, Search, Paperclip,
  ChevronLeft, Star,
} from 'lucide-react';

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  folder: 'inbox' | 'sent';
  createdAt: string;
  starred?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1', senderName: 'Maria Garcia', senderEmail: 'maria@email.com', toName: 'Admin', toEmail: 'admin@reysmart.com',
    subject: 'Question about my dispute with Equifax', body: 'Hi,\n\nI wanted to check on the status of my dispute with Equifax. Has there been any update since we last spoke? I received a letter but I am not sure how to interpret it.\n\nPlease let me know when you have a moment.\n\nThank you,\nMaria', isRead: false, folder: 'inbox', createdAt: '2025-07-14T09:30:00', starred: true,
  },
  {
    id: '2', senderName: 'Carlos Rodriguez', senderEmail: 'carlos@email.com', toName: 'Admin', toEmail: 'admin@reysmart.com',
    subject: 'Documents uploaded for credit analysis', body: 'Hello,\n\nI have uploaded all the required documents for my credit report analysis. This includes my ID, proof of address, and the disputed items list we discussed.\n\nPlease let me know if you need anything else.\n\nBest regards,\nCarlos', isRead: false, folder: 'inbox', createdAt: '2025-07-14T08:15:00', starred: false,
  },
  {
    id: '3', senderName: 'Ana Martinez', senderEmail: 'ana@email.com', toName: 'Admin', toEmail: 'admin@reysmart.com',
    subject: 'Appointment Confirmation - July 15th', body: 'Hi team,\n\nI confirm my appointment for July 15th at 2:00 PM. I will bring all necessary documents.\n\nThank you,\nAna', isRead: false, folder: 'inbox', createdAt: '2025-07-13T16:45:00', starred: false,
  },
  {
    id: '4', senderName: 'Robert Lopez', senderEmail: 'robert@email.com', toName: 'Admin', toEmail: 'admin@reysmart.com',
    subject: 'Payment confirmation for June invoice', body: 'Hello,\n\nI just completed the payment for my June invoice. Please confirm receipt.\n\nThanks,\nRobert', isRead: true, folder: 'inbox', createdAt: '2025-07-12T11:20:00', starred: false,
  },
  {
    id: '5', senderName: 'Admin', senderEmail: 'admin@reysmart.com', toName: 'Maria Garcia', toEmail: 'maria@email.com',
    subject: 'Welcome to Rey Smart Solution', body: 'Dear Maria,\n\nWelcome to Rey Smart Solution! We are excited to work with you on improving your credit score.\n\nYour dedicated counselor will be reaching out within 24 hours to schedule your initial consultation.\n\nIn the meantime, please feel free to explore the client portal and review the resources available to you.\n\nBest regards,\nThe Rey Smart Solution Team', isRead: true, folder: 'sent', createdAt: '2025-07-10T10:00:00', starred: true,
  },
  {
    id: '6', senderName: 'Admin', senderEmail: 'admin@reysmart.com', toName: 'Carlos Rodriguez', toEmail: 'carlos@email.com',
    subject: 'Credit Report Analysis Complete', body: 'Hi Carlos,\n\nYour credit report analysis is now complete. Here are the key findings:\n\n- 3 items identified for dispute (Equifax, Experian, TransUnion)\n- 2 items marked for removal (unverified collections)\n- 1 item requiring additional documentation\n\nPlease log in to your portal to view the full report and recommended action plan.\n\nBest regards,\nRey Smart Solution Team', isRead: true, folder: 'sent', createdAt: '2025-07-09T14:30:00', starred: false,
  },
  {
    id: '7', senderName: 'Admin', senderEmail: 'admin@reysmart.com', toName: 'Sofia Hernandez', toEmail: 'sofia@email.com',
    subject: 'Monthly Progress Update', body: 'Hi Sofia,\n\nHere is your monthly progress update:\n\n- Credit score improved from 542 to 578 (+36 points)\n- 2 disputes successfully resolved\n- 1 dispute still in progress\n\nGreat progress this month! Keep up the good work.\n\nBest,\nRSS Team', isRead: true, folder: 'sent', createdAt: '2025-07-08T09:00:00', starred: false,
  },
  {
    id: '8', senderName: 'Sofia Hernandez', senderEmail: 'sofia@email.com', toName: 'Admin', toEmail: 'admin@reysmart.com',
    subject: 'Thank you for the progress update!', body: 'Thank you so much for the update! I am really happy with the progress. Looking forward to continuing working together.\n\nBest,\nSofia', isRead: true, folder: 'inbox', createdAt: '2025-07-08T10:15:00', starred: false,
  },
];

function formatMessageTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function MessagesPage() {
  const { t } = useT();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' });
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredMessages = messages.filter(m => {
    const matchFolder = m.folder === tab;
    const matchSearch = !search ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.senderName.toLowerCase().includes(search.toLowerCase()) ||
      m.body.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead && m.folder === 'inbox').length;

  function handleSelectMessage(msg: Message) {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  }

  function toggleStar(msgId: string) {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, starred: !m.starred } : m));
    if (selectedMessage?.id === msgId) {
      setSelectedMessage(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  }

  function handleSendReply() {
    if (!replyText.trim() || !selectedMessage) return;
    const newMsg: Message = {
      id: String(Date.now()),
      senderName: 'Admin',
      senderEmail: 'admin@reysmart.com',
      toName: selectedMessage.folder === 'inbox' ? selectedMessage.senderName : selectedMessage.toName,
      toEmail: selectedMessage.folder === 'inbox' ? selectedMessage.senderEmail : selectedMessage.toEmail,
      subject: `Re: ${selectedMessage.subject}`,
      body: replyText,
      isRead: true,
      folder: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setReplyText('');
  }

  function handleComposeSend() {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) return;
    const newMsg: Message = {
      id: String(Date.now()),
      senderName: 'Admin',
      senderEmail: 'admin@reysmart.com',
      toName: composeForm.to,
      toEmail: composeForm.to.toLowerCase().replace(/\s/g, '.') + '@email.com',
      subject: composeForm.subject,
      body: composeForm.body,
      isRead: true,
      folder: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setShowCompose(false);
    setComposeForm({ to: '', subject: '', body: '' });
  }

  function handleDelete(msgId: string) {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (selectedMessage?.id === msgId) {
      setSelectedMessage(null);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.messages.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} ${t.messages.unread}` : 'All caught up'}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCompose(true)}>
          <Plus className="w-4 h-4 mr-2" /> {t.messages.compose}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-3 gap-4 min-h-[560px]">
        {/* Left Panel - Message List */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Inbox / Sent Tabs */}
            <div className="flex border-b border-gray-100 px-2 pt-2">
              <button
                onClick={() => setTab('inbox')}
                className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors ${
                  tab === 'inbox' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Inbox className="w-4 h-4 inline mr-1.5" />
                {t.messages.inbox}
                {unreadCount > 0 && (
                  <Badge className="ml-1.5 bg-teal-600 text-white text-[10px] px-1.5 py-0 h-4 min-w-[16px]">
                    {unreadCount}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setTab('sent')}
                className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors ${
                  tab === 'sent' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Send className="w-4 h-4 inline mr-1.5" />
                {t.messages.sent}
              </button>
            </div>

            {/* Message List */}
            <ScrollArea className="flex-1 max-h-[480px]">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Mail className="w-12 h-12 mb-3" />
                  <p className="text-sm">{t.messages.noMessages}</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                      selectedMessage?.id === msg.id ? 'bg-teal-50/70 border-l-2 border-l-teal-500' : ''
                    } ${!msg.isRead ? 'bg-teal-50/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {msg.folder === 'inbox' ? msg.senderName : `To: ${msg.toName}`}
                          </p>
                          {msg.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        </div>
                        <p className={`text-sm truncate mt-0.5 ${!msg.isRead ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.body.split('\n')[0]}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[11px] text-gray-400">{formatMessageTime(msg.createdAt)}</span>
                        {!msg.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Panel - Message Detail */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-6 h-full">
            {selectedMessage ? (
              <div className="flex flex-col h-full">
                {/* Message Header */}
                <div className="mb-4">
                  <div className="flex items-start gap-2 mb-3">
                    <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-1 text-gray-500 hover:text-gray-700 mt-0.5">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{selectedMessage.subject}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleStar(selectedMessage.id)} className="p-1.5 rounded hover:bg-gray-100">
                        <Star className={`w-4 h-4 ${selectedMessage.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                      <button onClick={() => handleDelete(selectedMessage.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">
                      {selectedMessage.folder === 'inbox'
                        ? `From: ${selectedMessage.senderName}`
                        : `To: ${selectedMessage.toName}`}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{selectedMessage.folder === 'inbox' ? selectedMessage.senderEmail : selectedMessage.toEmail}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatFullDate(selectedMessage.createdAt)}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="border-t border-gray-100 pt-4 flex-1">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedMessage.body}
                  </div>
                </div>

                {/* Reply */}
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Reply className="w-4 h-4" />
                    <span className="font-medium">Reply</span>
                  </div>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" /> {t.messages.send}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Mail className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-gray-500 font-medium">Select a message</p>
                <p className="text-sm text-gray-400 mt-1">Choose a message from the list to view its content</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.messages.compose}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t.messages.to}</Label>
              <Select value={composeForm.to} onValueChange={(v) => setComposeForm(p => ({ ...p, to: v }))}>
                <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
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
              <Label>{t.messages.subject}</Label>
              <Input
                value={composeForm.subject}
                onChange={(e) => setComposeForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="Message subject..."
              />
            </div>
            <div className="space-y-2">
              <Label>{t.messages.message}</Label>
              <Textarea
                rows={6}
                value={composeForm.body}
                onChange={(e) => setComposeForm(p => ({ ...p, body: e.target.value }))}
                placeholder="Write your message..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCompose(false)}>{t.common.cancel}</Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleComposeSend}
              disabled={!composeForm.to || !composeForm.subject || !composeForm.body}
            >
              <Send className="w-4 h-4 mr-2" /> {t.messages.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
