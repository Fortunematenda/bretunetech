'use client';

import { useState } from 'react';
import { Search, Plus, Calendar, Clock, MapPin, MoreHorizontal, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  technician?: string;
}

const sampleBookings: Booking[] = [
  { id: 'BK-001', customer: 'Acme Corp', service: 'Wi-Fi Installation', date: '2026-05-28', time: '09:00', location: 'Cape Town CBD', status: 'confirmed', technician: 'John D.' },
  { id: 'BK-002', customer: 'SecureHome', service: 'CCTV Setup', date: '2026-05-29', time: '14:00', location: 'Durban North', status: 'pending' },
  { id: 'BK-003', customer: 'TechStart SA', service: 'MikroTik Configuration', date: '2026-05-27', time: '10:30', location: 'Johannesburg', status: 'completed', technician: 'Sarah M.' },
  { id: 'BK-004', customer: 'NetSolutions', service: 'Fibre Installation', date: '2026-05-30', time: '08:00', location: 'Pretoria', status: 'in-progress', technician: 'Mike R.' },
];

const statusConfig = {
  pending: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Confirmed' },
  'in-progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Cancelled' },
};

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [bookings] = useState<Booking[]>(sampleBookings);

  const filteredBookings = bookings.filter((b) =>
    b.customer.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Bookings</h1>
          <p className="text-sm text-slate-400">Manage installation and support appointments</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-slate-900 rounded-xl font-medium hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Search & Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bookings..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBookings.map((booking) => {
          const StatusIcon = statusConfig[booking.status].icon;
          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{booking.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[booking.status].label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{booking.service}</h3>
                  <p className="text-sm text-slate-400">{booking.customer}</p>
                </div>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {booking.date} at {booking.time}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {booking.location}
                </div>
                {booking.technician && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 font-semibold">
                      {booking.technician.charAt(0)}
                    </div>
                    Assigned to {booking.technician}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                <button className="flex-1 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors">
                  View Details
                </button>
                <button className="flex-1 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  Update Status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-900/50">
          <p className="text-slate-400">No bookings found</p>
        </div>
      )}
    </div>
  );
}
