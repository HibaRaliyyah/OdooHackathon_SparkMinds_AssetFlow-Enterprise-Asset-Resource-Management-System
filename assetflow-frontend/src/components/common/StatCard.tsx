import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'slate';
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  index?: number;
}

const colorMap = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', icon: 'text-primary-600 dark:text-primary-400', border: 'border-primary-100 dark:border-primary-800/30' },
  secondary: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800/30' },
  success: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-800/30' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800/30' },
  danger: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800/30' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-800/50', icon: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-700' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, changeType, index = 0 }) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn('glass-card p-5 hover:shadow-card-hover transition-all duration-200 border', colors.border)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1 font-medium', changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-500' : 'text-slate-400')}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colors.bg, colors.icon)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
