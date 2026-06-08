'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronDown, Mail, Phone, Building2, FileText, Loader2, Send, X } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const SERVICE_LABELS: Record<string, string> = {
  WIFI_INSTALLATION: 'Wi-Fi Installation',
  FIBRE_INSTALLATION: 'Fibre Installation',
  CCTV_SETUP: 'CCTV Setup',
  MIKROTIK_CONFIGURATION: 'MikroTik Configuration',
  REMOTE_SUPPORT: 'Remote Support',
  NETWORK_TROUBLESHOOTING: 'Network Troubleshooting',
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  PENDING:     { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Pending' },
  CONFIRMED:   { icon: CheckCircle, color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   label: 'Confirmed' },
  IN_PROGRESS: { icon: Clock,       color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   label: 'In Progress' },
  COMPLETED:   { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  label: 'Completed' },
  CANCELLED:   { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    label: 'Cancelled' },
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BookingsPage() {
  const { token } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [editTech, setEditTech] = useState<Record<string, string>>({});
  const [editDate, setEditDate] = useState<Record<string, string>>({});
  const [replyModal, setReplyModal] = useState<{ id: string; name: string; email: string; ref: string; service: string; emailSentAt?: string } | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (filter) params.status = filter;
      const data = await bookingsApi.list(token, params);
      setBookings(data.bookings || []);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await bookingsApi.update(token, id, {
        status,
        internalNotes: editNotes[id],
        technicianName: editTech[id],
        scheduledDate: editDate[id] ? new Date(editDate[id]).toISOString() : undefined,
      });
      setBookings((prev) => prev.map((b) => b.id === id ? updated : b));
    } finally {
      setUpdatingId(null);
    }
  };

  const openReply = (b: any) => {
    setReplyModal({ id: b.id, name: b.customerName, email: b.customerEmail, ref: b.bookingNumber, service: b.serviceType, emailSentAt: b.emailSentAt });
    setReplySubject(`Your Booking ${b.bookingNumber} Confirmation — Bretunetech`);
    setReplyMessage('');
    setReplySuccess(false);
  };

  const sendReply = async () => {
    if (!token || !replyModal || !replySubject.trim() || !replyMessage.trim()) return;
    setReplySending(true);
    try {
      const result = await bookingsApi.reply(token, replyModal.id, { subject: replySubject, message: replyMessage });
      setBookings((prev) => prev.map((b) => b.id === replyModal.id ? result.booking : b));
      setReplySuccess(true);
      setTimeout(() => setReplyModal(null), 1500);
    } catch (err: any) {
      alert('Failed to send email: ' + (err?.message || 'Unknown error'));
    } finally {
      setReplySending(false);
    }
  };

  const saveDetails = async (id: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await bookingsApi.update(token, id, {
        internalNotes: editNotes[id],
        technicianName: editTech[id],
        scheduledDate: editDate[id] ? new Date(editDate[id]).toISOString() : undefined,
      });
      setBookings((prev) => prev.map((b) => b.id === id ? updated : b));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return !q || b.customerName?.toLowerCase().includes(q) || b.bookingNumber?.toLowerCase().includes(q) ||
      SERVICE_LABELS[b.serviceType]?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q);
  });

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Service Bookings
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-500 text-slate-900">{pendingCount} pending</span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage installation and support appointments</p>
        </div>
        <button onClick={fetchBookings} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
        </div>
        {['', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === s ? 'bg-cyan-500 border-cyan-500 text-slate-900' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-800/50 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const isOpen = expanded === b.id;
            return (
              <div key={b.id} className={`rounded-xl border bg-slate-900/60 transition-all ${b.status === 'PENDING' ? 'border-yellow-500/40' : 'border-slate-800'}`}>
                {/* Summary row */}
                <button onClick={() => {
                  setExpanded(isOpen ? null : b.id);
                  if (!editNotes[b.id]) setEditNotes((n) => ({ ...n, [b.id]: b.internalNotes || '' }));
                  if (!editTech[b.id]) setEditTech((n) => ({ ...n, [b.id]: b.technicianName || '' }));
                  if (!editDate[b.id] && b.scheduledDate) setEditDate((n) => ({ ...n, [b.id]: b.scheduledDate?.split('T')[0] || '' }));
                }} className="w-full flex items-start gap-4 p-4 text-left">
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${b.status === 'PENDING' ? 'bg-yellow-400 animate-pulse' : 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{b.customerName}</span>
                      <span className="text-slate-500 text-xs font-mono">{b.bookingNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />{cfg.label}
                      </span>
                      {b.serviceType && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{SERVICE_LABELS[b.serviceType] || b.serviceType}</span>}
                      {b.emailSentAt && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20" title={`Email sent ${timeAgo(b.emailSentAt)}${b.emailCount > 1 ? ` (${b.emailCount}x)` : ''}`}>
                          ✉ Emailed{b.emailCount > 1 ? ` ×${b.emailCount}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{b.city}{b.province ? `, ${b.province}` : ''} · {timeAgo(b.createdAt)}</p>
                    {b.description && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{b.description}</p>}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-slate-800 p-4 space-y-4">
                    {/* Contact + Address */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /><a href={`mailto:${b.customerEmail}`} className="hover:text-white truncate">{b.customerEmail}</a></div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /><a href={`tel:${b.customerPhone}`} className="hover:text-white">{b.customerPhone}</a></div>
                      {b.company && <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-500" />{b.company}</div>}
                      <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />{b.address}, {b.city}, {b.province} {b.postalCode}</div>
                      {b.preferredDate && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" />Preferred: {new Date(b.preferredDate).toLocaleDateString()}</div>}
                    </div>

                    {b.description && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer Notes</p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{b.description}</p>
                      </div>
                    )}

                    {/* Admin fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Assigned Technician</label>
                        <input value={editTech[b.id] ?? ''} onChange={(e) => setEditTech((n) => ({ ...n, [b.id]: e.target.value }))}
                          placeholder="Technician name..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Scheduled Date</label>
                        <input type="date" value={editDate[b.id] ?? ''} onChange={(e) => setEditDate((n) => ({ ...n, [b.id]: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Internal Notes</label>
                        <textarea rows={2} value={editNotes[b.id] ?? ''} onChange={(e) => setEditNotes((n) => ({ ...n, [b.id]: e.target.value }))}
                          placeholder="Internal notes..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 resize-none" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {Object.keys(STATUS_CONFIG).map((s) => (
                        <button key={s} onClick={() => updateStatus(b.id, s)} disabled={updatingId === b.id || b.status === s}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-40 ${b.status === s ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} ${STATUS_CONFIG[s].border} cursor-default` : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}>
                          {updatingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                      <button onClick={() => saveDetails(b.id)} disabled={updatingId === b.id}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg transition-colors disabled:opacity-40">
                        <FileText className="w-3 h-3" /> Save Details
                      </button>
                      <button onClick={() => openReply(b)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          b.emailSentAt
                            ? 'bg-slate-700 text-slate-400 hover:bg-green-600 hover:text-white border border-slate-600'
                            : 'bg-green-600 hover:bg-green-500 text-white'
                        }`}>
                        <Mail className="w-3 h-3" />
                        {b.emailSentAt ? `Re-send Email` : 'Email Customer'}
                      </button>
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
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-white font-semibold">Email {replyModal.name}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{replyModal.email} · {replyModal.ref}</p>
                {replyModal.emailSentAt && (
                  <p className="text-yellow-400 text-xs mt-1">⚠ Email already sent {timeAgo(replyModal.emailSentAt)} — this will be a follow-up.</p>
                )}
              </div>
              <button onClick={() => setReplyModal(null)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {replySuccess ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white font-semibold">Email sent!</p>
                <p className="text-slate-400 text-sm mt-1">Booking marked as Confirmed.</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Subject</label>
                  <input type="text" value={replySubject} onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea rows={8} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Hi ${replyModal.name},\n\nThank you for your booking...`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none" />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button onClick={() => setReplyModal(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors">Cancel</button>
                  <button onClick={sendReply} disabled={replySending || !replySubject.trim() || !replyMessage.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-40">
                    {replySending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {replySending ? 'Sending...' : 'Send Email'}
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
