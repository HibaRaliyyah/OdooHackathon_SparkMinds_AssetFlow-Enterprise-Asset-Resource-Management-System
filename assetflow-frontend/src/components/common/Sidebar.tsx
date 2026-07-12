import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Users, Building2, Tag, Calendar,
  Wrench, ArrowLeftRight, ClipboardList, BarChart3, Bell, Brain,
  Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/assets', label: 'Assets', icon: <Package size={18} /> },
  { path: '/departments', label: 'Departments', icon: <Building2 size={18} />, roles: ['admin', 'asset_manager'] },
  { path: '/employees', label: 'Employees', icon: <Users size={18} />, roles: ['admin', 'asset_manager', 'department_head'] },
  { path: '/categories', label: 'Categories', icon: <Tag size={18} />, roles: ['admin', 'asset_manager'] },
  { path: '/bookings', label: 'Bookings', icon: <Calendar size={18} /> },
  { path: '/maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
  { path: '/transfers', label: 'Transfers', icon: <ArrowLeftRight size={18} /> },
  { path: '/audits', label: 'Audits', icon: <ClipboardList size={18} />, roles: ['admin', 'asset_manager'] },
  { path: '/reports', label: 'Reports', icon: <BarChart3 size={18} />, roles: ['admin', 'asset_manager', 'department_head'] },
  { path: '/ai', label: 'AI Insights', icon: <Brain size={18} />, roles: ['admin', 'asset_manager'] },
  { path: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuth();

  const visibleItems = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50 z-40 flex flex-col overflow-hidden print:hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700/50 min-h-[65px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <span className="font-bold text-lg gradient-text">AssetFlow</span>
              <p className="text-[10px] text-slate-400 leading-none">Enterprise ERP</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 custom-scrollbar space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700/50">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
