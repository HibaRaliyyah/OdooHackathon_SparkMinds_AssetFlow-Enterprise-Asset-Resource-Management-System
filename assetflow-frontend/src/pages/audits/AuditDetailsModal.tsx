import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { auditService } from '../../services';
import { formatDate } from '../../lib/utils';

interface Discrepancy {
  asset: string;
  issue: string;
}

interface Audit {
  _id: string;
  auditId: string;
  title: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedAt?: string;
  auditor?: { firstName: string; lastName: string };
  department?: { name: string };
  totalAssets: number;
  scannedAssets: number;
  matchedAssets: number;
  discrepancies: Discrepancy[];
}

interface Props {
  audit: Audit;
  onClose: () => void;
}

const AuditDetailsModal: React.FC<Props> = ({ audit, onClose }) => {
  const queryClient = useQueryClient();
  const [scanForm, setScanForm] = useState({ assetId: '', condition: '', location: '' });

  const scanMutation = useMutation({
    mutationFn: (data: typeof scanForm) => auditService.scanAsset(audit._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Asset scanned successfully');
      setScanForm({ assetId: '', condition: '', location: '' });
      onClose(); // In a real app we might keep it open, but closing is simpler for now or we can refresh the local data. Let's not close.
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message || 'Failed to scan asset'),
  });

  const completeMutation = useMutation({
    mutationFn: () => auditService.complete(audit._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit completed successfully');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message || 'Failed to complete audit'),
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanForm.assetId) return toast.error('Asset ID is required');
    scanMutation.mutate(scanForm);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-6 w-full max-w-2xl relative my-8">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            {audit.title}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
              audit.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              audit.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {audit.status.replace('_', ' ').toUpperCase()}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Audit ID: {audit.auditId}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Scheduled Date</p>
            <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{formatDate(audit.scheduledDate)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Total Assets</p>
            <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{audit.totalAssets}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Scanned</p>
            <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{audit.scannedAssets}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Matched</p>
            <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{audit.matchedAssets}</p>
          </div>
        </div>

        {audit.status === 'in_progress' && (
          <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-xl">
            <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-300 mb-3 flex items-center gap-2">
              <ScanIcon /> Scan Asset
            </h3>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Asset ID / Tag *</label>
                <input value={scanForm.assetId} onChange={e => setScanForm({ ...scanForm, assetId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-primary-400"
                  placeholder="e.g., AST-001" required />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Condition</label>
                <input value={scanForm.condition} onChange={e => setScanForm({ ...scanForm, condition: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-primary-400"
                  placeholder="e.g., Good (Optional)" />
              </div>
              <button type="submit" disabled={scanMutation.isPending}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap disabled:opacity-70">
                {scanMutation.isPending ? 'Scanning...' : 'Scan'}
              </button>
            </form>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" /> Discrepancies ({audit.discrepancies?.length || 0})
          </h3>
          {audit.discrepancies?.length === 0 ? (
            <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">No discrepancies found yet.</p>
          ) : (
            <ul className="space-y-2">
              {audit.discrepancies?.map((d, i) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20">
                  {d.asset ? <span className="font-semibold mr-1">Asset Ref:</span> : null}
                  {d.issue}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Close
          </button>
          {audit.status === 'in_progress' && (
            <button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70">
              <CheckCircle size={16} />
              {completeMutation.isPending ? 'Completing...' : 'Complete Audit'}
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
};

const ScanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
    <line x1="7" y1="12" x2="17" y2="12"></line>
  </svg>
);

export default AuditDetailsModal;
