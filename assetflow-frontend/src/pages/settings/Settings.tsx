import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Sun, Moon, User, Lock, Bell } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Security State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications State
  const [preferences, setPreferences] = useState({
    email: user?.preferences?.email ?? true,
    maintenance: user?.preferences?.maintenance ?? true,
    booking: user?.preferences?.booking ?? true,
    transfer: user?.preferences?.transfer ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Lock size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Sun size={16} /> },
  ];

  const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400';

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.put('/users/profile', profileData);
      updateUser(data.data);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setIsLoading(true);
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = async (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    try {
      const { data } = await api.put('/users/preferences', { preferences: newPrefs });
      updateUser(data.data);
      toast.success('Preferences saved');
    } catch (err: any) {
      toast.error('Failed to save preferences');
      // Revert on failure
      setPreferences(preferences);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="text-primary-500" size={22} /> Settings
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-44 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">First Name</label>
                  <input 
                    value={profileData.firstName} 
                    onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Last Name</label>
                  <input 
                    value={profileData.lastName} 
                    onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                    className={inputCls} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Email (Cannot be changed)</label>
                  <input value={user?.email || ''} className={inputCls} disabled />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Phone</label>
                  <input 
                    value={profileData.phone} 
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    className={inputCls} 
                  />
                </div>
              </div>
              <button 
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Appearance</h3>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
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
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                  className={inputCls} 
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  className={inputCls} 
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Confirm Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                  className={inputCls} 
                  placeholder="••••••••" 
                />
              </div>
              <button 
                onClick={handlePasswordUpdate}
                disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Notification Preferences</h3>
              <div className="space-y-1">
                {[
                  { label: 'Email notifications', desc: 'Receive updates via email', key: 'email' },
                  { label: 'Maintenance alerts', desc: 'Alerts for overdue maintenance', key: 'maintenance' },
                  { label: 'Booking updates', desc: 'Booking approvals and rejections', key: 'booking' },
                  { label: 'Asset transfers', desc: 'When assets are transferred to you', key: 'transfer' },
                ].map(item => {
                  const isActive = preferences[item.key as keyof typeof preferences];
                  return (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => togglePreference(item.key as keyof typeof preferences)}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isActive ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
