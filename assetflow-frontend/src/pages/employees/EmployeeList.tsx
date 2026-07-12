import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Users, UserX, UserCheck } from 'lucide-react';
import { userService, departmentService } from '../../services';
import { User } from '../../types';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { ROLE_LABELS, getAvatarFallback, formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EmployeeList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search, role: roleFilter }],
    queryFn: () => userService.getAll({ page, limit: 10, ...(search && { search }), ...(roleFilter && { role: roleFilter }) }),
  });

  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: departmentService.getAll });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userService.update(id, { isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Status updated'); },
  });

  const users: User[] = (data as { data: { data: User[] } })?.data?.data || [];
  const pagination = (data as { data: { pagination: { pages: number; total: number } } })?.data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Employees</h1>
          <p className="text-slate-500 text-sm">{pagination?.total || 0} total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search employees..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
          <option value="">All Roles</option>
          {['admin', 'asset_manager', 'department_head', 'employee'].map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="p-5"><TableSkeleton rows={5} cols={5} /></div>
          : users.length === 0 ? <EmptyState icon={Users} title="No employees found" />
          : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                  {['Employee', 'ID', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getAvatarFallback(`${u.firstName} ${u.lastName}`)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100 text-xs">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{u.employeeId}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{ROLE_LABELS[u.role]}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{(u.department as { name?: string })?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'badge-available' : 'badge-disposed'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {currentUser?.role === 'admin' && currentUser._id !== u._id && (
                        <button onClick={() => toggleActive.mutate({ id: u._id, isActive: !u.isActive })}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors">
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700/30">
            <p className="text-xs text-slate-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs rounded-md border border-slate-200 disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="px-3 py-1 text-xs rounded-md border border-slate-200 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
