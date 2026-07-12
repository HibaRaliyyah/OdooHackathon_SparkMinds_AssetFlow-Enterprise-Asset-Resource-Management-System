import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User as UserIcon, Mail, Phone, Briefcase, Package } from 'lucide-react';
import api from '../../lib/api';
import { User, Asset } from '../../types';
import { CardSkeleton } from '../../components/common/Skeleton';
import { getStatusColor } from '../../lib/utils';

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userRes, isLoading: userLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/users/${id}`),
    enabled: !!id,
  });

  const { data: assetsRes, isLoading: assetsLoading } = useQuery({
    queryKey: ['employee-assets', id],
    queryFn: () => api.get(`/assets?assignedTo=${id}`),
    enabled: !!id,
  });

  const employee = userRes?.data?.data as User;
  const assets = (assetsRes?.data?.data as Asset[]) || [];

  if (userLoading) {
    return <div className="p-6"><CardSkeleton /></div>;
  }

  if (!employee) {
    return <div className="p-6 text-center text-slate-500">Employee not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Employee Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="glass-card p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{employee.firstName} {employee.lastName}</h2>
            <p className="text-sm text-slate-500 capitalize">{employee.role.replace('_', ' ')}</p>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium border ${employee.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                <Briefcase size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Department</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{employee.department?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{employee.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                <UserIcon size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Employee ID</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{employee.employeeId || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Assets */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package size={18} className="text-primary-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Assigned Assets</h3>
            <span className="ml-auto bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {assets.length}
            </span>
          </div>

          {assetsLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No assets currently assigned to this employee.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map(asset => (
                <div key={asset._id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-primary-300 transition-colors cursor-pointer" onClick={() => navigate(`/assets/${asset._id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-2">{asset.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${getStatusColor(asset.status)}`}>
                      {asset.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{asset.assetId}</p>
                  <div className="flex justify-between items-center text-xs mt-4">
                    <span className="text-slate-600 dark:text-slate-400 capitalize">{asset.category?.name || 'Unknown'}</span>
                    <span className="text-slate-500">{asset.brand} {asset.model}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
