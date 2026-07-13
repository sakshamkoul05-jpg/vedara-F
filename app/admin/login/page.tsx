'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { User, KeyRound, ArrowRight, Eye, EyeOff, Shield, Coffee, Users, X, Mountain } from 'lucide-react';

const portalTabs = [
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Full CMS & analytics' },
  { id: 'cafe', label: 'Cafe Ops', icon: Coffee, desc: 'Kitchen & menu mgmt' },
  { id: 'staff', label: 'Staff', icon: Users, desc: 'Service & tasks' },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [portal, setPortal] = useState('admin');
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await endpoints.auth.login(email, password);
      setAuth(res.data.user, res.data.accessToken);
      document.cookie = `vd_token=${res.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      if (portal === 'admin') {
        router.push('/admin/dashboard');
      } else if (portal === 'cafe') {
        router.push('/employee/cafe');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-alabaster dark:bg-[#13110E]">
      <div className="hidden lg:flex lg:w-1/2 bg-forest-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 to-forest-600" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=60)', backgroundSize: 'cover' }} />
        <div className="relative z-10 px-16 text-center">
          <Mountain className="w-16 h-16 text-alabaster/30 mx-auto mb-8" />
          <h1 className="font-serif text-4xl text-alabaster mb-4 leading-tight">The Vedara</h1>
          <p className="text-alabaster/60 text-lg font-light">Himalayan Boutique Retreat</p>
          <div className="mt-12 flex items-center justify-center gap-8 text-alabaster/40 text-xs tracking-widest uppercase">
            <span>Ghiyagi, Jibhi</span>
            <span className="w-1 h-1 rounded-full bg-alabaster/30" />
            <span>Himachal Pradesh</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-alabaster" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-foreground">The Vedara</h1>
              <p className="text-xs text-muted-foreground">Operations Portal</p>
            </div>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="font-serif text-2xl text-foreground mb-1">Operations Portal</h2>
            <p className="text-sm text-muted-foreground">Sign in to manage your property</p>
          </div>

          <div className="flex gap-1.5 mb-8 bg-gold-50 dark:bg-[#221E18] rounded-xl p-1">
            {portalTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setPortal(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs transition-all ${
                    portal === t.id
                      ? 'bg-white dark:bg-[#1B1814] text-forest-700 shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground dark:text-[#A89C8B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground dark:text-[#EFE9DE] mb-1.5">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-[#A89C8B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={portal === 'admin' ? 'admin@vedara.com' : portal === 'cafe' ? 'cafe@vedara.com' : 'staff@vedara.com'}
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-lg text-foreground dark:text-[#EFE9DE] placeholder-muted-foreground dark:placeholder-[#A89C8B] dark:bg-[#221E18] dark:border-white/10 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground dark:text-[#EFE9DE]">Password</label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-[#A89C8B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 glass-input rounded-lg text-foreground dark:text-[#EFE9DE] placeholder-muted-foreground dark:placeholder-[#A89C8B] dark:bg-[#221E18] dark:border-white/10 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-[#A89C8B] hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gold-600 hover:bg-gold-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to website
          </button>
        </motion.div>
      </div>
    </div>
  );
}
