'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Scissors, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Mail, 
  ArrowRight,
  ShieldAlert,
  CalendarCheck,
  Check,
  Award
} from 'lucide-react';
import { getTenants, getServices, getBarbers, Tenant, Service, Barber } from '@/lib/storage';

export default function TenantLandingPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenant as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      const allTenants = getTenants();
      const current = allTenants.find(t => t.id === tenantId);
      const activeServices = getServices(tenantId).filter(s => s.status === 'Active');
      const shopBarbers = getBarbers(tenantId);
      
      setTimeout(() => {
        if (current) {
          setTenant(current);
          setServices(activeServices);
          setBarbers(shopBarbers);
        }
        setLoading(false);
      }, 0);
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto"></div>
          <p className="text-[#8b7355] text-[10px] font-mono tracking-wider uppercase">Connecting isolated database...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md p-8 bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm space-y-4">
          <ShieldAlert className="h-12 w-12 text-[#8b7355] mx-auto animate-pulse" />
          <h2 className="text-2xl font-serif font-black text-neutral-900 uppercase tracking-tight">Tenant Workspace Missing</h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-serif italic">
            The shop slug <code className="bg-neutral-105 p-1 text-rose-600 rounded-sm font-mono">/{tenantId}</code> does not match any isolated schema database configured on TrimTimes.
          </p>
          <Link 
            href="/"
            className="inline-block px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#d4a574] text-white hover:text-black font-semibold rounded-sm text-xs uppercase tracking-wider transition"
          >
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const hours = [
    { day: 'Monday', time: '09:00 AM — 07:00 PM' },
    { day: 'Tuesday', time: '09:00 AM — 07:00 PM' },
    { day: 'Wednesday', time: '09:00 AM — 07:00 PM' },
    { day: 'Thursday', time: '09:00 AM — 08:00 PM' },
    { day: 'Friday', time: '09:00 AM — 08:00 PM' },
    { day: 'Saturday', time: '09:00 AM — 06:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ];

  const reviews = [
    { name: 'Arthur Pendragon', rating: 5, date: '2 days ago', text: 'Vince is an absolute master. Best hot shave of my life. Authentic feel.' },
    { name: 'Robert Downey', rating: 5, date: '1 week ago', text: 'Beautiful interior, pristine scissor cuts. I highly recommend the Royal Treatment suite!' },
    { name: 'Pawan Bhayde', rating: 5, date: '3 weeks ago', text: 'Immaculate attention to detail. Easily the best barber in Old Town.' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] flex flex-col font-sans" id="tenant-landing">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-[#1a1a1a] text-white z-40 border-b border-[#d4a574]/15">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" id="tenant-home-nav">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-serif font-black text-sm tracking-wider hover:text-[#d4a574] text-white uppercase">
              {tenant.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest font-sans">
            <a href="#services" className="text-zinc-300 hover:text-[#d4a574] transition">Services Catalogue</a>
            <a href="#barbers" className="text-zinc-300 hover:text-[#d4a574] transition">The Barbers</a>
            <a href="#schedule" className="text-zinc-300 hover:text-[#d4a574] transition">Hours & Directions</a>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href={`/${tenant.id}/customer/book`}
              className="px-5 py-2.5 text-xs tracking-wider uppercase font-bold bg-[#d4a574] text-[#1a1a1a] hover:bg-white hover:text-neutral-900 transition rounded-sm"
              id="book-now-top-btn"
            >
              Book Reservation
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Shop Backdrop */}
      <section className="bg-[#1a1a1a] text-white py-24 relative border-b border-[#d4a574]/15">
        <div className="absolute inset-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={tenant.image} 
            alt="Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/85 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-1 text-xs text-[#d4a574] tracking-widest uppercase font-bold">
              <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
              <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
              <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
              <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
              <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
              <span className="ml-2 text-white font-mono tracking-wide">{tenant.rating.toFixed(1)} / 5.0 (Premier Status)</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight leading-none text-white uppercase">
              REDEFINE YOUR <br />
              <span className="text-[#d4a574]">GROOMING CALIBER</span>
            </h1>
            
            <p className="text-zinc-300 text-sm md:text-base max-w-xl leading-relaxed font-serif italic">
              Serving the refined gentlemen of the region. Under the direction of {tenant.ownerName}, we combine vintage straight-razor skill with precision scissor crops. Indulge in classic comforts and peerless client courtesy.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-bold uppercase text-xs tracking-wider">
              <Link
                href={`/${tenant.id}/customer/book`}
                className="px-6 py-3.5 bg-[#d4a574] text-[#1a1a1a] hover:bg-white hover:text-black transition rounded-sm flex items-center gap-2"
                id="book-now-hero-btn"
              >
                Secure Booking Window <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-2 border border-white/10 px-4 py-2 rounded-sm bg-black/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Open Now — Slots Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout (2-Column with sidebar) */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12" id="landing-main">
        
        {/* Left main: services & staff */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Services Portfolio */}
          <section id="services" className="space-y-8">
            <div className="border-b border-[#d4a574]/20 pb-4">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Available Treatments</h2>
              <p className="text-[#8b7355] text-xs font-serif italic mt-1">Carefully formulated pricing matched to meticulous attention</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {services.map((svc) => (
                <div 
                  key={svc.id}
                  className="bg-white border border-[#1a1a1a]/5 rounded-sm p-5 flex flex-col justify-between hover:border-[#d4a574]/60 transition"
                  id={`service-item-${svc.id}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif font-black text-lg text-neutral-950 pr-4 leading-snug tracking-wide uppercase">{svc.name}</h3>
                      <span className="font-serif text-base font-black text-[#8b7355] shrink-0">${svc.price}</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed font-sans">{svc.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1a1a1a]/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-neutral-400 font-mono">{svc.duration} Minutes</span>
                    <Link 
                      href={`/${tenant.id}/customer/book?service=${svc.id}`}
                      className="text-[#8b7355] hover:text-[#d4a574] transition flex items-center gap-1"
                    >
                      Book This <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Barbers block */}
          <section id="barbers" className="space-y-8">
            <div className="border-b border-[#d4a574]/20 pb-4">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Barber Artisans</h2>
              <p className="text-neutral-500 text-xs mt-1 font-serif italic">Licensed experts specialized in master cuts and close straight-razor shaving.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {barbers.map((barb) => (
                <div key={barb.id} className="bg-white border border-[#1a1a1a]/5 rounded-sm p-5 text-center space-y-3" id={`barber-item-${barb.id}`}>
                  <div className="h-28 w-28 rounded-sm border border-[#1a1a1a]/10 overflow-hidden mx-auto bg-neutral-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={barb.avatar} 
                      alt={barb.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-black uppercase text-xs tracking-wider text-neutral-900">{barb.name}</h4>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#8b7355] block mt-1">{barb.specialty}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews block */}
          <section className="space-y-8 bg-[#1a1a1a] text-white p-8 rounded-sm border border-[#d4a574]/15">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Guest Reviews</h3>
              <div className="flex items-center gap-1 text-[#d4a574] text-xs font-bold font-mono uppercase tracking-wider">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                4.9 Over All
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((rev, idx) => (
                <div key={idx} className="space-y-2 text-xs border-b border-white/5 pb-4 last:border-0 last:pb-0 font-medium">
                  <div className="flex items-center justify-between text-neutral-400 font-mono">
                    <span className="font-serif font-semibold text-white text-sm">{rev.name}</span>
                    <span className="text-[10px] uppercase">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-[#d4a574] gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-zinc-300 leading-relaxed font-sans">{rev.text}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right sidebar: scheduling & contact info */}
        <aside className="lg:col-span-4 space-y-8" id="landing-sidebar">
          
          {/* Block 1: operating hours */}
          <div className="bg-white p-6 rounded-sm border border-[#1a1a1a]/5 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-xs uppercase tracking-widest text-neutral-900 border-b border-[#d4a574]/15 pb-2">Operating Hours</h3>
            <div className="space-y-2.5 text-xs font-medium">
              {hours.map((h, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-600">
                  <span className="text-neutral-400 font-sans uppercase text-[10px] tracking-wide">{h.day}</span>
                  <span className="font-serif font-bold text-neutral-900">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Block 2: location details */}
          <div className="bg-white p-6 rounded-sm border border-[#1a1a1a]/5 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-xs uppercase tracking-widest text-neutral-900 border-b border-[#d4a574]/15 pb-2">Parlor Location</h3>
            
            <div className="space-y-3.5 text-xs text-neutral-700 font-medium">
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-[#8b7355] shrink-0 mt-0.5" />
                <span>
                  <p className="font-bold text-neutral-950 font-serif">{tenant.address}</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono mt-0.5">Metropolitan Area</p>
                </span>
              </div>
              <div className="flex gap-2">
                <Phone className="h-4 w-4 text-[#8b7355] shrink-0" />
                <span className="font-serif">{tenant.phone}</span>
              </div>
              <div className="flex gap-2">
                <Mail className="h-4 w-4 text-[#8b7355] shrink-0" />
                <span className="font-mono text-neutral-500">{tenant.ownerEmail}</span>
              </div>
            </div>

            {/* Simulated static map preview */}
            <div className="relative h-40 bg-zinc-100 rounded-sm border border-neutral-200 overflow-hidden mt-4 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#f5f0eb]/60 [background-image:linear-gradient(to_right,#e5dec9_1px,transparent_1px),linear-gradient(to_bottom,#e5dec9_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative text-center space-y-2 z-10">
                <div className="h-7 w-7 rounded-sm bg-[#1a1a1a] border border-[#d4a574] text-white flex items-center justify-center mx-auto text-xs">
                  <Scissors className="h-3 w-3 text-[#d4a574]" />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] leading-none">Amber Avenue</p>
                <p className="text-[9px] text-neutral-400 font-mono">Latitude: 40.7128° N</p>
              </div>
            </div>
          </div>

          {/* Quick link sandbox testing options */}
          <div className="p-4 bg-[#d4a574]/5 border border-[#d4a574]/20 rounded-sm text-xs space-y-2 text-[#8b7355]">
            <p className="font-bold text-amber-900 uppercase tracking-widest text-[9px] flex items-center gap-1 font-mono">
              <Award className="h-3.5 w-3.5" />
              Dev Sandbox Direct Links
            </p>
            <p className="text-[10px] text-[#8b7355]/80 font-sans">Test different pages and dashboard workflows as different users:</p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-bold text-center">
              <Link href={`/${tenant.id}/customer/dashboard`} className="bg-[#1a1a1a] text-white p-2 rounded-sm text-[9px] uppercase tracking-wider hover:bg-[#d4a574] hover:text-[#1a1a1a] transition">Customer Panel</Link>
              <Link href={`/${tenant.id}/barber/dashboard`} className="bg-[#1a1a1a] text-white p-2 rounded-sm text-[9px] uppercase tracking-wider hover:bg-[#d4a574] hover:text-[#1a1a1a] transition">Barber Owner</Link>
            </div>
          </div>

        </aside>

      </main>

      {/* Styled Footer */}
      <footer className="mt-auto bg-[#1a1a1a] text-white py-12 border-t border-[#d4a574]/15">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-400 space-y-4">
          <p className="text-[#d4a574] font-serif uppercase tracking-widest font-black text-sm">{tenant.name}</p>
          <p className="font-mono text-[10px] tracking-wide uppercase">Address: {tenant.address} | Call: {tenant.phone}</p>
          <div className="h-px border-t border-white/5 max-w-xs mx-auto"></div>
          <p className="text-zinc-500 font-sans">Powered by the TrimTimes Multiroom Engine. © {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
