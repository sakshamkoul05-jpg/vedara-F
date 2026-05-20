'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/services/api';
import { FogParticles } from '@/components/animations/FogParticles';
import { User, KeyRound, ArrowRight, Eye, EyeOff, Shield, Coffee, Users } from 'lucide-react';

const portalTabs = [
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Full CMS & analytics' },
  { id: 'cafe', label: 'Café Ops', icon: Coffee, desc: 'Kitchen & menu mgmt' },
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
      const role = res.data.user.role;
      if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
        router.push('/admin/dashboard');
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-earth-900">
      <FogParticles opacity={0.12} count={15} color="200,200,200" speed={0.15} />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80)',
          filter: 'brightness(0.3) saturate(0.8)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-transparent to-earth-900/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-900/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-6">
            <Image
              src="/images/vedlogo.jpeg"
              alt="Vedara"
              width={120}
              height={44}
              className="h-auto w-auto mx-auto mb-4 logo-light"
              priority
            />
            <h1 className="font-serif text-xl text-white/90">Himalayan Sanctuary Ops</h1>
            <p className="text-white/50 text-xs mt-0.5 tracking-wider">— Vedara Retreat —</p>
          </div>

          <div className="flex gap-1.5 mb-6 bg-white/5 rounded-xl p-1">
            {portalTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setPortal(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs transition-all ${
                    portal === t.id
                      ? 'bg-forest-600/30 text-forest-300 shadow-sm'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 tracking-wide">Email / ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={portal === 'admin' ? 'admin@vedara.com' : portal === 'cafe' ? 'cafe@vedara.com' : 'staff@vedara.com'}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-400/30 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-white/60 text-xs font-medium tracking-wide">Passkey</label>
                <button type="button" className="text-forest-400/70 hover:text-forest-300 text-xs transition-colors">
                  Recover Access
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-400/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-forest-900/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entering the Sanctuary...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter the Sanctuary <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6 leading-relaxed">
            Pull rope for light &bull; &copy; 2026 Vedara Retreat
          </p>
        </div>
      </motion.div>
    </div>
  );
}
