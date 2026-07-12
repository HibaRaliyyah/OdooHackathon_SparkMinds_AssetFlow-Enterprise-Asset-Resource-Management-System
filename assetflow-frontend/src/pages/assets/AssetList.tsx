import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Package, Eye, Edit, Trash2, QrCode, CheckCircle, Wrench, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { assetService, categoryService, departmentService } from '../../services';
import { Asset } from '../../types';
import { formatDate, formatCurrency, getStatusColor, getConditionColor, truncate } from '../../lib/utils';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AssetList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['assets', { page, search, status: statusFilter, category: categoryFilter }],
    queryFn: () => assetService.getAll({ page, limit: 10, ...(search && { search }), ...(statusFilter && { status: statusFilter }), ...(categoryFilter && { category: categoryFilter }) }),
  });

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete asset'),
  });

  const assets: Asset[] = (data as { data: { data: Asset[] } })?.data?.data || [];
  const pagination = (data as { data: { pagination: { pages: number; total: number } } })?.data?.pagination;

  const statusOptions = ['', 'available', 'allocated', 'under_maintenance', 'disposed', 'lost'];

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Assets</h1>
          <p className="text-slate-500 text-sm">{pagination?.total || 0} total assets</p>
        </div>
        {canManage && (
          <button onClick={() => navigate('/assets/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all">
            <Plus size={16} /> Register Asset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
          {statusOptions.map(s => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All Status'}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
          <option value="">All Categories</option>
          {(cats as { data: { data: { _id: string; name: string }[] } })?.data?.data?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-5"><TableSkeleton rows={5} cols={6} /></div>
        ) : assets.length === 0 ? (
          <EmptyState icon={Package} title="No assets found" description="Register your first asset to get started." action={
            canManage ? <button onClick={() => navigate('/assets/new')}
              className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg font-medium">Register Asset</button> : undefined
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                  {['Asset ID', 'Name', 'Category', 'Status', 'Condition', 'Department', 'Warranty', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {assets.map((asset) => (
                  <motion.tr key={asset._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{asset.assetId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{truncate(asset.name, 30)}</p>
                        {asset.brand && <p className="text-xs text-slate-400">{asset.brand} {asset.model}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 dark:text-slate-300">{asset.category?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusColor(asset.status)}`}>{asset.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConditionColor(asset.condition)}`}>{asset.condition}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{asset.department?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {asset.warrantyExpiry ? (
                        <span className={`text-xs ${new Date(asset.warrantyExpiry) < new Date() ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          {formatDate(asset.warrantyExpiry)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/assets/${asset._id}`)} title="View"
                          className="p-1.5 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 transition-colors">
                          <Eye size={14} />
                        </button>
                        {canManage && (
                          <>
                            <button onClick={() => navigate(`/assets/${asset._id}/edit`)} title="Edit"
                              className="p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 transition-colors">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => navigate(`/assets/${asset._id}/qr`)} title="QR Code"
                              className="p-1.5 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-600 transition-colors">
                              <QrCode size={14} />
                            </button>
                            {user?.role === 'admin' && (
                              <button onClick={() => setDeleteId(asset._id)} title="Delete"
                                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700/30">
            <p className="text-xs text-slate-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="px-3 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Delete Asset?</h3>
            <p className="text-sm text-slate-500 mb-4">This action cannot be undone.</p>
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

export default AssetList;
