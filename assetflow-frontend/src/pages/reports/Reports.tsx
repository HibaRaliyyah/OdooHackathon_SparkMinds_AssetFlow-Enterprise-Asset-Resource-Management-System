import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, Package, Wrench, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { assetService } from '../../services';

const COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

const Reports: React.FC = () => {
  const { data: dashData } = useQuery({ queryKey: ['dashboard'], queryFn: assetService.getDashboardStats });

  const stats = (dashData as { data: { data: { stats: { total: number; available: number; allocated: number; underMaintenance: number; disposed: number } } } })?.data?.data?.stats;
  const categoryDist = (dashData as { data: { data: { categoryDistribution: { name: string; count: number }[] } } })?.data?.data?.categoryDistribution || [];
  const deptUsage = (dashData as { data: { data: { departmentUsage: { name: string; count: number }[] } } })?.data?.data?.departmentUsage || [];

  const statusData = stats ? [
    { name: 'Available', value: stats.available, color: '#10B981' },
    { name: 'Allocated', value: stats.allocated, color: '#4F46E5' },
    { name: 'Maintenance', value: stats.underMaintenance, color: '#F59E0B' },
    { name: 'Disposed', value: stats.disposed, color: '#EF4444' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-primary-500" size={22} /> Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm">Asset overview and utilization metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusData.map((item, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-xs text-slate-500 font-medium">{item.name}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stats ? ((item.value / stats.total) * 100).toFixed(1) : 0}% of total</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset status pie */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((item, i) => <Cell key={i} fill={item.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department usage */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Department Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Assets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryDist} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Count">
                {categoryDist.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Placeholder for time series */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Asset Growth (Monthly)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { month: 'Jan', assets: 45 }, { month: 'Feb', assets: 52 }, { month: 'Mar', assets: 61 },
              { month: 'Apr', assets: 70 }, { month: 'May', assets: 78 }, { month: 'Jun', assets: 85 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="assets" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
