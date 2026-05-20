"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Layers,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Award,
  CheckCircle,
  ShieldCheck,
  PlusSquare,
  Clock,
  Star,
} from "lucide-react";
import { getTenants, Tenant, saveTenants } from "@/lib/storage";

export default function PlatformLandingPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New tenant form state
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    const list = getTenants();
    setTimeout(() => {
      setTenants(list);
    }, 0);
  }, []);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !ownerEmail) return;

    const slug =
      subdomain.trim().toLowerCase().replace(/\s+/g, "-") ||
      shopName.trim().toLowerCase().replace(/\s+/g, "-");

    const newTenant: Tenant = {
      id: slug,
      name: shopName,
      ownerName: ownerName,
      ownerEmail: ownerEmail,
      schemaName: `tenant_${slug.replace(/-/g, "_")}`,
      status: "Active",
      createdDate: new Date().toISOString().split("T")[0],
      rating: 5.0,
      phone: "(555) 300-4000",
      address: "777 Premier Boulevard Suite 101",
      image: `https://picsum.photos/seed/barber${tenants.length + 1}/800/600`,
    };

    const updated = [...tenants, newTenant];
    setTenants(updated);
    saveTenants(updated);

    setSuccessToast(
      `Congratulations! ${shopName} has been initialized successfully under schema ${newTenant.schemaName}!`,
    );
    setTimeout(() => setSuccessToast(null), 5000);

    // Reset fields
    setShopName("");
    setOwnerName("");
    setOwnerEmail("");
    setSubdomain("");
    setCreateModalOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-[#fafaf9] flex flex-col font-sans"
      id="platform-landing"
    >
      {/* Toast Alert */}
      {successToast && (
        <div
          className="fixed top-5 right-5 z-50 max-w-md bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in"
          id="toast-success"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#d4a574] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif font-bold text-sm">Tenant Provisioned</p>
              <p className="text-xs text-neutral-300 mt-1">{successToast}</p>
            </div>
          </div>
        </div>
      )}

      {/* Styled Navbar */}
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
              className="text-neutral-300 hover:text-[#d4a574] ... text-[#d4a574] font-semibold border-b border-[#d4a574]/40"
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
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 text-xs tracking-wider uppercase font-bold bg-[#d4a574] text-[#1a1a1a] hover:bg-[#8b7355] hover:text-white transition rounded"
              id="start-shop-nav-btn"
            >
              Start Your Shop
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="bg-[#1a1a1a] text-white pt-16 pb-24 border-b border-[#8b7355]/30 relative overflow-hidden"
        id="platform-hero"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a574_1px,transparent_1px)] [background-size:16px_16px]"></div>
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
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-7 py-3.5 text-sm tracking-wider uppercase font-bold bg-[#d4a574] text-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a] transition rounded shadow-lg"
                id="hero-launch-shop-btn"
              >
                Launch Your Shop
              </button>
              <Link
                href="/user/signup"
                className="px-7 py-3.5 text-sm tracking-wider uppercase font-bold border border-white/20 text-white hover:bg-white/5 transition rounded"
              >
                Customer Sign Up
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
              {/* Card visualizer */}
              <div className="bg-[#1a1a1a] p-6 rounded-lg text-white space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-[#d4a574]" />
                    <span className="font-serif text-sm font-semibold text-white">
                      GENESIS BARBER CO.
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4a574]">
                    Licensed Database
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
            {/* Visual absolute accents */}
            <div className="absolute -bottom-6 -left-6 bg-[#d4a574] text-[#1a1a1a] p-4 rounded-lg hidden lg:block shadow-lg">
              <p className="text-3xl font-serif font-black">99.9%</p>
              <p className="text-[10px] uppercase font-bold tracking-wider">
                Dynamic Schedule Uptime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tenants Directory Section - Key requirement */}
      <section className="py-20 bg-neutral-100" id="tenants-list">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 leading-tight">
              Licensed Barber Shops
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Below are the active tenants running in our sandbox database.
              Select any shop to access its public portal, customizable services
              catalog, and appointment scheduling engine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tenants.map((ten) => (
              <div
                key={ten.id}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                id={`tenant-card-${ten.id}`}
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-neutral-900 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ten.image}
                    alt={ten.name}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 text-xs font-bold px-3 py-1 rounded-full text-neutral-900 flex items-center gap-1 shadow">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {ten.rating.toFixed(1)}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded bg-[#1a1a1a] text-white border border-amber-500/20">
                      {ten.schemaName}
                    </span>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-serif font-bold text-neutral-900 mb-1">
                    {ten.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium mb-3 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Managed by {ten.ownerName}
                  </p>

                  <div className="space-y-1.5 text-xs text-neutral-600 mb-6 flex-1">
                    <p className="flex justify-between border-b border-neutral-100 pb-1">
                      <span className="font-semibold text-neutral-400">
                        Address:
                      </span>
                      <span className="truncate max-w-[200px] text-neutral-900 font-medium">
                        {ten.address}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-neutral-100 pb-1">
                      <span className="font-semibold text-neutral-400">
                        Database Status:
                      </span>
                      <span
                        className={`font-bold uppercase tracking-wider text-[10px] ${ten.status === "Active" ? "text-emerald-600" : "text-neutral-400"}`}
                      >
                        {ten.status}
                      </span>
                    </p>
                    <p className="flex justify-between pb-1">
                      <span className="font-semibold text-neutral-400">
                        Contact:
                      </span>
                      <span className="text-neutral-900 font-serif">
                        {ten.phone}
                      </span>
                    </p>
                  </div>

                  {/* Actions mapping the requested layouts */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <Link
                      href={`/${ten.id}`}
                      className="w-full text-center block bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition"
                      id={`visit-btn-${ten.id}`}
                    >
                      Visit Shop
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capability Grid Segment */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900">
              Forged for Craft Barbering
            </h2>
            <div className="h-0.5 w-16 bg-[#d4a574] mx-auto"></div>
            <p className="text-neutral-500 text-sm">
              Discover built-in multi-tenant isolation modules designed around
              schedules, customer records, and secure catalogs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-neutral-50 rounded-xl space-y-3 border border-neutral-100">
              <div className="p-2.5 bg-[#d4a574]/10 rounded-lg text-[#8b7355] w-fit">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Multi-Tenant Isolation
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Complete separation of customer profiles, booking logs, and
                schedules per tenant shop. Secure, scalable schema isolation.
              </p>
            </div>

            <div className="p-6 bg-neutral-50 rounded-xl space-y-3 border border-neutral-100">
              <div className="p-2.5 bg-[#d4a574]/10 rounded-lg text-[#8b7355] w-fit">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Real-Time Booking
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Step-by-step barber appointment system with live availability
                calendars, time slots, and smart status flows.
              </p>
            </div>

            <div className="p-6 bg-neutral-50 rounded-xl space-y-3 border border-neutral-100">
              <div className="p-2.5 bg-[#d4a574]/10 rounded-lg text-[#8b7355] w-fit">
                <Scissors className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Service Portfolios
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Barbers have absolute liberty to set custom prices, session
                durations, descriptions, and toggle active states live.
              </p>
            </div>

            <div className="p-6 bg-neutral-50 rounded-xl space-y-3 border border-neutral-100">
              <div className="p-2.5 bg-[#d4a574]/10 rounded-lg text-[#8b7355] w-fit">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Customer Metrics
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Advanced CRM allowing barber teams to track guest preferences,
                historic schedules, and contact metrics easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Segment */}
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
            <div className="space-y-4 text-center">
              <div className="h-10 w-10 text-[#d4a574] bg-[#d4a574]/10 rounded-full font-serif font-bold text-lg flex items-center justify-center mx-auto border border-[#d4a574]/30">
                1
              </div>
              <h3 className="font-serif font-bold text-[#1a1a1a] text-lg">
                Select a Barber Shop
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Explore any of our stylized, modern boutique directories listed
                in the licensed registry panel above.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="h-10 w-10 text-[#d4a574] bg-[#d4a574]/10 rounded-full font-serif font-bold text-lg flex items-center justify-center mx-auto border border-[#d4a574]/30">
                2
              </div>
              <h3 className="font-serif font-bold text-[#1a1a1a] text-lg">
                Choose Service & Time
              </h3>
              <p className="text-xs text-[#555555] max-w-xs mx-auto leading-relaxed">
                Select options from an active services grid and pick an
                available date and time slot with custom barbers.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="h-10 w-10 text-[#d4a574] bg-[#d4a574]/10 rounded-full font-serif font-bold text-lg flex items-center justify-center mx-auto border border-[#d4a574]/30">
                3
              </div>
              <h3 className="font-serif font-bold text-[#1a1a1a] text-lg">
                Manage & Relax
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Track scheduled cuts instantly via customer sideboards or update
                statuses in real-time in the barber dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Styled Footer */}
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
                <Link
                  href="/shop/grand-classic"
                  className="hover:text-white transition"
                >
                  Barber Owner
                </Link>
              </li>
              <li>
                <Link
                  href="/user/pawanbhayde721"
                  className="hover:text-white transition"
                >
                  Customer Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-serif font-bold text-xs uppercase tracking-wider text-[#d4a574] mb-3">
              Live Tenants
            </p>
            <ul className="text-xs text-neutral-400 space-y-2">
              <li>
                <Link
                  href="/grand-classic"
                  className="hover:text-white transition"
                >
                  Grand Classic Barber
                </Link>
              </li>
              <li>
                <Link
                  href="/vintage-clipper"
                  className="hover:text-white transition"
                >
                  The Vintage Clipper
                </Link>
              </li>
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

      {/* Start Your Shop - Popover Modal */}
      {createModalOpen && (
        <div
          className="fixed inset-0 bg-[#1a1a1a]/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          id="create-tenant-modal"
        >
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-6 border-b border-[#8b7355]/30">
              <h3 className="font-serif font-bold text-xl text-white">
                Initialize New Barber Tenant
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Deploy a brand new isolated shop database instantly.
              </p>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">
                  Shop Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Blades"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
                  id="tenant-shopname-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">
                  Subdomain Slug / Slug ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. royal-blades"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
                  id="tenant-slug-input"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Leave blank to auto-generate from shop name.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">
                    Owner Full Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Julian Vance"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
                    id="tenant-owner-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">
                    Owner Email <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@shop.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
                    id="tenant-email-input"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-black uppercase tracking-wider"
                  id="cancel-provision-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] uppercase tracking-wider rounded"
                  id="submit-provision-btn"
                >
                  Provision Schema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
