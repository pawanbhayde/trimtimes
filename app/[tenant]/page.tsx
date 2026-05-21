"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Scissors,
  Clock,
  MapPin,
  Phone,
  Star,
  Mail,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import {
  fetchShopProfile,
  fetchTreatments,
  fetchShopHours,
  fetchShopLocation,
  fetchArtisans,
  fetchReviews,
  ShopProfile,
  Treatment,
  DayHours,
  ShopLocation,
  Artisan,
  Review,
} from "@/lib/shopManagementApi";

function fmt12(t: string) {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} week${Math.floor(d / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(d / 30)} month${Math.floor(d / 30) > 1 ? "s" : ""} ago`;
}

export default function TenantLandingPage() {
  const params = useParams();
  const tenantId = params?.tenant as string;

  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [hours, setHours] = useState<DayHours[]>([]);
  const [location, setLocation] = useState<ShopLocation | null>(null);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    setError(false);

    Promise.allSettled([
      fetchShopProfile(tenantId),
      fetchTreatments(tenantId),
      fetchShopHours(tenantId),
      fetchShopLocation(tenantId),
      fetchArtisans(tenantId),
      fetchReviews(tenantId),
    ]).then(([p, t, h, l, a, r]) => {
      if (p.status === "fulfilled") setProfile(p.value);
      else setError(true);
      if (t.status === "fulfilled") setTreatments(t.value.filter(tr => tr.status === "Active"));
      if (h.status === "fulfilled") setHours(h.value);
      if (l.status === "fulfilled") setLocation(l.value);
      if (a.status === "fulfilled") setArtisans(a.value.filter(art => art.isActive));
      if (r.status === "fulfilled") setReviews(r.value.filter(rv => rv.isFeatured));
      setLoading(false);
    });
  }, [tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto"></div>
          <p className="text-[#8b7355] text-[10px] font-mono tracking-wider uppercase">
            Loading shop profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md p-8 bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm space-y-4">
          <ShieldAlert className="h-12 w-12 text-[#8b7355] mx-auto animate-pulse" />
          <h2 className="text-2xl font-serif font-black text-neutral-900 uppercase tracking-tight">
            Shop Not Found
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-serif italic">
            The shop slug{" "}
            <code className="bg-neutral-100 p-1 text-rose-600 rounded-sm font-mono">
              /{tenantId}
            </code>{" "}
            does not match any shop configured on TrimTimes.
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

  const fullAddress = location
    ? [location.street, location.city, location.state, location.zip].filter(Boolean).join(", ")
    : null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : profile.rating.toFixed(1);

  return (
    <div
      className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] flex flex-col font-sans"
      id="tenant-landing"
    >
      {/* Header */}
      <header className="sticky top-0 bg-[#1a1a1a] text-white z-40 border-b border-[#d4a574]/15">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" id="tenant-home-nav">
            <Scissors className="h-5 w-5 text-[#d4a574]" />
            <span className="font-serif font-black text-sm tracking-wider hover:text-[#d4a574] text-white uppercase">
              {profile.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest font-sans">
            <a href="#services" className="text-zinc-300 hover:text-[#d4a574] transition">
              Services Catalogue
            </a>
            <a href="#barbers" className="text-zinc-300 hover:text-[#d4a574] transition">
              The Barbers
            </a>
            <a href="#schedule" className="text-zinc-300 hover:text-[#d4a574] transition">
              Hours & Directions
            </a>
          </div>

          <Link
            href={`/${tenantId}/customer/book`}
            className="px-5 py-2.5 text-xs tracking-wider uppercase font-bold bg-[#d4a574] text-[#1a1a1a] hover:bg-white hover:text-neutral-900 transition rounded-sm"
            id="book-now-top-btn"
          >
            Book Reservation
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-[#1a1a1a] text-white py-24 relative border-b border-[#d4a574]/15">
        {profile.bannerUrl && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.bannerUrl} alt="Interior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/85 to-transparent"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-1 text-xs text-[#d4a574] tracking-widest uppercase font-bold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
              ))}
              <span className="ml-2 text-white font-mono tracking-wide">
                {profile.rating.toFixed(1)} / 5.0 ({profile.reviewCount} reviews)
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight leading-none text-white uppercase">
              REDEFINE YOUR <br />
              <span className="text-[#d4a574]">GROOMING CALIBER</span>
            </h1>

            <p className="text-zinc-300 text-sm md:text-base max-w-xl leading-relaxed font-serif italic">
              {profile.description ||
                `Serving the refined gentlemen of the region. Under the direction of ${profile.ownerName}, we combine vintage straight-razor skill with precision scissor crops.`}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-bold uppercase text-xs tracking-wider">
              <Link
                href={`/${tenantId}/customer/book`}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12" id="landing-main">
        {/* Left: services & staff */}
        <div className="lg:col-span-8 space-y-16">
          {/* Treatments */}
          <section id="services" className="space-y-8">
            <div className="border-b border-[#d4a574]/20 pb-4">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">
                Available Treatments
              </h2>
              <p className="text-[#8b7355] text-xs font-serif italic mt-1">
                Carefully formulated pricing matched to meticulous attention
              </p>
            </div>

            {treatments.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-white border border-dashed border-neutral-200 rounded-sm text-xs text-neutral-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No treatments listed yet. Check back soon.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {treatments.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white border border-[#1a1a1a]/5 rounded-sm p-5 flex flex-col justify-between hover:border-[#d4a574]/60 transition"
                    id={`service-item-${svc.id}`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between">
                        <h3 className="font-serif font-black text-lg text-neutral-950 pr-4 leading-snug tracking-wide uppercase">
                          {svc.name}
                        </h3>
                        <span className="font-serif text-base font-black text-[#8b7355] shrink-0">
                          ${svc.price}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                        {svc.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1a1a1a]/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-neutral-400 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {svc.duration} min
                      </span>
                      <Link
                        href={`/${tenantId}/customer/book?service=${svc.id}`}
                        className="text-[#8b7355] hover:text-[#d4a574] transition flex items-center gap-1"
                      >
                        Book This <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Artisans */}
          {artisans.length > 0 && (
            <section id="barbers" className="space-y-8">
              <div className="border-b border-[#d4a574]/20 pb-4">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">
                  Barber Artisans
                </h2>
                <p className="text-neutral-500 text-xs mt-1 font-serif italic">
                  Licensed experts specialized in master cuts and close straight-razor shaving.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {artisans.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white border border-[#1a1a1a]/5 rounded-sm p-5 text-center space-y-3"
                    id={`barber-item-${art.id}`}
                  >
                    <div className="h-28 w-28 rounded-sm border border-[#1a1a1a]/10 overflow-hidden mx-auto bg-neutral-900 relative">
                      {art.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={art.avatarUrl}
                          alt={art.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 font-black text-3xl font-serif">
                          {art.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif font-black uppercase text-xs tracking-wider text-neutral-900">
                        {art.name}
                      </h4>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#8b7355] block mt-1">
                        {art.specialty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <section className="space-y-8 bg-[#1a1a1a] text-white p-8 rounded-sm border border-[#d4a574]/15">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">
                  Guest Reviews
                </h3>
                <div className="flex items-center gap-1 text-[#d4a574] text-xs font-bold font-mono uppercase tracking-wider">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {avgRating} Overall
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="space-y-2 text-xs border-b border-white/5 pb-4 last:border-0 last:pb-0 font-medium"
                  >
                    <div className="flex items-center justify-between text-neutral-400 font-mono">
                      <span className="font-serif font-semibold text-white text-sm">
                        {rev.customerName}
                      </span>
                      <span className="text-[10px] uppercase">{timeAgo(rev.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-[#d4a574] gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="lg:col-span-4 space-y-8" id="landing-sidebar">
          {/* Operating Hours */}
          <div className="bg-white p-6 rounded-sm border border-[#1a1a1a]/5 shadow-sm space-y-4" id="schedule">
            <h3 className="font-serif font-black text-xs uppercase tracking-widest text-neutral-900 border-b border-[#d4a574]/15 pb-2">
              Operating Hours
            </h3>
            {hours.length === 0 ? (
              <p className="text-[10px] text-neutral-400 font-mono">Hours not available</p>
            ) : (
              <div className="space-y-2.5 text-xs font-medium">
                {hours.map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between items-center text-neutral-600"
                  >
                    <span className="text-neutral-400 font-sans uppercase text-[10px] tracking-wide">
                      {h.day}
                    </span>
                    <span className="font-serif font-bold text-neutral-900">
                      {h.isOpen ? `${fmt12(h.openTime)} — ${fmt12(h.closeTime)}` : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-sm border border-[#1a1a1a]/5 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-xs uppercase tracking-widest text-neutral-900 border-b border-[#d4a574]/15 pb-2">
              Parlor Location
            </h3>

            <div className="space-y-3.5 text-xs text-neutral-700 font-medium">
              {fullAddress && (
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-[#8b7355] shrink-0 mt-0.5" />
                  <span>
                    <p className="font-bold text-neutral-950 font-serif">{fullAddress}</p>
                    {location?.country && (
                      <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono mt-0.5">
                        {location.country}
                      </p>
                    )}
                  </span>
                </div>
              )}
              {profile.phone && (
                <div className="flex gap-2">
                  <Phone className="h-4 w-4 text-[#8b7355] shrink-0" />
                  <span className="font-serif">{profile.phone}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 text-[#8b7355] shrink-0" />
                  <span className="font-mono text-neutral-500">{profile.email}</span>
                </div>
              )}
            </div>

            {/* Map */}
            {location?.mapEmbedUrl && location.mapEmbedUrl.startsWith('https://www.google.com/maps/embed') ? (
              <div className="relative h-40 rounded-sm border border-neutral-200 overflow-hidden mt-4">
                <iframe
                  src={location.mapEmbedUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shop Location"
                />
              </div>
            ) : (
              <div className="relative h-40 bg-zinc-100 rounded-sm border border-neutral-200 overflow-hidden mt-4 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[#f5f0eb]/60 [background-image:linear-gradient(to_right,#e5dec9_1px,transparent_1px),linear-gradient(to_bottom,#e5dec9_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative text-center space-y-2 z-10">
                  <div className="h-7 w-7 rounded-sm bg-[#1a1a1a] border border-[#d4a574] text-white flex items-center justify-center mx-auto text-xs">
                    <Scissors className="h-3 w-3 text-[#d4a574]" />
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] leading-none">
                    {profile.name}
                  </p>
                  {location?.latitude && (
                    <p className="text-[9px] text-neutral-400 font-mono">
                      {location.latitude.toFixed(4)}° N
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#1a1a1a] text-white py-12 border-t border-[#d4a574]/15">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-400 space-y-4">
          <p className="text-[#d4a574] font-serif uppercase tracking-widest font-black text-sm">
            {profile.name}
          </p>
          {(fullAddress || profile.phone) && (
            <p className="font-mono text-[10px] tracking-wide uppercase">
              {fullAddress && `Address: ${fullAddress}`}
              {fullAddress && profile.phone && " | "}
              {profile.phone && `Call: ${profile.phone}`}
            </p>
          )}
          <div className="h-px border-t border-white/5 max-w-xs mx-auto"></div>
          <p className="text-zinc-500 font-sans">
            Powered by the TrimTimes Multiroom Engine. &copy;{" "}
            {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
