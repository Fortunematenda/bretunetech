'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Phone, Building2, Tag, Clock, DollarSign, MessageSquare, ChevronDown, RefreshCw, CheckCheck, Eye, XCircle, Reply, Send, X, Loader2 } from 'lucide-react';
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const STATUS_STYLES: Record<string, string> = {
  NEW:     'bg-blue-50 text-blue-600 border-blue-200',
  READ:    'bg-gray-100 text-gray-500 border-gray-300/30',
  REPLIED: 'bg-green-500/20 text-green-600 border-green-200',
  CLOSED:  'bg-red-50 text-red-600 border-red-200',
};

const STATUS_ICONS: Record<string, any> = {
  NEW: Eye,
  READ: CheckCheck,
  REPLIED: Reply,
  CLOSED: XCircle,
};

export default function EnquiriesPage() {
  const { token } = useAuthStore();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [replyModal, setReplyModal] = useState<{ id: string; name: string; email: string } | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const fetch = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (filter) params.status = filter;
      const data = await adminApi.getEnquiries(token, params);
      setEnquiries(data.enquiries || []);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateEnquiry(token, id, { status, notes: notes[id] });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } finally {
      setUpdatingId(null);
    }
  };

  const openReply = (enq: any) => {
    setReplyModal({ id: enq.id, name: enq.name, email: enq.email });
    setReplySubject(`Re: Your enquiry${enq.service ? ' about ' + enq.service : ''} — Bretunetech`);
    setReplyMessage('');
    setReplySuccess(false);
  };

  const sendReply = async () => {
    if (!token || !replyModal || !replySubject.trim() || !replyMessage.trim()) return;
    setReplySending(true);
    try {
      const result = await adminApi.replyEnquiry(token, replyModal.id, { subject: replySubject, message: replyMessage });
      setEnquiries((prev) => prev.map((e) => (e.id === replyModal.id ? result.enquiry : e)));
      setReplySuccess(true);
      setTimeout(() => setReplyModal(null), 1500);
    } catch {
      alert('Failed to send reply. Check backend logs.');
    } finally {
      setReplySending(false);
    }
  };

  const saveNotes = async (id: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateEnquiry(token, id, { notes: notes[id] });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } finally {
      setUpdatingId(null);
    }
  };

  const newCount = enquiries.filter((e) => e.status === 'NEW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            Enquiries & Quote Requests
            {newCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white">{newCount} new</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Customer contact form submissions and quote requests</p>
        </div>
        <button
          onClick={fetch}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-300 hover:border-gray-300 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'NEW', 'READ', 'REPLIED', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              filter === s
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-gray-300 text-gray-500 hover:text-white hover:border-gray-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100/50 animate-pulse" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No enquiries found</p>
          <p className="text-sm mt-1">Customer submissions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq) => {
            const isOpen = expanded === enq.id;
            const StatusIcon = STATUS_ICONS[enq.status] || Eye;
            return (
              <div
                key={enq.id}
                className={`rounded-xl border bg-white/60 transition-all ${
                  enq.status === 'NEW' ? 'border-blue-500/40' : 'border-gray-200'
                }`}
              >
                {/* Summary row */}
                <button
                  onClick={() => {
                    setExpanded(isOpen ? null : enq.id);
                    if (!isOpen && enq.status === 'NEW') updateStatus(enq.id, 'READ');
                    if (!notes[enq.id]) setNotes((n) => ({ ...n, [enq.id]: enq.notes || '' }));
                  }}
                  className="w-full flex items-start gap-4 p-4 text-left"
                >
                  {/* Status dot */}
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${enq.status === 'NEW' ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-900 font-semibold text-sm">{enq.name}</span>
                      {enq.service && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                          {enq.service}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_STYLES[enq.status]}`}>
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{enq.email} {enq.phone && `· ${enq.phone}`}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{enq.message}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-gray-500 text-xs">{timeAgo(enq.createdAt)}</p>
                    <ChevronDown className={`w-4 h-4 text-gray-600 mt-1 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    {/* Contact info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        <a href={`mailto:${enq.email}`} className="hover:text-gray-900 truncate">{enq.email}</a>
                      </div>
                      {enq.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <a href={`tel:${enq.phone}`} className="hover:text-gray-900">{enq.phone}</a>
                        </div>
                      )}
                      {enq.company && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Building2 className="w-3.5 h-3.5 text-gray-500" />
                          <span>{enq.company}</span>
                        </div>
                      )}
                      {enq.budget && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                          <span>{enq.budget}</span>
                        </div>
                      )}
                      {enq.urgency && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>{enq.urgency}</span>
                        </div>
                      )}
                      {enq.service && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Tag className="w-3.5 h-3.5 text-gray-500" />
                          <span>{enq.service}</span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="bg-gray-100/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{enq.message}</p>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Notes</p>
                      <textarea
                        rows={2}
                        value={notes[enq.id] ?? enq.notes ?? ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [enq.id]: e.target.value }))}
                        placeholder="Add internal notes..."
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['NEW', 'READ', 'REPLIED', 'CLOSED'] as const).map((s) => {
                        const Icon = STATUS_ICONS[s];
                        return (
                          <button
                            key={s}
                            onClick={() => updateStatus(enq.id, s)}
                            disabled={updatingId === enq.id || enq.status === s}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-40 ${
                              enq.status === s
                                ? STATUS_STYLES[s] + ' cursor-default'
                                : 'border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            Mark {s}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => saveNotes(enq.id)}
                        disabled={updatingId === enq.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 ml-auto"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => openReply(enq)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                        Reply via Email
                      </button>
                      {enq.phone && (
                        <a
                          href={`https://wa.me/${enq.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${enq.name}, thank you for your enquiry about ${enq.service || 'our services'}. `)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-gray-900 transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-gray-300 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-gray-900 font-semibold">Reply to {replyModal.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{replyModal.email}</p>
              </div>
              <button onClick={() => setReplyModal(null)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {replySuccess ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCheck className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-900 font-semibold">Reply sent!</p>
                <p className="text-gray-500 text-sm mt-1">Enquiry marked as Replied.</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Subject</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea
                    rows={8}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Hi ${replyModal.name},\n\nThank you for your enquiry...`}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button onClick={() => setReplyModal(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-300 hover:border-gray-300 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replySubject.trim() || !replyMessage.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-40"
                  >
                    {replySending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {replySending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
