import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { bookingService, assetService } from '../../services';
import { Booking, Asset } from '../../types';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime, getStatusColor } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BookingList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ asset: '', startTime: '', endTime: '', purpose: '' });

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager' || user?.role === 'department_head';

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', { page, status: statusFilter }],
    queryFn: () => bookingService.getAll({ page, limit: 10, ...(statusFilter && { status: statusFilter }) }),
  });

  const { data: assetsData } = useQuery({
    queryKey: ['assets-bookable'],
    queryFn: () => assetService.getAll({ status: 'available', limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => bookingService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Booking created'); setShowForm(false); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Booking conflict detected'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => bookingService.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Booking approved'); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => bookingService.reject(id, 'Rejected'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Booking rejected'); },
  });

  const bookings: Booking[] = (data as { data: { data: Booking[] } })?.data?.data || [];
  const pagination = (data as { data: { pagination: { pages: number } } })?.data?.pagination;
  const availableAssets: Asset[] = (assetsData as { data: { data: Asset[] } })?.data?.data || [];

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Resource Bookings</h1>
          <p className="text-slate-500 text-sm">Manage resource reservations</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600">
          <Plus size={16} /> Book Resource
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
          {['', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
            <option key={s} value={s}>{s ? s : 'All Status'}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="p-5"><TableSkeleton rows={5} cols={5} /></div>
          : bookings.length === 0 ? <EmptyState icon={Calendar} title="No bookings found" description="Book a resource to get started." />
          : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                  {['ID', 'Resource', 'Booked By', 'Start Time', 'End Time', 'Purpose', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.bookingId}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">{b.asset?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{b.bookedBy?.firstName} {b.bookedBy?.lastName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(b.endTime)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{b.purpose || '—'}</td>
                    <td className="px-4 py-3"><span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span></td>
                    <td className="px-4 py-3">
                      {canManage && b.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => approveMutation.mutate(b._id)} title="Approve"
                            className="p-1.5 rounded-md hover:bg-green-50 text-slate-400 hover:text-green-600">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => rejectMutation.mutate(b._id)} title="Reject"
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600">
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Book a Resource</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Asset/Resource *</label>
                <select value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} className={inputCls}>
                  <option value="">Select resource...</option>
                  {availableAssets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetId})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Time *</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Time *</label>
                <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Purpose</label>
                <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Team meeting..." className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.asset || !form.startTime || !form.endTime}
                className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-70">
                {createMutation.isPending ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
