import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { NotificationPanel } from './NotificationPanel';
import { ProfileDropdown } from './ProfileDropdown';
import { SearchBar } from './SearchBar';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed(!collapsed);

  const menuItems = [
    { name: 'Dashboard', to: '/' },
    { name: 'Assets', to: '/assets' },
    { name: 'Reports', to: '/reports' },
  ];

  return (
    <aside className={`bg-surface-light dark:bg-surface-dark h-screen border-r border-border-light dark:border-border-dark transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} hidden lg:block`}>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold text-primary-600">AssetFlow</h2>
        <button onClick={toggle} className="p-1 hover:bg-muted-light dark:hover:bg-muted-dark rounded-md">
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      <nav className="mt-4">
        {menuItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 hover:bg-muted-light dark:hover:bg-muted-dark transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900' : ''}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
