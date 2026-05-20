'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getCurrentUser, setCurrentUser, getTenants, Tenant } from '@/lib/storage';

export default function TenantLoginPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || 'grand-classic';

  const [currentShop, setCurrentShop] = useState<Tenant | null>(null);
  const [email, setEmail] = useState('pawanbhayde721@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [role, setRole] = useState<'customer' | 'barber' | 'admin'>('customer');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const shops = getTenants();
    const match = shops.find(s => s.id === tenantId);
    
    setTimeout(() => {
      if (match) {
        setCurrentShop(match);
      }
    }, 0);
  }, [tenantId]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate authentication credentials commitment
    const userObject = {
      name: role === 'customer' ? 'Pawan Bhayde' : role === 'barber' ? 'Charles Sterling' : 'Julian Vance',
      email: email,
      role: role
    };

    setCurrentUser(userObject);
    setSuccessToast(`Welcome back, ${userObject.name}! Handshaking database session...`);

    setTimeout(() => {
      setSuccessToast(null);
      if (role === 'customer') {
        router.push(`/${tenantId}/customer/dashboard`);
      } else if (role === 'barber') {
        router.push(`/${tenantId}/barber/dashboard`);
      } else {
        router.push(`/admin/dashboard`);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#fafaf9] font-sans" id="auth-login-page">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#d4a574] shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-100">{successToast}</p>
          </div>
        </div>
      )}

      {/* Left Column: Form Card */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-12 bg-white border-r border-[#8b7355]/10 shadow-sm relative z-10 w-full max-w-lg mx-auto lg:max-w-none">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 py-2" id="login-logo-link">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-serif font-semibold text-lg tracking-wide uppercase text-[#1a1a1a]">TrimTimes</span>
          </Link>
        </div>

        <div className="space-y-6 my-auto max-w-sm w-full mx-auto py-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-black text-[#1a1a1a] uppercase leading-tight">Access TrimTimes</h2>
            <p className="text-xs text-neutral-400">Isolated database connection: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold text-neutral-800">{currentShop ? currentShop.schemaName : 'tenant_grand_classic'}</code></p>
          </div>

          {/* Sandbox Role Picker Header */}
          <div className="p-3 bg-neutral-50 rounded border border-neutral-150 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">Sandbox Actor Context Selector</label>
            <div className="grid grid-cols-3 gap-1 text-center font-bold text-[9px] uppercase tracking-wider">
              <button 
                type="button"
                onClick={() => { setRole('customer'); setEmail('pawanbhayde721@gmail.com'); }}
                className={`py-2 px-1 rounded transition ${role === 'customer' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >
                👤 Customer
              </button>
              <button 
                type="button"
                onClick={() => { setRole('barber'); setEmail('charles@grandclassic.com'); }}
                className={`py-2 px-1 rounded transition ${role === 'barber' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >
                💈 Barber
              </button>
              <button 
                type="button"
                onClick={() => { setRole('admin'); setEmail('julian@trimtimes.com'); }}
                className={`py-2 px-1 rounded transition ${role === 'admin' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          {/* Actual Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Electronic E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-400">Security Password</label>
                <a href="#" className="text-[10px] text-[#8b7355] hover:underline font-bold">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                defaultChecked 
                className="accent-[#d4a574] h-3.5 w-3.5"
                id="remember-me"
              />
              <label htmlFor="remember-me" className="text-[10px] text-neutral-500 font-bold font-sans">Retain Session on Cluster Nodes</label>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] text-[#fafaf9] transition font-serif font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 shadow"
              id="login-submit-btn"
            >
              Sign In to Schema <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {role === 'customer' && (
            <div className="text-center pt-2">
              <span className="text-[10px] text-neutral-400">First time booking? </span>
              <Link 
                href={`/${tenantId}/register`}
                className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase"
              >
                Register Here
              </Link>
            </div>
          )}
        </div>

        <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="h-4 w-4 text-[#8b7355]" />
          TrimTimes Secured Multi-Tenant Architecture
        </div>
      </div>

      {/* Right Column: Immersive quote/branding */}
      <div className="hidden lg:col-span-7 bg-[#1a1a1a] relative flex items-center justify-center p-12 overflow-hidden border-l border-[#8b7355]/30">
        <div className="absolute inset-0 opacity-15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://picsum.photos/seed/vintagebarb/1200/900" 
            alt="Barber" 
            className="w-full h-full object-cover"
          />
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
