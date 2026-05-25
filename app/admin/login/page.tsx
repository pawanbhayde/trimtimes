'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { adminLogin, setAdminToken, getAdminToken } from '@/lib/adminApi';
import { useAuth } from '@/lib/authStore';
import type { CustomerUser } from '@/lib/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const { accessToken, user, tenant } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // ── Session guard: redirect if already logged in ──
  useEffect(() => {
    if (getAdminToken()) {
      setRedirecting(true);
      router.replace('/admin/dashboard');
      return;
    }
    if (accessToken && tenant) {
      setRedirecting(true);
      router.replace(`/shop/${tenant.id}`);
      return;
    }
    if (accessToken && user && user.role === 'customer') {
      setRedirecting(true);
      const uid = (user as CustomerUser).email.split('@')[0];
      router.replace(`/user/${uid}`);
      return;
    }
  }, [accessToken, tenant, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await adminLogin(email, password);
      setAdminToken(token);
      document.cookie = 'tt_session=1; path=/; SameSite=Lax';
      setSuccessToast('Credentials authorized. Loading control deck...');
      setTimeout(() => router.push('/admin/dashboard'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center flex-col gap-4">
        <div className="h-8 w-8 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b7355]">Restoring session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden" id="admin-login-page">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a574_1px,transparent_1px)] [background-size:16px_16px]" />

      {successToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-white text-[#1a1a1a] border-l-4 border-[#d4a574] p-4 rounded shadow-2xl animate-fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-neutral-900 border border-[#8b7355]/30 rounded-xl overflow-hidden shadow-2xl relative z-10">
        <div className="bg-black/40 p-6 border-b border-[#8b7355]/20 text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-serif font-black text-xl text-white tracking-widest uppercase">TrimTimes Admin</span>
          </Link>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest block font-mono">Platform Superintendent Login</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs font-semibold">
          {error && (
            <div className="bg-rose-900/30 border border-rose-600/40 rounded px-3 py-2 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#d4a574] block mb-1">Superintendent Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@trimtimes.com"
                className="w-full bg-[#1a1a1a] border border-neutral-700 rounded pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#d4a574] block mb-1">Security Keyphrase</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-neutral-700 rounded pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#d4a574] text-[#1a1a1a] hover:bg-white hover:text-neutral-900 transition font-serif font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : <> Authenticate Token <ArrowRight className="h-4 w-4" /> </>}
          </button>

          <Link href="/" className="text-center block text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider underline">
            Return to Public Directory
          </Link>
        </form>

        <div className="p-3 bg-black/20 text-center text-[9px] text-neutral-500 font-mono flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#d4a574]" /> Authorized personnel only
        </div>
      </div>
    </div>
  );
}
