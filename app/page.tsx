"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  Layers,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { fetchShops } from "@/lib/shopApi";
import type { ShopListItem } from "@/lib/types";

export default function PlatformLandingPage() {
  const [shops, setShops] = useState<ShopListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadShops = () => {
    setLoading(true);
    setError(false);
    fetchShops()
      .then(setShops)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadShops();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#fafaf9] flex flex-col font-sans"
      id="platform-landing"
    >
      {/* Navbar */}
      <nav className="sticky top-0 bg-[#1a1a1a] text-white z-40 border-b border-[#8b7355]/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            id="navbar-logo"
          >
            <div className="p-2 bg-[#d4a574] text-[#1a1a1a] rounded transition group-hover:bg-[#8b7355]">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="font-serif font-semibold text-xl tracking-wide text-white group-hover:text-[#d4a574] transition">
              TrimTimes
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className="text-neutral-300 hover:text-[#d4a574] transition"
            >
              Core Capabilities
            </a>
            <a
              href="#how-it-works"
              className="text-neutral-300 hover:text-[#d4a574] transition"
            >
              The Blueprint
            </a>
            <a
              href="#tenants-list"
              className="text-[#d4a574] font-semibold border-b border-[#d4a574]/40"
            >
              Active Shops
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/user/login"
              className="px-4 py-2 text-xs tracking-wider uppercase font-bold text-neutral-300 hover:text-white border border-white/20 hover:border-white/40 transition rounded"
              id="customer-login-nav-btn"
            >
              Customer Login
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-xs tracking-wider uppercase font-bold text-neutral-300 hover:text-white border border-white/20 hover:border-white/40 transition rounded"
              id="shop-login-nav-btn"
            >
              Shop Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="bg-[#1a1a1a] text-white pt-16 pb-24 border-b border-[#8b7355]/30 relative overflow-hidden"
        id="platform-hero"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a574_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-amber-500/20 rounded-full text-xs text-[#d4a574]">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Sophisticated Multi-Tenant Barber Suite
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
              Modern Appointment <br />
              <span className="text-[#d4a574]">Management for</span> <br />
              Premier Barber Shops.
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl font-sans">
              Deploy fully isolated database schemas for your craft. TrimTimes
              offers high-contrast visual calendars, client logs, service
              portfolios, and automatic reservation sequences. Built for
              traditional, luxury, and modern barber clinics.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/user/signup"
                className="px-7 py-3.5 text-sm tracking-wider uppercase font-bold bg-[#d4a574] text-[#1a1a1a] hover:bg-white transition rounded flex items-center gap-2"
              >
                Customer Sign Up <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#tenants-list"
                className="px-7 py-3.5 text-sm tracking-wider uppercase font-bold border border-white/20 text-white hover:bg-white/5 transition rounded"
              >
                Explore Active Shops
              </a>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="relative border-4 border-[#8b7355]/40 rounded-xl overflow-hidden shadow-2xl bg-[#262626]/80 p-1">
              <div className="bg-[#1a1a1a] p-6 rounded-lg text-white space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-[#d4a574]" />
                    <span className="font-serif text-sm font-semibold text-white">
                      GENESIS BARBER CO.
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4a574]">
                    Live Database
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Scheduled Today
                  </p>
                  <div className="p-3 bg-white/5 border border-white/5 rounded flex items-center justify-between">
                    <div>
                      <p className="text-xs font-serif font-bold text-white">
                        Classic Haircut & Hot Towel
                      </p>
                      <p className="text-[10px] font-mono text-[#d4a574]">
                        10:00 AM — Charles S.
                      </p>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      Confirmed
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded flex items-center justify-between opacity-70">
                    <div>
                      <p className="text-xs font-serif font-bold text-white">
                        Executive Beard Sculpting
                      </p>
                      <p className="text-[10px] font-mono text-[#d4a574]">
                        11:15 AM — Charles S.
                      </p>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded">
                      Pending
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Julian Vance
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500">
                      Shop Admin
                    </p>
                  </div>
                  <span className="h-5 w-5 rounded-full bg-[#d4a574] text-neutral-900 font-bold flex items-center justify-center text-[10px]">
                    JV
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#d4a574] text-[#1a1a1a] p-4 rounded-lg hidden lg:block shadow-lg">
              <p className="text-3xl font-serif font-black">99.9%</p>
              <p className="text-[10px] uppercase font-bold tracking-wider">
                Schedule Uptime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Shops Directory */}
      <section className="py-20 bg-neutral-100" id="tenants-list">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 leading-tight">
              Licensed Barber Shops
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Active shops running on the TrimTimes platform. Select any shop to
              access its public portal, services catalog, and appointment
              engine.
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="h-10 w-10 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin" />
              <p className="text-[#8b7355] text-[10px] font-mono tracking-wider uppercase">
                Fetching shops from database...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <AlertCircle className="h-10 w-10 text-neutral-300" />
              <p className="text-neutral-500 text-sm">
                Could not load shops. Check your connection.
              </p>
              <button
                onClick={loadShops}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          )}

          {!loading && !error && shops.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <Scissors className="h-10 w-10 text-neutral-300" />
              <p className="text-neutral-500 text-sm">
                No shops registered yet.
              </p>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition"
              >
                Register a Shop
              </Link>
            </div>
          )}

          {!loading && !error && shops.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                  id={`tenant-card-${shop.slug}`}
                >
                  {/* Banner image */}
                  <div className="h-48 bg-neutral-900 relative overflow-hidden">
                    {shop.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shop.bannerUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Scissors className="h-12 w-12 text-neutral-700" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 text-xs font-bold px-3 py-1 rounded-full text-neutral-900 flex items-center gap-1 shadow">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {shop.rating != null ? shop.rating.toFixed(1) : "—"}
                      {(shop.reviewCount ?? 0) > 0 && (
                        <span className="text-neutral-400 font-normal ml-0.5">
                          ({shop.reviewCount})
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded bg-[#1a1a1a] text-white border border-amber-500/20">
                        {shop.schemaName}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-serif font-bold text-neutral-900 mb-1">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium mb-3 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Managed by {shop.ownerName}
                    </p>

                    <div className="space-y-1.5 text-xs text-neutral-600 mb-6 flex-1">
                      {shop.phone && (
                        <p className="flex justify-between border-b border-neutral-100 pb-1">
                          <span className="font-semibold text-neutral-400">
                            Contact:
                          </span>
                          <span className="text-neutral-900 font-serif">
                            {shop.phone}
                          </span>
                        </p>
                      )}
                      <p className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="font-semibold text-neutral-400">
                          Database:
                        </span>
                        <span
                          className={`font-bold uppercase tracking-wider text-[10px] ${
                            shop.status === "Active"
                              ? "text-emerald-600"
                              : "text-neutral-400"
                          }`}
                        >
                          {shop.status}
                        </span>
                      </p>
                      <p className="flex justify-between pb-1">
                        <span className="font-semibold text-neutral-400">
                          Reviews:
                        </span>
                        <span className="text-neutral-900 font-mono">
                          {shop.reviewCount ?? 0} total
                        </span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <Link
                        href={`/${shop.slug}`}
                        className="w-full text-center block bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition"
                        id={`visit-btn-${shop.id}`}
                      >
                        Visit Shop
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900">
              Forged for Craft Barbering
            </h2>
            <div className="h-0.5 w-16 bg-[#d4a574] mx-auto" />
            <p className="text-neutral-500 text-sm">
              Discover built-in multi-tenant isolation modules designed around
              schedules, customer records, and secure catalogs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Layers,
                title: "Multi-Tenant Isolation",
                body: "Complete separation of customer profiles, booking logs, and schedules per tenant shop. Secure, scalable schema isolation.",
              },
              {
                icon: Calendar,
                title: "Real-Time Booking",
                body: "Step-by-step barber appointment system with live availability calendars, time slots, and smart status flows.",
              },
              {
                icon: Scissors,
                title: "Service Portfolios",
                body: "Barbers have absolute liberty to set custom prices, session durations, descriptions, and toggle active states live.",
              },
              {
                icon: Users,
                title: "Customer Metrics",
                body: "Advanced CRM allowing barber teams to track guest preferences, historic schedules, and contact metrics easily.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 bg-neutral-50 rounded-xl space-y-3 border border-neutral-100"
              >
                <div className="p-2.5 bg-[#d4a574]/10 rounded-lg text-[#8b7355] w-fit">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  {f.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-neutral-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-serif font-bold text-neutral-900">
              The 3-Step Blueprint
            </h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">
              Get acquainted with the straightforward mechanics of our booking
              interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                n: "1",
                title: "Select a Barber Shop",
                body: "Explore any of our stylized, modern boutique directories listed in the licensed registry panel above.",
              },
              {
                n: "2",
                title: "Choose Service & Time",
                body: "Select options from an active services grid and pick an available date and time slot with custom barbers.",
              },
              {
                n: "3",
                title: "Manage & Relax",
                body: "Track scheduled cuts instantly via customer sideboards or update statuses in real-time in the barber dashboard.",
              },
            ].map((step) => (
              <div key={step.n} className="space-y-4 text-center">
                <div className="h-10 w-10 text-[#d4a574] bg-[#d4a574]/10 rounded-full font-serif font-bold text-lg flex items-center justify-center mx-auto border border-[#d4a574]/30">
                  {step.n}
                </div>
                <h3 className="font-serif font-bold text-[#1a1a1a] text-lg">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#1a1a1a] text-white py-12 border-t border-[#8b7355]/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-[#d4a574]" />
              <span className="font-serif text-lg font-bold">TrimTimes</span>
            </div>
            <p className="text-xs text-neutral-400">
              Classy digital scheduler solution for traditional and luxury
              multiroom grooming parlors.
            </p>
          </div>
          <div>
            <p className="font-serif font-bold text-xs uppercase tracking-wider text-[#d4a574] mb-3">
              System Roles
            </p>
            <ul className="text-xs text-neutral-400 space-y-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-white transition"
                >
                  Super Admin
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Shop Login
                </Link>
              </li>
              <li>
                <Link
                  href="/user/login"
                  className="hover:text-white transition"
                >
                  Customer Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-serif font-bold text-xs uppercase tracking-wider text-[#d4a574] mb-3">
              Live Shops
            </p>
            <ul className="text-xs text-neutral-400 space-y-2">
              {shops.slice(0, 4).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/${s.slug}`}
                    className="hover:text-white transition"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              {shops.length === 0 && !loading && (
                <li className="text-neutral-600 italic">No shops yet</li>
              )}
            </ul>
          </div>
          <div>
            <p className="font-serif font-bold text-xs uppercase tracking-wider text-[#d4a574] mb-3">
              Contact Operations
            </p>
            <p className="text-xs text-neutral-400 leading-loose">
              Email: pawanbhayde721@gmail.com
              <br />
              Tech Support: 1-800-TRIM-TIME
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 mt-8 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} TrimTimes Inc. Built with Next.js 15 &
          Tailwind CSS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
