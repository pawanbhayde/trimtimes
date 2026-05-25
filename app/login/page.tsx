'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authStore';
import { fetchShops, shopLogin } from '@/lib/shopApi';
import { getAdminToken } from '@/lib/adminApi';
import type { ShopListItem, CustomerUser } from '@/lib/types';

export default function TenantLoginPage() {
  const router = useRouter();
  const { setSession, accessToken, user, tenant } = useAuth();

  const [shops, setShops] = useState<ShopListItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(true);
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

  useEffect(() => {
    fetchShops()
      .then((list) => {
        setShops(list);
        if (list.length > 0) setSelectedTenantId(list[0].id);
      })
      .catch(() => setError('Could not load shops. Please refresh.'))
      .finally(() => setShopsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedTenantId) return;

    setError(null);
    setLoading(true);

    try {
      const result = await shopLogin(email, password, selectedTenantId);
      setSession(result.accessToken, result.user, result.tenant);
      document.cookie = 'tt_session=1; path=/; SameSite=Lax';
      router.push(`/shop/${result.tenant.id}`);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'SHOP_NOT_FOUND') setError('Shop not found. Please check your selection.');
      else if (code === 'SHOP_INACTIVE') setError('This shop account is currently inactive.');
      else if (code === 'INVALID_CREDENTIALS') setError('Incorrect email or password.');
      else setError('Something went wrong. Please try again.');
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
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#fafaf9] font-sans" id="tenant-login-page">

      {/* Left: Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-12 bg-white border-r border-[#8b7355]/10 shadow-sm relative z-10 w-full max-w-lg mx-auto lg:max-w-none">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 py-2" id="login-logo-link">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-semibold text-lg tracking-wide uppercase text-[#1a1a1a]">TrimTimes</span>
          </Link>
        </div>

        <div className="space-y-6 my-auto max-w-sm w-full mx-auto py-10">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b7355]">Shop Owner Portal</p>
            <h2 className="text-3xl font-black text-[#1a1a1a] uppercase leading-tight">Tenant Login</h2>
            <p className="text-xs text-neutral-400">Access your barbershop management dashboard.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Select Your Shop</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  disabled={shopsLoading}
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium disabled:opacity-50"
                  id="tenant-select"
                >
                  {shopsLoading ? (
                    <option>Loading shops...</option>
                  ) : (
                    <>
                      <option value="">— Choose your shop —</option>
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@shop.com"
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-400">Password</label>
                <a href="#" className="text-[10px] text-[#8b7355] hover:underline font-bold">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || shopsLoading}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] text-[#fafaf9] transition font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 shadow disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit-btn"
            >
              {loading ? 'Signing in...' : <> Access Shop Dashboard <ArrowRight className="h-4 w-4" /> </>}
            </button>
          </form>

          <div className="text-center space-y-2 pt-2">
            <div>
              <span className="text-[10px] text-neutral-400">New shop? </span>
              <Link href="/signup" className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase">
                Register Your Shop
              </Link>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Are you a customer? </span>
              <Link href="/user/login" className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase">
                Customer Login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="h-4 w-4 text-[#8b7355]" />
          TrimTimes Secured Multi-Tenant Architecture
        </div>
      </div>

      {/* Right: Branding */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#1a1a1a] relative items-center justify-center p-12 overflow-hidden border-l border-[#8b7355]/30">
        <div className="absolute inset-0 opacity-15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://picsum.photos/seed/vintagebarb/1200/900" alt="Barber" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] via-[#1a1a1a]/85 to-transparent"></div>

        <div className="relative max-w-lg space-y-6 text-center lg:text-left z-10">
          <div className="p-3 bg-[#d4a574]/10 border border-[#d4a574]/30 rounded-full w-fit max-w-[50px]">
            <Scissors className="h-6 w-6 text-[#d4a574]" />
          </div>
          <blockquote className="space-y-4">
            <p className="font-light italic text-2xl md:text-3xl text-zinc-100 leading-relaxed">
              &quot;Grooming is not merely about instructions or scissor clippings. It is a sovereign ritual of care, respect, and peerless client courtesy.&quot;
            </p>
            <footer className="text-xs uppercase tracking-widest font-mono text-[#d4a574] font-black">
              — Julian Vance, TrimTimes Founder
            </footer>
          </blockquote>

          <div className="pt-8 flex gap-8 items-center border-t border-white/5 text-[10px] text-zinc-500 font-mono">
            <div><p className="text-white font-bold text-sm">3,400 +</p><p className="uppercase mt-0.5">Shops Licensed</p></div>
            <div><p className="text-white font-bold text-sm">450k +</p><p className="uppercase mt-0.5">Schedules Completed</p></div>
            <div><p className="text-white font-bold text-sm">99.9%</p><p className="uppercase mt-0.5">Schema Uptime</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
