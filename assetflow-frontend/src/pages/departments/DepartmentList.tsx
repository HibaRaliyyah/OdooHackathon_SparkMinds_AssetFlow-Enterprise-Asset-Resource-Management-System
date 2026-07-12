import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Building2, Users, Edit, Trash2 } from 'lucide-react';
import { departmentService } from '../../services';
import { Department } from '../../types';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DepartmentList: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', location: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const departments: Department[] = (data as { data: { data: Department[] } })?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: () => editing
      ? departmentService.update(editing._id, form)
      : departmentService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(editing ? 'Department updated' : 'Department created');
      setShowForm(false); setEditing(null);
      setForm({ name: '', code: '', description: '', location: '' });
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: departmentService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department deactivated'); },
  });

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description || '', location: dept.location || '' });
    setShowForm(true);
  };

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Departments</h1>
          <p className="text-slate-500 text-sm">{departments.length} departments</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setForm({ name: '', code: '', description: '', location: '' }); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600">
            <Plus size={16} /> Add Department
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card p-5 h-32 skeleton" />)
        ) : departments.length === 0 ? (
          <div className="col-span-3">
            <EmptyState icon={Building2} title="No departments" description="Create your first department." />
          </div>
        ) : departments.map((dept) => (
          <motion.div key={dept._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{dept.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{dept.code}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600"><Edit size={14} /></button>
                  <button onClick={() => deleteMutation.mutate(dept._id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            {dept.description && <p className="text-xs text-slate-500 mb-3">{dept.description}</p>}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users size={12} /> <span>{dept.employeeCount || 0} employees</span>
            </div>
            {dept.location && <p className="text-xs text-slate-400 mt-1">📍 {dept.location}</p>}
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{editing ? 'Edit' : 'Create'} Department</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Information Technology" /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={inputCls} placeholder="IT" /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputCls} placeholder="Floor 3" /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.name || !form.code}
                className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-70">
                {createMutation.isPending ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
