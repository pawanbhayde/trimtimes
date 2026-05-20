'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Store } from 'lucide-react';
import { setCurrentUser, getTenants, Tenant } from '@/lib/storage';

export default function TenantLoginPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [email, setEmail] = useState('charles@grandclassic.com');
  const [password, setPassword] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const shops = getTenants();
    setTimeout(() => {
      setTenants(shops);
      if (shops.length > 0) setSelectedTenantId(shops[0].id);
    }, 0);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedTenantId) return;

    const selectedShop = tenants.find(t => t.id === selectedTenantId);
    const userObject = {
      name: selectedShop?.ownerName || 'Shop Owner',
      email,
      role: 'barber' as const,
    };

    setCurrentUser(userObject);
    setSuccessToast(`Welcome back! Loading your shop dashboard...`);

    setTimeout(() => {
      setSuccessToast(null);
      router.push(`/shop/${selectedTenantId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#fafaf9] font-sans" id="tenant-login-page">

      {successToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#d4a574] shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-100">{successToast}</p>
          </div>
        </div>
      )}

      {/* Left: Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-12 bg-white border-r border-[#8b7355]/10 shadow-sm relative z-10 w-full max-w-lg mx-auto lg:max-w-none">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 py-2" id="login-logo-link">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-serif font-semibold text-lg tracking-wide uppercase text-[#1a1a1a]">TrimTimes</span>
          </Link>
        </div>

        <div className="space-y-6 my-auto max-w-sm w-full mx-auto py-10">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b7355]">Shop Owner Portal</p>
            <h2 className="text-3xl font-serif font-black text-[#1a1a1a] uppercase leading-tight">Tenant Login</h2>
            <p className="text-xs text-neutral-400">Access your barbershop management dashboard.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Select Your Shop</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                  id="tenant-select"
                >
                  <option value="">— Choose your shop —</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
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
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] text-[#fafaf9] transition font-serif font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 shadow"
              id="login-submit-btn"
            >
              Access Shop Dashboard <ArrowRight className="h-4 w-4" />
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
            <p className="font-serif font-light italic text-2xl md:text-3xl text-zinc-100 leading-relaxed">
              &quot;Grooming is not merely about instructions or scissor clippings. It is a sovereign ritual of care, respect, and peerless client courtesy.&quot;
            </p>
            <footer className="text-xs uppercase tracking-widest font-mono text-[#d4a574] font-black">
              — Julian Vance, TrimTimes Founder
            </footer>
          </blockquote>

          <div className="pt-8 flex gap-8 items-center border-t border-white/5 text-[10px] text-zinc-500 font-mono">
            <div>
              <p className="text-white font-bold font-serif text-sm">3,400 +</p>
              <p className="uppercase mt-0.5">Shops Licensed</p>
            </div>
            <div>
              <p className="text-white font-bold font-serif text-sm">450k +</p>
              <p className="uppercase mt-0.5">Schedules Completed</p>
            </div>
            <div>
              <p className="text-white font-bold font-serif text-sm">99.9%</p>
              <p className="uppercase mt-0.5">Schema Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
