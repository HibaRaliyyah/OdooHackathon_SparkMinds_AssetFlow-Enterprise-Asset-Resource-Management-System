import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Sun, Moon, User, Lock, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Lock size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Sun size={16} /> },
  ];

  const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400';

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="text-primary-500" size={22} /> Settings
        </h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.employeeId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">First Name</label>
                  <input defaultValue={user?.firstName} className={inputCls} /></div>
                <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Last Name</label>
                  <input defaultValue={user?.lastName} className={inputCls} /></div>
                <div className="col-span-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Email</label>
                  <input defaultValue={user?.email} className={inputCls} disabled /></div>
                <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Phone</label>
                  <input defaultValue={user?.phone || ''} className={inputCls} /></div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg">Save Changes</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Appearance</h3>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon size={18} className="text-primary-500" /> : <Sun size={18} className="text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                    <p className="text-xs text-slate-500">Toggle between light and dark theme</p>
                  </div>
                </div>
                <button onClick={toggleTheme} className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-primary-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Security</h3>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Current Password</label>
                <input type="password" className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">New Password</label>
                <input type="password" className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Confirm Password</label>
                <input type="password" className={inputCls} placeholder="••••••••" />
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg">Update Password</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Notification Preferences</h3>
              {[
                { label: 'Email notifications', desc: 'Receive updates via email', key: 'email' },
                { label: 'Maintenance alerts', desc: 'Alerts for overdue maintenance', key: 'maintenance' },
                { label: 'Booking updates', desc: 'Booking approvals and rejections', key: 'booking' },
                { label: 'Asset transfers', desc: 'When assets are transferred to you', key: 'transfer' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <button className="relative w-11 h-6 rounded-full bg-primary-500">
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
