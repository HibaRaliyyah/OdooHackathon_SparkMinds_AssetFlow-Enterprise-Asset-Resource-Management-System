import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services';
import { Notification } from '../../types';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../lib/utils';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationService.getAll({ limit: 50 }),
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });

  const responseData = (data as any)?.data?.data;
  const notifications: Notification[] = responseData?.notifications || [];
  const unread = responseData?.unreadCount || 0;

  const typeColor: Record<string, string> = {
    info: 'bg-blue-500', success: 'bg-green-500', warning: 'bg-amber-500', error: 'bg-red-500',
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Notifications</h1>
          <p className="text-slate-500 text-sm">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAll.mutate()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="glass-card divide-y divide-slate-100 dark:divide-slate-700/30">
        {isLoading ? <div className="p-5"><TableSkeleton rows={5} cols={3} /></div>
          : notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
          : notifications.map((n) => (
          <div key={n._id} onClick={() => !n.isRead && markRead.mutate(n._id)}
            className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeColor[n.type] || 'bg-slate-400'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${!n.isRead ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
              <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
