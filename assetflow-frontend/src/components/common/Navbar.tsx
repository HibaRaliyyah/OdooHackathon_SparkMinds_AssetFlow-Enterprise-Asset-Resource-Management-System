import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLE_LABELS, getAvatarFallback } from '../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications', { isRead: false }],
    queryFn: () => notificationService.getAll({ isRead: false, limit: 1 }),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.data?.data?.unreadCount || 0;

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-glass border-b border-slate-200 dark:border-slate-700/50 z-30 flex items-center px-6 gap-4 transition-all duration-250"
      style={{ left: sidebarCollapsed ? 64 : 240 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets, employees..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-300 dark:focus:border-primary-600 rounded-lg outline-none transition-colors dark:text-slate-200 placeholder:text-slate-400"
            onFocus={() => navigate('/ai?search=true')}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                : getAvatarFallback(user?.fullName || 'U')
              }
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user?.firstName}</p>
              <p className="text-[10px] text-slate-400">{ROLE_LABELS[user?.role || 'employee']}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-card-hover border border-slate-200 dark:border-slate-700 py-1 z-50">
              <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <User size={14} /> Profile
              </button>
              <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Settings size={14} /> Settings
              </button>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
