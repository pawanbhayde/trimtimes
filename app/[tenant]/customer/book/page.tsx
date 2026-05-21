'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Scissors,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { fetchShopProfile, fetchTreatments, fetchArtisans } from '@/lib/shopManagementApi';
import type { ShopProfile, Treatment, Artisan } from '@/lib/shopManagementApi';
import { bookAppointment } from '@/lib/appointmentApi';
import { useAuth } from '@/lib/authStore';

const HOUR_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

function buildDates() {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const list: { label: string; dateStr: string; disabled: boolean }[] = [];
  const now = new Date();
  for (let i = 0; list.length < 10; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    list.push({
      label: `${weekdays[d.getDay()]} ${d.getDate()}`,
      dateStr: d.toISOString().split('T')[0],
      disabled: d.getDay() === 0,
    });
  }
  return list;
}

export default function CustomerBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.tenant as string) ?? '';

  const { user, accessToken } = useAuth();

  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loadError, setLoadError] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [bookedId, setBookedId] = useState('');

  const dates = buildDates();

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetchShopProfile(slug),
      fetchTreatments(slug),
      fetchArtisans(slug),
    ])
      .then(([shopData, txList, artisanList]) => {
        setShop(shopData);
        const active = txList.filter((t) => t.status === 'Active');
        setTreatments(active);
        const activeArtisans = artisanList.filter((a) => a.isActive);
        setArtisans(activeArtisans);
        if (activeArtisans.length > 0) setSelectedArtisan(activeArtisans[0]);

        const preId = searchParams?.get('service');
        if (preId) {
          const pre = active.find((t) => t.id === preId);
          if (pre) { setSelectedTreatment(pre); setStep(2); }
        }
        const first = dates.find((d) => !d.disabled);
        if (first) setSelectedDate(first.dateStr);
      })
      .catch(() => setLoadError(true));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTreatment || !selectedDate || !selectedTime) return;

    if (!accessToken || !user) {
      router.push(`/user/login?redirect=/${slug}/customer/book`);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await bookAppointment({
        tenantSlug: slug,
        treatmentId: selectedTreatment.id,
        artisanId: selectedArtisan?.id ?? null,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        notes: notes || undefined,
      });
      setBookedId(result.id);
      setSuccessModal(true);
    } catch {
      setSubmitError('Could not book the appointment. The slot may already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans p-6">
        <div className="space-y-4 text-center">
          <AlertCircle className="h-10 w-10 text-neutral-300 mx-auto" />
          <p className="text-neutral-500 text-sm">Could not load shop data. Please try again.</p>
          <button onClick={() => router.back()} className="text-xs font-bold uppercase tracking-wider text-[#d4a574] hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans p-6">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#8b7355] text-xs">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans" id="booking-wizard">

      {/* Header */}
      <header className="sticky top-0 bg-[#1a1a1a] text-white z-40 border-b border-[#d4a574]/15">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/${slug}`)}
              className="p-1.5 rounded-sm bg-white/5 hover:bg-white/10 transition text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-serif font-black text-sm tracking-wider uppercase hover:text-[#d4a574] text-white">
              {shop.name} Scheduler
            </span>
          </div>
          {user && (
            <span className="text-[10px] text-neutral-400 font-mono tracking-wider hidden sm:block">
              Booking as <span className="text-[#d4a574] font-bold">{user.name}</span>
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1 flex flex-col items-center">

        {/* Step indicator */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
            {['Service', 'Time & Date', 'Confirm'].map((label, i) => {
              const n = i + 1;
              return (
                <div key={label} className="relative z-10 flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-sm flex items-center justify-center text-xs font-bold font-mono transition border-2 ${step >= n ? 'bg-[#1a1a1a] text-[#d4a574] border-[#d4a574]' : 'bg-white text-neutral-400 border-neutral-200'}`}>
                    {step > n ? <Check className="h-4 w-4 text-[#d4a574]" /> : `0${n}`}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-2 text-neutral-500">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1 — Select treatment */}
        {step === 1 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Select Your Treatment</h2>
              <p className="text-xs text-neutral-500 max-w-md mx-auto font-serif italic">Choose from the active services listed by {shop.name}.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {treatments.length === 0 ? (
                <p className="text-neutral-400 text-xs text-center col-span-2">No active treatments published yet.</p>
              ) : (
                treatments.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTreatment(t)}
                    className={`w-full text-left bg-white border rounded-sm p-5 hover:border-[#d4a574]/60 transition relative flex flex-col justify-between ${selectedTreatment?.id === t.id ? 'border-2 border-[#d4a574] bg-[#d4a574]/5' : 'border-[#1a1a1a]/5'}`}
                  >
                    {selectedTreatment?.id === t.id && (
                      <span className="absolute top-4 right-4 bg-[#d4a574] text-neutral-900 rounded-sm p-1">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <div className="space-y-1.5 pr-8">
                      <h3 className="font-serif font-black text-lg text-neutral-950 uppercase tracking-wide leading-tight">{t.name}</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">{t.description}</p>
                    </div>
                    <div className="pt-4 mt-6 border-t border-neutral-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-neutral-400 font-mono">{t.duration} Mins</span>
                      <span className="font-serif text-sm text-[#8b7355] font-black">${t.price}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="pt-8 border-t border-neutral-100 flex justify-end">
              <button
                disabled={!selectedTreatment}
                onClick={() => setStep(2)}
                className={`px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-sm transition flex items-center gap-2 ${selectedTreatment ? 'bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a]' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
              >
                Proceed To Timeline <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Date, time, artisan */}
        {step === 2 && (
          <div className="w-full space-y-8">
            <div className="text-center space-y-2">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black font-semibold uppercase tracking-wider mb-2 font-mono">
                <ArrowLeft className="h-3 w-3" /> Back to Services
              </button>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Set Your Timeline</h2>
            </div>

            <div className="bg-white border border-neutral-100 rounded-sm p-6 shadow-sm space-y-8">

              {/* Artisan select */}
              {artisans.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8b7355]">1. Choose Artisan</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {artisans.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedArtisan(a)}
                        className={`p-3.5 border rounded-sm flex items-center gap-3 hover:border-[#d4a574]/60 text-left transition ${selectedArtisan?.id === a.id ? 'border-[#d4a574] bg-amber-50/10 ring-1 ring-amber-500/10' : 'border-neutral-100'}`}
                      >
                        <div className="h-10 w-10 rounded-sm bg-[#1a1a1a] border border-neutral-200 shrink-0 flex items-center justify-center text-[#d4a574] font-serif font-bold text-sm">
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-neutral-900 leading-tight">{a.name}</h4>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-400 block mt-0.5 truncate max-w-[100px]">{a.specialty}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date select */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8b7355]">{artisans.length > 0 ? '2.' : '1.'} Choose Date</p>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {dates.map((d) => (
                    <button
                      key={d.dateStr}
                      type="button"
                      disabled={d.disabled}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`flex-1 min-w-[70px] aspect-square p-2 border rounded-sm flex flex-col items-center justify-center transition-all ${d.disabled ? 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-50' : selectedDate === d.dateStr ? 'bg-[#1a1a1a] text-[#d4a574] border-[#d4a574] shadow' : 'bg-white text-neutral-700 border-neutral-100 hover:border-[#d4a574]/60'}`}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase leading-none">{d.label.split(' ')[0]}</span>
                      <span className="text-base font-serif font-black mt-1 leading-none">{d.label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time select */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8b7355]">{artisans.length > 0 ? '3.' : '2.'} Select Time Slot</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {HOUR_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3.5 px-2 border rounded-sm text-center font-bold tracking-widest text-xs transition font-mono ${selectedTime === slot ? 'bg-[#d4a574] text-neutral-900 border-[#d4a574] shadow' : 'bg-white text-neutral-800 border-neutral-100 hover:border-[#d4a574]'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-neutral-500 hover:text-black font-mono hover:underline">
                Prev: Treatments
              </button>
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-wider rounded-sm transition flex items-center gap-2"
              >
                Confirm Details <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Confirm & submit */}
        {step === 3 && (
          <div className="w-full space-y-8">
            <div className="text-center space-y-2">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black font-semibold uppercase tracking-wider mb-2 font-mono">
                <ArrowLeft className="h-3 w-3" /> Back to Date & Time
              </button>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Confirm Appointment</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

              {/* Form */}
              <form onSubmit={handleSubmit} className="md:col-span-7 bg-white border border-neutral-100 rounded-sm p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-black text-sm uppercase tracking-wide text-[#1a1a1a] border-b border-neutral-100 pb-2">Session Notes (optional)</h3>
                <textarea
                  rows={4}
                  value={notes}
                  placeholder="e.g. Skin fade, blend sides, keep beard intact..."
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574] text-sm font-sans"
                />

                {!accessToken && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-sm p-3">
                    You need to be logged in to book. Clicking below will redirect you to login.
                  </p>
                )}

                {submitError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#1a1a1a] hover:bg-[#d4a574] text-white hover:text-neutral-900 transition font-serif font-black uppercase text-xs tracking-widest rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Booking...' : 'Request Appointment'}
                </button>
              </form>

              {/* Summary card */}
              <div className="md:col-span-5 bg-[#1a1a1a] text-[#fafaf9] rounded-sm overflow-hidden border border-[#d4a574]/20 shadow-lg">
                <div className="bg-[#1a1a1a] p-5 border-b border-[#d4a574]/15 flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#d4a574] uppercase tracking-wider">Booking Summary</span>
                  <Scissors className="h-4 w-4 text-[#d4a574]" />
                </div>
                <div className="p-6 space-y-4 text-xs">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono mb-1">Treatment</p>
                    <p className="font-serif font-bold text-white text-base uppercase">{selectedTreatment?.name}</p>
                    <p className="text-neutral-400 text-[10px] mt-0.5">{selectedTreatment?.duration} mins · ${selectedTreatment?.price}</p>
                  </div>
                  {selectedArtisan && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono mb-1">Artisan</p>
                      <p className="font-serif font-bold text-[#d4a574]">{selectedArtisan.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono mb-1">Schedule</p>
                    <p className="font-mono text-white font-bold">{selectedDate} at {selectedTime}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-neutral-400 uppercase">Total</span>
                    <span className="font-serif text-xl font-black text-white">${selectedTreatment?.price}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-sm border border-white/5 flex items-start gap-2 text-[10px] text-zinc-400">
                    <ShieldCheck className="h-4 w-4 text-[#d4a574] shrink-0 mt-0.5" />
                    <p>Appointment will be confirmed by the shop after booking.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Success modal */}
      {successModal && (
        <div className="fixed inset-0 bg-[#1a1a1a]/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#d4a574] rounded-sm max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 bg-[#d4a574]/10 text-[#8b7355] rounded-sm flex items-center justify-center mx-auto border border-[#d4a574]/20">
              <CheckCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <span className="text-[#8b7355] text-[10px] uppercase font-mono tracking-widest font-black block">Appointment Requested</span>
              <h3 className="font-serif font-black text-2xl text-neutral-950 uppercase">Booking Confirmed</h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Your appointment has been submitted and is pending shop confirmation. Ref:{' '}
                <code className="bg-neutral-100 px-1 rounded font-mono text-[10px]">#{bookedId.slice(0, 8)}</code>
              </p>
            </div>
            <div className="bg-neutral-50 rounded-sm p-4 border border-neutral-100 text-xs text-left space-y-1.5">
              <p className="flex justify-between"><span className="text-neutral-400">Treatment:</span> <span className="font-bold font-serif">{selectedTreatment?.name}</span></p>
              {selectedArtisan && <p className="flex justify-between"><span className="text-neutral-400">Artisan:</span> <span className="font-serif font-bold">{selectedArtisan.name}</span></p>}
              <p className="flex justify-between"><span className="text-neutral-400">When:</span> <span className="font-mono font-bold">{selectedDate} · {selectedTime}</span></p>
            </div>
            <button
              onClick={() => router.push(`/${slug}`)}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] transition font-serif font-black text-white uppercase tracking-widest text-xs rounded-sm"
            >
              Back to Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
