'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { setCurrentUser } from '@/lib/storage';

export default function UserSignupPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !email || !termsAccepted) return;

    const userId = email.split('@')[0];

    setCurrentUser({ name: fullname, email, role: 'customer' });
    setSuccessToast(`Account created! Redirecting to your dashboard...`);

    setTimeout(() => {
      setSuccessToast(null);
      router.push(`/user/${userId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#fafaf9] font-sans" id="user-signup-page">

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
          <Link href="/" className="flex items-center gap-2 py-2" id="user-signup-logo-link">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-serif font-semibold text-lg tracking-wide uppercase text-[#1a1a1a]">TrimTimes</span>
          </Link>
        </div>

        <div className="space-y-6 my-auto max-w-sm w-full mx-auto py-10">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b7355]">Customer Portal</p>
            <h2 className="text-3xl font-serif font-black text-[#1a1a1a] uppercase leading-tight">Create Account</h2>
            <p className="text-xs text-neutral-400 font-sans">Set up your customer profile to start booking appointments.</p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                Full Name <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="James Craig"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                  id="user-signup-fullname"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Email <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="james@co.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                    id="user-signup-email"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Phone <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    placeholder="(555) 901-2345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                    id="user-signup-phone"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                Password <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-neutral-300 rounded pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 select-none pt-1 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="accent-[#d4a574] mt-0.5 h-3.5 w-3.5"
                id="terms"
              />
              <label htmlFor="terms" className="text-[10px] text-neutral-500 font-bold leading-normal font-sans">
                I accept the TrimTimes platform terms of service and privacy policy.
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] text-[#fafaf9] transition font-serif font-black uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 shadow"
              id="user-signup-submit-btn"
            >
              Create My Account <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center space-y-2 pt-2">
            <div>
              <span className="text-[10px] text-neutral-400">Already have an account? </span>
              <Link href="/user/login" className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase">
                Sign In
              </Link>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Are you a shop owner? </span>
              <Link href="/signup" className="text-[10px] font-bold text-[#8b7355] hover:underline uppercase">
                Register a Shop
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
            <p className="font-serif font-light italic text-2xl md:text-3xl text-zinc-100 leading-relaxed">
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
