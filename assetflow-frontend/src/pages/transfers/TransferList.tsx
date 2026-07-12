import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, ArrowLeftRight, CheckCircle, XCircle } from 'lucide-react';
import { transferService, assetService, departmentService } from '../../services';
import { Transfer, Asset } from '../../types';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getStatusColor } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TransferList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset: '', toDepartment: '', reason: '' });

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager';

  const { data, isLoading } = useQuery({ queryKey: ['transfers'], queryFn: () => transferService.getAll() });
  const { data: assetsData } = useQuery({ queryKey: ['assets-all'], queryFn: () => assetService.getAll({ limit: 100 }) });
  const { data: deptsData } = useQuery({ queryKey: ['departments'], queryFn: departmentService.getAll });

  const createMutation = useMutation({
    mutationFn: () => transferService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transfers'] }); toast.success('Transfer requested'); setShowForm(false); },
    onError: () => toast.error('Failed to create transfer'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => transferService.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transfers'] }); toast.success('Transfer approved'); },
  });

  const transfers: Transfer[] = (data as { data: { data: Transfer[] } })?.data?.data || [];
  const assets: Asset[] = (assetsData as { data: { data: Asset[] } })?.data?.data || [];
  const depts = (deptsData as { data: { data: { _id: string; name: string }[] } })?.data?.data || [];

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Asset Transfers</h1>
          <p className="text-slate-500 text-sm">Manage asset transfers between departments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg">
          <Plus size={16} /> Request Transfer
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="p-5"><TableSkeleton rows={5} cols={6} /></div>
          : transfers.length === 0 ? <EmptyState icon={ArrowLeftRight} title="No transfers" description="Request an asset transfer between departments." />
          : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                  {['ID', 'Asset', 'From', 'To', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {transfers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.transferId}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">{t.asset?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.fromDepartment?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.toDepartment?.name || '—'}</td>
                    <td className="px-4 py-3"><span className={`badge ${getStatusColor(t.status)}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      {canManage && t.status === 'pending' && (
                        <button onClick={() => approveMutation.mutate(t._id)} title="Approve"
                          className="p-1.5 rounded-md hover:bg-green-50 text-slate-400 hover:text-green-600">
                          <CheckCircle size={14} />
                        </button>
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
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Request Asset Transfer</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Asset *</label>
                <select value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} className={inputCls}>
                  <option value="">Select asset...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetId})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Transfer To Department *</label>
                <select value={form.toDepartment} onChange={e => setForm(f => ({ ...f, toDepartment: e.target.value }))} className={inputCls}>
                  <option value="">Select department...</option>
                  {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Reason</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3} placeholder="Reason for transfer..." className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.asset || !form.toDepartment}
                className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-70">
                {createMutation.isPending ? 'Submitting...' : 'Request Transfer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TransferList;
