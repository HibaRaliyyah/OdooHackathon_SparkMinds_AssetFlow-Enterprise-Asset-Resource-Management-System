import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickLogin = (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@assetflow.com', password: 'Admin@123' },
      manager: { email: 'manager@assetflow.com', password: 'Manager@123' },
      head: { email: 'head@assetflow.com', password: 'Head@123' },
      employee: { email: 'employee@assetflow.com', password: 'Employee@123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login({ email, password });
    if (success) navigate('/dashboard');
    else setError('Invalid email or password. Try a demo account below.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background dark:bg-slate-950">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-12 relative overflow-hidden">
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]`} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AssetFlow</h1>
              <p className="text-white/60 text-sm">Enterprise ERP</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered Asset<br />Management System
          </h2>
          <p className="text-white/70 text-lg">
            Track every asset, prevent loss, optimize utilization — all in one intelligent platform.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: 'Assets Tracked', value: '10,000+' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Time Saved', value: '70%' },
            { label: 'Organizations', value: '500+' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AssetFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                {/* <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">Forgot password?</Link> */}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 disabled:opacity-70"
            >
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-xs text-slate-400 text-center mb-3">Demo Accounts (click to fill)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'admin', label: 'Admin', color: 'bg-primary-50 text-primary-700 border-primary-200' },
                { role: 'manager', label: 'Asset Manager', color: 'bg-violet-50 text-violet-700 border-violet-200' },
                { role: 'head', label: 'Dept. Head', color: 'bg-green-50 text-green-700 border-green-200' },
                { role: 'employee', label: 'Employee', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              ].map(d => (
                <button key={d.role} onClick={() => quickLogin(d.role)}
                  className={`text-xs py-2 px-3 rounded-lg border font-medium hover:opacity-80 transition-opacity ${d.color}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700">Create one</Link>
          </p> */}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
