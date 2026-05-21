'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authStore';
import { userLogin } from '@/lib/userApi';

export default function UserLoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      const result = await userLogin(email, password);
      setSession(result.accessToken, result.user, null);
      document.cookie = 'tt_session=1; path=/; SameSite=Lax';
      const uid = result.user.email.split('@')[0];
      router.push(`/user/${uid}`);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'INVALID_CREDENTIALS') setError('Incorrect email or password.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#fafaf9] font-sans" id="user-login-page">

      {/* Left: Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-12 bg-white border-r border-[#8b7355]/10 shadow-sm relative z-10 w-full max-w-lg mx-auto lg:max-w-none">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 py-2" id="user-login-logo-link">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-semibold text-lg tracking-wide uppercase text-[#1a1a1a]">TrimTimes</span>
          </Link>
        </div>

        <div className="space-y-6 my-auto max-w-sm w-full mx-auto py-10">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b7355]">Customer Portal</p>
            <h2 className="text-3xl font-black text-[#1a1a1a] uppercase leading-tight">Customer Login</h2>
            <p className="text-xs text-neutral-400">Sign in to manage your bookings and appointments.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                  id="user-login-email"
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
              disabled={loading}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] text-[#fafaf9] transition font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 shadow disabled:opacity-60 disabled:cursor-not-allowed"
              id="user-login-submit-btn"
            >
              {loading ? 'Signing in...' : <> Sign In <ArrowRight className="h-4 w-4" /> </>}
            </button>
          </form>

          <div className="text-center space-y-2 pt-2">
            <div>
              <span className="text-[10px] text-neutral-400">First time here? </span>
              <Link href="/user/signup" className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase">
                Create Account
              </Link>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Are you a shop owner? </span>
              <Link href="/login" className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase">
                Shop Login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="h-4 w-4 text-[#8b7355]" />
          TrimTimes Secured Customer Portal
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
              &quot;We preserve traditional elegance with modern software. Setting up your profile allows you to book cuts in 3 clicks.&quot;
            </p>
            <footer className="text-xs uppercase tracking-widest font-mono text-[#d4a574] font-black">
              — TrimTimes Operations Division
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
