import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Wrench, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { maintenanceService, assetService } from '../../services';
import { Maintenance, Asset } from '../../types';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getStatusColor, timeAgo } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MaintenanceList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ asset: '', type: 'corrective', priority: 'medium', description: '' });

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager';

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', { page, status: statusFilter }],
    queryFn: () => maintenanceService.getAll({ page, limit: 10, ...(statusFilter && { status: statusFilter }) }),
  });

  const { data: assetsData } = useQuery({ queryKey: ['assets-all'], queryFn: () => assetService.getAll({ limit: 100 }) });

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      return maintenanceService.create(fd);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); toast.success('Maintenance request raised'); setShowForm(false); },
    onError: () => toast.error('Failed to create request'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); toast.success('Approved'); },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.updateStatus(id, { status: 'completed' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); toast.success('Marked as completed'); },
  });

  const items: Maintenance[] = (data as { data: { data: Maintenance[] } })?.data?.data || [];
  const pagination = (data as { data: { pagination: { pages: number } } })?.data?.pagination;
  const assets: Asset[] = (assetsData as { data: { data: Asset[] } })?.data?.data || [];

  const priorityColor: Record<string, string> = {
    low: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50', critical: 'text-red-600 bg-red-50',
  };

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Maintenance</h1>
          <p className="text-slate-500 text-sm">Track and manage maintenance requests</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg">
          <Plus size={16} /> Raise Request
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          {['', 'pending', 'approved', 'in_progress', 'completed', 'rejected'].map(s => (
            <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All Status'}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="p-5"><TableSkeleton rows={5} cols={6} /></div>
          : items.length === 0 ? <EmptyState icon={Wrench} title="No maintenance requests" description="Raise a request for any damaged or faulty asset." />
          : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                  {['ID', 'Asset', 'Type', 'Priority', 'Status', 'Reported By', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.maintenanceId}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">{item.asset?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{item.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[item.priority]}`}>{item.priority}</span>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${getStatusColor(item.status)}`}>{item.status.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.reportedBy?.firstName} {item.reportedBy?.lastName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {canManage && item.status === 'pending' && (
                          <button onClick={() => approveMutation.mutate(item._id)} title="Approve"
                            className="p-1.5 rounded-md hover:bg-green-50 text-slate-400 hover:text-green-600">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {canManage && item.status === 'in_progress' && (
                          <button onClick={() => completeMutation.mutate(item._id)} title="Mark Complete"
                            className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600">
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
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
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Raise Maintenance Request</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Asset *</label>
                <select value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} className={inputCls}>
                  <option value="">Select asset...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                    {['corrective', 'preventive', 'inspection'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inputCls}>
                    {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe the issue..." className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.asset || !form.description}
                className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-70">
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
