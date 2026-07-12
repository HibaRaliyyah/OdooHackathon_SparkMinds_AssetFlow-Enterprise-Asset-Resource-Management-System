import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Wrench, AlertTriangle, Clock, TrendingUp, Activity, Brain } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { assetService, aiService } from '../../services';
import { DashboardData, AIInsight } from '../../types';
import { timeAgo, formatCurrency, getStatusColor } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: dashData, isLoading } = useQuery<{ data: DashboardData }>({
    queryKey: ['dashboard'],
    queryFn: () => assetService.getDashboardStats(),
    refetchInterval: 60000,
  });

  const { data: insightsData } = useQuery<{ data: { data: AIInsight[] } }>({
    queryKey: ['ai-insights'],
    queryFn: () => aiService.getInsights() as unknown as { data: { data: AIInsight[] } },
  });

  const dashboardPayload = (dashData as any)?.data?.data;
  const stats = dashboardPayload?.stats;
  const categoryDist = dashboardPayload?.categoryDistribution || [];
  const deptUsage = dashboardPayload?.departmentUsage || [];
  const recentActivity = dashboardPayload?.recentActivity || [];
  const insights: AIInsight[] = (insightsData as unknown as { data: { data: AIInsight[] } })?.data?.data || [];

  const CHART_COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Good morning, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening with your assets today.</p>
      </div>

      {/* KPI Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_: any, i: number) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Assets" value={stats?.total || 0} icon={<Package size={20} />} color="primary" index={0} />
          <StatCard title="Available" value={stats?.available || 0} icon={<CheckCircle size={20} />} color="success" index={1} />
          <StatCard title="Allocated" value={stats?.allocated || 0} icon={<TrendingUp size={20} />} color="secondary" index={2} />
          <StatCard title="Maintenance" value={stats?.underMaintenance || 0} icon={<Wrench size={20} />} color="warning" index={3} />
          <StatCard title="Disposed" value={stats?.disposed || 0} icon={<AlertTriangle size={20} />} color="danger" index={4} />
          <StatCard title="Pending" value={stats?.pendingRequests || 0} icon={<Clock size={20} />} color="slate" index={5} />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Asset Distribution Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5 col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Package size={16} className="text-primary-500" /> Asset by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryDist.map((_: any, index: number) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => [val, 'Assets']} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Usage Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 col-span-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary-500" /> Department Asset Usage
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptUsage} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Assets" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row: AI Insights + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Brain size={16} className="text-secondary-500" /> AI Insights
          </h3>
          <div className="space-y-3">
            {insights.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No insights available</p>
            ) : insights.map((insight: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30' :
                insight.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30' :
                'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                  insight.type === 'warning' ? 'bg-amber-500 text-white' :
                  insight.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}>!</div>
                <p className={`text-xs ${
                  insight.type === 'warning' ? 'text-amber-700 dark:text-amber-300' :
                  insight.type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'
                }`}>{insight.message}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary-500" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
            ) : recentActivity.slice(0, 8).map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {log.performedBy?.firstName?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{log.description}</p>
                  <p className="text-[10px] text-slate-400">{timeAgo(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
