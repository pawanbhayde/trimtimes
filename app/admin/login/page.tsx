'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { setCurrentUser } from '@/lib/storage';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('julian@trimtimes.com');
  const [password, setPassword] = useState('••••••••');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const userObject = {
      name: 'Julian Vance',
      email: email,
      role: 'admin' as const
    };

    setCurrentUser(userObject);
    setSuccessToast("Credentials authorized. Connecting master Postgres pooling system...");

    setTimeout(() => {
      setSuccessToast(null);
      router.push('/admin/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden" id="admin-login-page">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a574_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Toast alert */}
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

        <form onSubmit={handleAdminLoginSubmit} className="p-8 space-y-5 text-xs font-semibold">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#d4a574] block mb-1">Superintendent Email</label>
            <div className="relative text-neutral-800">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-neutral-700 rounded pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#d4a574] block mb-1">Security Keyphrase</label>
            <div className="relative text-neutral-800 font-medium">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-neutral-700 rounded pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-[#d4a574] text-[#1a1a1a] hover:bg-white hover:text-neutral-900 transition font-serif font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2"
          >
            Authenticate Token <ArrowRight className="h-4 w-4" />
          </button>

          <Link href="/" className="text-center block text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider underline">
            Return to Public Directory
          </Link>
        </form>

        <div className="p-3 bg-black/20 text-center text-[9px] text-neutral-500 font-mono flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#d4a574]" /> Shared project node v3.0 // Authorized personnel only
        </div>
      </div>
    </div>
  );
}
