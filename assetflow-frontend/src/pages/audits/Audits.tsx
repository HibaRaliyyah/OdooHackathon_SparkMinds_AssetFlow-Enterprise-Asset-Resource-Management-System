import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText } from 'lucide-react';
import { CardSkeleton } from '../../components/common/Skeleton';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { departmentService, auditService } from '../../services';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AuditDetailsModal from './AuditDetailsModal';

interface Audit {
  _id: string;
  auditId: string;
  title: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  auditor: { firstName: string; lastName: string };
  department?: { name: string };
}

const Audits: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [form, setForm] = useState({ title: '', department: '', scheduledDate: '' });

  const { data: res, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => auditService.getAll(),
  });

  const { data: deptRes } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const audits = (res?.data?.data as Audit[]) || [];
  const departments = (deptRes?.data?.data as { _id: string; name: string }[]) || [];

  const startMutation = useMutation({
    mutationFn: auditService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit scheduled successfully');
      setShowForm(false);
      setForm({ title: '', department: '', scheduledDate: '' });
    },
    onError: (err: any) => {
      console.error('Audit schedule error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to schedule audit');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Audits</h1>
          <p className="text-slate-500 text-sm mt-1">Manage system-wide asset audits and inspections.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> Schedule Audit
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audits..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">No audits scheduled</h3>
            <p className="text-sm text-slate-500 mb-4">Start by scheduling your first asset audit.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
              <Plus size={16} /> Schedule Audit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Audit ID</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Scheduled Date</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Auditor</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 text-sm font-medium text-primary-600 dark:text-primary-400">{audit.auditId}</td>
                    <td className="py-4 text-sm text-slate-800 dark:text-slate-200">{audit.title}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${
                        audit.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        audit.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {audit.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(audit.scheduledDate)}</td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{audit.auditor?.firstName} {audit.auditor?.lastName}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => setSelectedAudit(audit)} className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                        View Details
                      </button>
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
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Schedule Audit</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Audit Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-primary-400 text-slate-800 dark:text-slate-200"
                  placeholder="e.g., Annual IT Equipment Audit" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Department (Optional)</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-primary-400 text-slate-800 dark:text-slate-200">
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Scheduled Date</label>
                <input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-primary-400 text-slate-800 dark:text-slate-200" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={() => startMutation.mutate({ ...form, department: form.department || undefined })} disabled={startMutation.isPending || !form.title}
                className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-70">
                {startMutation.isPending ? 'Scheduling...' : 'Schedule Audit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedAudit && (
        <AuditDetailsModal audit={selectedAudit as any} onClose={() => setSelectedAudit(null)} />
      )}
    </div>
  );
};

export default Audits;
