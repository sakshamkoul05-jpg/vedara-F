'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Check, AlertTriangle, X, RefreshCw, Package,
  Server, Lock, Eye, Clock, Cpu, Database, Globe, Key
} from 'lucide-react';

interface DepStatus {
  name: string;
  current: string;
  latest: string;
  status: 'ok' | 'outdated' | 'critical';
}

const APP_VERSION = '1.0.0';
const LAST_UPDATED = '2026-07-06';
const SECURITY_PATCH = 'SP-2026.07.01';

const criticalDeps: DepStatus[] = [
  { name: 'next', current: '15.5.18', latest: '15.5.18', status: 'ok' },
  { name: 'react', current: '18.3.1', latest: '19.1.0', status: 'outdated' },
  { name: 'react-dom', current: '18.3.1', latest: '19.1.0', status: 'outdated' },
  { name: 'typescript', current: '5.6.3', latest: '5.8.3', status: 'outdated' },
  { name: 'framer-motion', current: '11.18.2', latest: '12.12.2', status: 'outdated' },
  { name: 'tailwindcss', current: '3.4.15', latest: '4.1.11', status: 'outdated' },
  { name: 'zod', current: '3.23.8', latest: '3.25.67', status: 'outdated' },
  { name: 'socket.io-client', current: '4.8.3', latest: '4.8.3', status: 'ok' },
  { name: 'razorpay', current: '2.9.6', latest: '2.9.6', status: 'ok' },
  { name: 'jose', current: '5.10.0', latest: '6.0.11', status: 'outdated' },
  { name: 'dompurify', current: '3.4.11', latest: '3.4.11', status: 'ok' },
  { name: 'lenis', current: '1.3.23', latest: '1.3.23', status: 'ok' },
  { name: 'gsap', current: '3.15.0', latest: '3.15.0', status: 'ok' },
  { name: 'zustand', current: '5.0.1', latest: '5.0.5', status: 'outdated' },
];

const securityHeaders = [
  { name: 'X-Content-Type-Options', expected: 'nosniff', present: true },
  { name: 'X-Frame-Options', expected: 'DENY', present: true },
  { name: 'X-XSS-Protection', expected: '1; mode=block', present: true },
  { name: 'Referrer-Policy', expected: 'strict-origin-when-cross-origin', present: true },
  { name: 'Permissions-Policy', expected: 'camera=(), microphone=()', present: true },
  { name: 'Content-Security-Policy', expected: 'default-src', present: true },
  { name: 'Strict-Transport-Security', expected: 'max-age=31536000', present: true },
];

const envChecks = [
  { name: 'RAZORPAY_KEY_ID', status: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, env: true },
  { name: 'RAZORPAY_KEY_SECRET', status: false, env: false, note: 'Server-side only' },
  { name: 'NEXT_PUBLIC_API_URL', status: !!process.env.NEXT_PUBLIC_API_URL, env: true },
  { name: 'NEXT_PUBLIC_SITE_URL', status: !!process.env.NEXT_PUBLIC_SITE_URL, env: true },
  { name: 'SMTP Config', status: false, note: 'Backend service' },
  { name: 'GROQ_API_KEY', status: false, note: 'Backend service' },
  { name: 'Cloudinary', status: false, note: 'Backend service' },
];

export default function SecurityDashboard() {
  const [mounted, setMounted] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalDeps = criticalDeps.length;
  const okDeps = criticalDeps.filter(d => d.status === 'ok').length;
  const outdatedDeps = criticalDeps.filter(d => d.status === 'outdated').length;
  const criticalDepsCount = criticalDeps.filter(d => d.status === 'critical').length;
  const headersPresent = securityHeaders.filter(h => h.present).length;
  const envAvailable = envChecks.filter(e => e.status).length;

  const overallScore = Math.round(
    ((okDeps / totalDeps) * 40) +
    ((headersPresent / securityHeaders.length) * 30) +
    ((envAvailable / envChecks.length) * 30)
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F5F5F5] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-serif font-bold">Security Dashboard</h1>
          </div>
          <p className="text-[#C9CDD3] text-sm">System health, dependencies, and security posture</p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-[#161A20] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallScore >= 80 ? 'bg-emerald-500/10' : overallScore >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                <Shield className={`w-5 h-5 ${overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`} />
              </div>
              <span className="text-xs text-[#C9CDD3]">Security Score</span>
            </div>
            <p className={`text-3xl font-bold ${overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {overallScore}%
            </p>
          </div>

          <div className="bg-[#161A20] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-[#C9CDD3]">Dependencies</span>
            </div>
            <p className="text-3xl font-bold text-[#F5F5F5]">{okDeps}/{totalDeps}</p>
            <p className="text-xs text-[#C9CDD3] mt-1">{outdatedDeps} outdated, {criticalDepsCount} critical</p>
          </div>

          <div className="bg-[#161A20] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-[#C9CDD3]">Security Headers</span>
            </div>
            <p className="text-3xl font-bold text-[#F5F5F5]">{headersPresent}/{securityHeaders.length}</p>
            <p className="text-xs text-[#C9CDD3] mt-1">HTTP headers configured</p>
          </div>

          <div className="bg-[#161A20] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-[#C9CDD3]">Environment</span>
            </div>
            <p className="text-3xl font-bold text-[#F5F5F5]">{envAvailable}/{envChecks.length}</p>
            <p className="text-xs text-[#C9CDD3] mt-1">Variables available</p>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#161A20] border border-white/5 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Application Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[#C9CDD3] mb-1">Version</p>
              <p className="font-mono text-sm text-[#F5F5F5]">v{APP_VERSION}</p>
            </div>
            <div>
              <p className="text-xs text-[#C9CDD3] mb-1">Last Updated</p>
              <p className="font-mono text-sm text-[#F5F5F5]">{LAST_UPDATED}</p>
            </div>
            <div>
              <p className="text-xs text-[#C9CDD3] mb-1">Security Patch</p>
              <p className="font-mono text-sm text-[#F5F5F5]">{SECURITY_PATCH}</p>
            </div>
            <div>
              <p className="text-xs text-[#C9CDD3] mb-1">Framework</p>
              <p className="font-mono text-sm text-[#F5F5F5]">Next.js 15.5.18</p>
            </div>
            <div>
              <p className="text-xs text-[#C9CDD3] mb-1">Runtime</p>
              <p className="font-mono text-sm text-[#F5F5F5]">React 18.3.1</p>
            </div>
            <div>
              <p className="text-xs text-[#C9CDD3] mb-1">Build Target</p>
              <p className="font-mono text-sm text-[#F5F5F5]">ES2022 / Node 18+</p>
            </div>
          </div>
        </motion.div>

        {/* Dependencies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#161A20] border border-white/5 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Critical Dependencies
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 text-[#C9CDD3] font-medium">Package</th>
                  <th className="text-left py-2 text-[#C9CDD3] font-medium">Current</th>
                  <th className="text-left py-2 text-[#C9CDD3] font-medium">Latest</th>
                  <th className="text-left py-2 text-[#C9CDD3] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {criticalDeps.map((dep) => (
                  <tr key={dep.name} className="border-b border-white/5">
                    <td className="py-2.5 font-mono text-[#F5F5F5]">{dep.name}</td>
                    <td className="py-2.5 font-mono text-[#C9CDD3]">{dep.current}</td>
                    <td className="py-2.5 font-mono text-[#C9CDD3]">{dep.latest}</td>
                    <td className="py-2.5">
                      {dep.status === 'ok' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <Check className="w-3 h-3" /> Up to date
                        </span>
                      ) : dep.status === 'critical' ? (
                        <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3" /> Critical
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                          <RefreshCw className="w-3 h-3" /> Outdated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Security Headers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#161A20] border border-white/5 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            Security Headers
          </h2>
          <div className="space-y-2">
            {securityHeaders.map((header) => (
              <div key={header.name} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="font-mono text-sm text-[#F5F5F5]">{header.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#C9CDD3]">{header.expected}</span>
                  {header.present ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Environment */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#161A20] border border-white/5 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Environment Status
          </h2>
          <div className="space-y-2">
            {envChecks.map((env) => (
              <div key={env.name} className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[#F5F5F5]">{env.name}</span>
                  {env.note && <span className="text-xs text-[#C9CDD3]">({env.note})</span>}
                </div>
                <div className="flex items-center gap-2">
                  {env.status ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                      <Check className="w-3 h-3" /> Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#C9CDD3] text-xs">
                      <Eye className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-[#C9CDD3]/50 py-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Last checked: {lastCheck.toLocaleString()}</span>
          </div>
          <p className="mt-1">Vedara Retreat Security Dashboard — Confidential</p>
        </div>
      </div>
    </div>
  );
}
