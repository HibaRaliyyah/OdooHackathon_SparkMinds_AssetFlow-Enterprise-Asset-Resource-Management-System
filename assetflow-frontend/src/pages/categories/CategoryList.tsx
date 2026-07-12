import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Tags, Edit, Trash2 } from 'lucide-react';
import { categoryService } from '../../services';
import { AssetCategory } from '../../types';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CategoryList: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AssetCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', icon: '', color: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const categories: AssetCategory[] = (data as { data: { data: AssetCategory[] } })?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: () => editing
      ? categoryService.update(editing._id, form)
      : categoryService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editing ? 'Category updated' : 'Category created');
      setShowForm(false); setEditing(null);
      setForm({ name: '', code: '', description: '', icon: '', color: '' });
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['categories'] }); 
      toast.success('Category deactivated'); 
      setDeleteId(null);
    },
  });

  const openEdit = (cat: AssetCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, code: cat.code, description: cat.description || '', icon: cat.icon || '', color: cat.color || '' });
    setShowForm(true);
  };

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Categories</h1>
          <p className="text-slate-500 text-sm">{categories.length} categories</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setForm({ name: '', code: '', description: '', icon: '', color: '' }); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600">
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card p-5 h-32 skeleton" />)
        ) : categories.length === 0 ? (
          <div className="col-span-3">
            <EmptyState icon={Tags} title="No categories" description="Create your first asset category." />
          </div>
        ) : categories.map((cat) => (
          <motion.div key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color ? `${cat.color}20` : 'rgba(59, 130, 246, 0.1)' }}>
                  <Tags size={18} style={{ color: cat.color || '#3b82f6' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{cat.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{cat.code}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600"><Edit size={14} /></button>
                  <button onClick={() => setDeleteId(cat._id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            {cat.description && <p className="text-xs text-slate-500 mb-3">{cat.description}</p>}
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{editing ? 'Edit' : 'Create'} Category</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Electronics" /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={inputCls} placeholder="ELC" /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Color Code</label>
                <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className={inputCls} placeholder="#3b82f6" /></div>
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

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-500 mb-4">This action cannot be undone. Are you sure you want to deactivate this category?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-70">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
