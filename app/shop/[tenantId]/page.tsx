'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, DollarSign, CheckCircle, X, Scissors, Clock, Sliders,
  TrendingUp, Info, MapPin, Users, Star, Building2, LayoutDashboard,
  Plus, Pencil, Trash2, Save, Globe, PowerOff,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import StatsCard from '@/components/dashboard/stats-card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/authStore';
import {
  fetchShopProfile, updateShopProfile,
  fetchShopAppointments, updateShopAppointmentStatus,
  type ShopAppointment,
  fetchTreatments, createTreatment, updateTreatment, deleteTreatment,
  fetchShopHours, updateShopHours,
  fetchShopLocation, updateShopLocation,
  fetchArtisans, createArtisan, updateArtisan, deleteArtisan,
  fetchReviews, toggleReviewFeatured,
  type ShopProfile, type Treatment, type DayHours, type ShopLocation,
  type Artisan, type Review,
} from '@/lib/shopManagementApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: DayHours['day'][] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const DEFAULT_HOURS: DayHours[] = DAYS.map((day, i) => ({
  day,
  isOpen: day !== 'Sunday',
  openTime: '09:00',
  closeTime: i === 3 || i === 4 ? '20:00' : i === 5 ? '18:00' : '19:00',
}));

const TABS = [
  { id: 'overview',    label: 'Overview',     icon: LayoutDashboard },
  { id: 'profile',     label: 'Shop Profile', icon: Building2 },
  { id: 'treatments',  label: 'Treatments',   icon: Scissors },
  { id: 'hours',       label: 'Hours',        icon: Clock },
  { id: 'location',    label: 'Location',     icon: MapPin },
  { id: 'artisans',    label: 'Artisans',     icon: Users },
  { id: 'reviews',     label: 'Reviews',      icon: Star },
] as const;

type TabId = typeof TABS[number]['id'];

const EMPTY_TREATMENT = {
  name: '', description: '', price: '', duration: '',
  status: 'Active' as 'Active' | 'Inactive',
};

const EMPTY_ARTISAN = {
  name: '', specialty: '', bio: '', avatarUrl: '', isActive: true,
};

const EMPTY_LOCATION: ShopLocation = {
  street: '', city: '', state: '', zip: '', country: 'US',
  latitude: null, longitude: null, mapEmbedUrl: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopDashboardPage() {
  const params = useParams();
  const tenantId = (params?.tenantId as string) || '';
  const { tenant: authTenant } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [toast, setToast] = useState<string | null>(null);

  // Overview
  const [appointments, setAppointments] = useState<ShopAppointment[]>([]);
  const [selectedApt, setSelectedApt] = useState<ShopAppointment | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedTime, setBlockedTime] = useState('14:00');

  // Profile
  const [profile, setProfile] = useState({
    name: '', description: '', phone: '', email: '', ownerName: '', bannerUrl: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Treatments
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState(EMPTY_TREATMENT);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(null);

  // Hours
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS);
  const [hoursSaving, setHoursSaving] = useState(false);

  // Location
  const [location, setLocation] = useState<ShopLocation>(EMPTY_LOCATION);
  const [locationSaving, setLocationSaving] = useState(false);

  // Artisans
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [artisanForm, setArtisanForm] = useState(EMPTY_ARTISAN);
  const [showArtisanForm, setShowArtisanForm] = useState(false);
  const [editingArtisanId, setEditingArtisanId] = useState<string | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load overview appointments on mount
  useEffect(() => {
    if (!tenantId) return;
    fetchShopAppointments().then(setAppointments).catch(() => setAppointments([]));
  }, [tenantId]);

  // Lazy-load per tab
  useEffect(() => {
    if (!tenantId) return;

    if (activeTab === 'profile') {
      fetchShopProfile(tenantId)
        .then(p => setProfile({
          name: p.name, description: p.description, phone: p.phone,
          email: p.email, ownerName: p.ownerName, bannerUrl: p.bannerUrl,
        }))
        .catch(() => {
          if (authTenant) setProfile(prev => ({ ...prev, name: authTenant.name }));
        });
    } else if (activeTab === 'treatments') {
      setTreatmentsLoading(true);
      fetchTreatments(tenantId)
        .then(setTreatments)
        .catch(() => setTreatments([]))
        .finally(() => setTreatmentsLoading(false));
    } else if (activeTab === 'hours') {
      fetchShopHours(tenantId).then(setHours).catch(() => {});
    } else if (activeTab === 'location') {
      fetchShopLocation(tenantId).then(setLocation).catch(() => {});
    } else if (activeTab === 'artisans') {
      setArtisansLoading(true);
      fetchArtisans(tenantId)
        .then(setArtisans)
        .catch(() => setArtisans([]))
        .finally(() => setArtisansLoading(false));
    } else if (activeTab === 'reviews') {
      setReviewsLoading(true);
      fetchReviews(tenantId)
        .then(setReviews)
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [activeTab, tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Overview handlers ────────────────────────────────────────────────────

  const updateAptStatus = async (id: string, status: ShopAppointment['status']) => {
    try {
      const updated = await updateShopAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedApt?.id === id) setSelectedApt(updated);
      showToast(`Appointment #${id.slice(0, 8)} marked as ${status}.`);
    } catch {
      showToast('Failed to update appointment status.');
    }
  };

  // ─── Profile handler ──────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateShopProfile(profile);
      showToast('Shop profile saved.');
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── Treatment handlers ───────────────────────────────────────────────────

  const handleSaveTreatment = async () => {
    if (!treatmentForm.name || !treatmentForm.price || !treatmentForm.duration) return;
    const payload = {
      name: treatmentForm.name,
      description: treatmentForm.description,
      price: parseFloat(treatmentForm.price),
      duration: parseInt(treatmentForm.duration),
      status: treatmentForm.status,
    };
    try {
      if (editingTreatmentId) {
        const updated = await updateTreatment(editingTreatmentId, payload);
        setTreatments(prev => prev.map(t => t.id === editingTreatmentId ? updated : t));
        showToast('Treatment updated.');
      } else {
        const created = await createTreatment(payload);
        setTreatments(prev => [...prev, created]);
        showToast('Treatment added.');
      }
      setTreatmentForm(EMPTY_TREATMENT);
      setShowTreatmentForm(false);
      setEditingTreatmentId(null);
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to save treatment.');
    }
  };

  const handleEditTreatment = (t: Treatment) => {
    setTreatmentForm({
      name: t.name, description: t.description,
      price: String(t.price), duration: String(t.duration), status: t.status,
    });
    setEditingTreatmentId(t.id);
    setShowTreatmentForm(true);
  };

  const handleDeleteTreatment = async (id: string) => {
    try {
      await deleteTreatment(id);
      setTreatments(prev => prev.filter(t => t.id !== id));
      showToast('Treatment removed.');
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to remove treatment.');
    }
  };

  // ─── Hours handler ────────────────────────────────────────────────────────

  const handleSaveHours = async () => {
    setHoursSaving(true);
    try {
      await updateShopHours(hours);
      showToast('Operating hours saved.');
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to save hours.');
    } finally {
      setHoursSaving(false);
    }
  };

  const toggleDay = (i: number) =>
    setHours(prev => prev.map((d, idx) => idx === i ? { ...d, isOpen: !d.isOpen } : d));

  const setDayTime = (i: number, key: 'openTime' | 'closeTime', val: string) =>
    setHours(prev => prev.map((d, idx) => idx === i ? { ...d, [key]: val } : d));

  // ─── Location handler ─────────────────────────────────────────────────────

  const handleSaveLocation = async () => {
    setLocationSaving(true);
    try {
      await updateShopLocation(location);
      showToast('Location saved.');
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to save location.');
    } finally {
      setLocationSaving(false);
    }
  };

  // ─── Artisan handlers ─────────────────────────────────────────────────────

  const handleSaveArtisan = async () => {
    if (!artisanForm.name || !artisanForm.specialty) return;
    try {
      if (editingArtisanId) {
        const updated = await updateArtisan(editingArtisanId, artisanForm);
        setArtisans(prev => prev.map(a => a.id === editingArtisanId ? updated : a));
        showToast('Artisan updated.');
      } else {
        const created = await createArtisan(artisanForm);
        setArtisans(prev => [...prev, created]);
        showToast('Artisan added.');
      }
      setArtisanForm(EMPTY_ARTISAN);
      setShowArtisanForm(false);
      setEditingArtisanId(null);
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to save artisan.');
    }
  };

  const handleEditArtisan = (a: Artisan) => {
    setArtisanForm({ name: a.name, specialty: a.specialty, bio: a.bio, avatarUrl: a.avatarUrl, isActive: a.isActive });
    setEditingArtisanId(a.id);
    setShowArtisanForm(true);
  };

  const handleDeleteArtisan = async (id: string) => {
    try {
      await deleteArtisan(id);
      setArtisans(prev => prev.filter(a => a.id !== id));
      showToast('Artisan removed.');
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to remove artisan.');
    }
  };

  // ─── Review handler ───────────────────────────────────────────────────────

  const handleToggleFeatured = async (rev: Review) => {
    try {
      const updated = await toggleReviewFeatured(rev.id, !rev.isFeatured);
      setReviews(prev => prev.map(r => r.id === rev.id ? updated : r));
    } catch (err: any) {
      showToast(err.response?.data?.error?.message ?? 'Failed to update review.');
    }
  };

  // ─── Derived (overview) ───────────────────────────────────────────────────

  const activeCount = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
  const totalRev = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED').reduce((s, a) => s + a.treatmentPrice, 0);
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;
  const schedule = [...appointments].filter(a => a.status !== 'CANCELLED').sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  const shopName = authTenant?.name || profile.name || 'Barbershop';

  const inp = 'w-full bg-[#fafaf9] border border-neutral-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="shop-dashboard">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {toast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded-sm shadow-xl">
            <p className="font-bold text-[10px] uppercase tracking-widest text-[#d4a574]">Notice</p>
            <p className="text-xs mt-1 text-zinc-300">{toast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-0 max-w-6xl w-full mx-auto" id="shop-content">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1a1a1a]/5">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#8b7355]">Control Panel</p>
              <h2 className="text-2xl font-black text-neutral-900 mt-1 uppercase tracking-tight">
                {shopName} Dashboard
              </h2>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/${tenantId}`}
                target="_blank"
                className="px-4 py-2 border border-neutral-300 text-neutral-600 font-bold hover:border-[#d4a574] hover:text-[#d4a574] rounded-sm text-xs uppercase tracking-widest flex items-center gap-1.5 transition"
              >
                <Globe className="h-3.5 w-3.5" /> Public Page
              </Link>
              <button
                onClick={() => setShowBlockModal(true)}
                className="px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold rounded-sm text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow"
              >
                <PowerOff className="h-3.5 w-3.5" /> Block Slot
              </button>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex border-b border-neutral-200 overflow-x-auto mb-6">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition shrink-0',
                  activeTab === tab.id
                    ? 'border-[#d4a574] text-[#1a1a1a]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700',
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Active Queue"        value={activeCount}    icon={Clock}        description="Pending & confirmed" />
                <StatsCard title="Projected Earnings"  value={`$${totalRev}`} icon={DollarSign}   description="Confirmed & completed" changeType="positive" />
                <StatsCard title="Groomings Done"      value={completedCount} icon={CheckCircle}  description="Closed records" />
                <StatsCard title="Cancellations"       value={cancelledCount} icon={X}            description="Revoked windows" changeType="negative" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">

                  {/* Timeline */}
                  <div className="bg-white rounded-sm border border-[#1a1a1a]/5 shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <h3 className="font-black text-lg text-neutral-900 uppercase">Today&apos;s Schedule</h3>
                      <span className="text-[9px] uppercase font-bold bg-[#d4a574]/15 text-[#8b7355] px-2.5 py-1.5 rounded-sm">Chronological</span>
                    </div>
                    {schedule.length === 0 ? (
                      <div className="text-center py-10 space-y-2">
                        <Calendar className="h-8 w-8 text-neutral-300 mx-auto" />
                        <p className="text-xs text-neutral-400 italic">No appointments scheduled.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {schedule.map(apt => (
                          <div key={apt.id} className="flex gap-4 cursor-pointer" onClick={() => setSelectedApt(apt)}>
                            <div className="w-14 pt-3 text-right shrink-0">
                              <p className="text-xs font-bold font-mono">{apt.appointmentTime}</p>
                            </div>
                            <div className={cn(
                              'flex-1 p-4 rounded-sm border transition',
                              apt.id === selectedApt?.id
                                ? 'border-[#d4a574] bg-[#fafaf9]'
                                : 'border-[#1a1a1a]/10 bg-white hover:border-[#d4a574]/40',
                            )}>
                              <div className="flex justify-between items-center">
                                <p className="font-black text-sm uppercase">{apt.customerName}</p>
                                <span className={cn('px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase font-mono',
                                  apt.status === 'COMPLETED' ? 'bg-[#d4a574] text-[#1a1a1a]' :
                                  apt.status === 'CONFIRMED' ? 'border border-[#d4a574] text-[#d4a574]' :
                                  'bg-neutral-100 text-neutral-600 border border-neutral-200',
                                )}>{apt.status}</span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-1">
                                {apt.treatmentName} — <span className="italic text-amber-700">{apt.artisanName}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Weekly chart */}
                  <div className="bg-white rounded-sm border border-[#1a1a1a]/5 shadow-sm p-6 space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="font-black text-lg text-neutral-900 uppercase">Weekly Booking Density</h3>
                      <TrendingUp className="h-4 w-4 text-[#8b7355]" />
                    </div>
                    <div className="flex items-end justify-between gap-3 h-40 px-2">
                      {[
                        { name: 'Mon', h: 'h-16' }, { name: 'Tue', h: 'h-24' }, { name: 'Wed', h: 'h-36' },
                        { name: 'Thu', h: 'h-40' }, { name: 'Fri', h: 'h-32' }, { name: 'Sat', h: 'h-24' }, { name: 'Sun', h: 'h-2' },
                      ].map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-full relative bg-neutral-100 h-32 hover:bg-[#d4a574]/10 transition overflow-hidden rounded-sm">
                            <div className={`w-full bg-[#1a1a1a] group-hover:bg-[#d4a574] rounded-sm transition-all absolute bottom-0 ${d.h}`} />
                          </div>
                          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inspector + Rules */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-sm border-2 border-[#1a1a1a]/5 shadow-md p-5 space-y-4">
                    <h3 className="font-bold text-base text-neutral-900 uppercase border-b border-[#8b7355]/15 pb-2">Schedule Inspector</h3>
                    {selectedApt ? (
                      <div className="space-y-4 text-xs">
                        <div>
                          <span className="text-[9px] font-mono uppercase bg-[#1a1a1a] text-white py-0.5 px-2 rounded-sm font-bold">#{selectedApt.id}</span>
                          <h4 className="font-extrabold text-neutral-950 text-base uppercase mt-2">{selectedApt.customerName}</h4>
                          <p className="text-[10px] font-mono text-zinc-400">{selectedApt.customerEmail}</p>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-100 space-y-1.5 text-[11px]">
                          <p className="flex justify-between"><span className="text-zinc-400 text-[9px] uppercase">Treatment:</span><span className="font-bold">{selectedApt.treatmentName}</span></p>
                          <p className="flex justify-between"><span className="text-zinc-400 text-[9px] uppercase">When:</span><span className="font-bold">{selectedApt.appointmentDate} at {selectedApt.appointmentTime}</span></p>
                          <p className="flex justify-between"><span className="text-zinc-400 text-[9px] uppercase">Barber:</span><span className="italic font-black text-stone-900">{selectedApt.artisanName}</span></p>
                          <p className="flex justify-between"><span className="text-zinc-400 text-[9px] uppercase">Charge:</span><span className="font-mono font-bold">${selectedApt.treatmentPrice}</span></p>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 font-bold text-[9px] tracking-wider">
                          <button onClick={() => updateAptStatus(selectedApt.id, 'CONFIRMED')} className="py-2 bg-emerald-600 text-white hover:bg-emerald-700 uppercase rounded-sm">Confirm</button>
                          <button onClick={() => updateAptStatus(selectedApt.id, 'COMPLETED')} className="py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-neutral-900 uppercase rounded-sm transition">Done</button>
                          <button onClick={() => updateAptStatus(selectedApt.id, 'CANCELLED')} className="py-2 bg-rose-600 text-white hover:bg-rose-700 uppercase rounded-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-400">
                        <Info className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs italic">Click a schedule block to inspect.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-sm border border-[#1a1a1a]/5 p-5 space-y-3 text-xs shadow-sm">
                    <h4 className="font-bold text-xs text-[#1a1a1a] uppercase border-b border-neutral-100 pb-2">Scheduler Rules</h4>
                    <p className="text-neutral-500">Schema: <code className="bg-neutral-100 px-1 rounded-sm font-mono text-neutral-800">{authTenant?.schemaName || tenantId}</code></p>
                    <div className="p-3 bg-[#fafaf9] rounded-sm border border-neutral-100 text-[10px] font-mono space-y-1 text-neutral-500">
                      <p>• Booking interval: 15 min</p>
                      <p>• Cancellation window: 12 hrs</p>
                      <p>• Email reminders: Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SHOP PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm p-6 space-y-5">
                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">Shop Identity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Shop Name</label>
                    <input className={inp} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Royal Blades Barber Co." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Description</label>
                    <textarea rows={3} className={cn(inp, 'resize-none')} value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} placeholder="A short description shown on your public page..." />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Owner Name</label>
                    <input className={inp} value={profile.ownerName} onChange={e => setProfile(p => ({ ...p, ownerName: e.target.value }))} placeholder="Julian Vance" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Contact Email</label>
                    <input type="email" className={inp} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="owner@shop.com" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Phone Number</label>
                    <input className={inp} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Banner Image URL</label>
                    <input className={inp} value={profile.bannerUrl} onChange={e => setProfile(p => ({ ...p, bannerUrl: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>
                {profile.bannerUrl && (
                  <div className="h-32 rounded-sm overflow-hidden border border-neutral-200 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <button onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition disabled:opacity-50">
                  <Save className="h-3.5 w-3.5" /> {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* ── TREATMENTS ── */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">{treatments.length} treatment{treatments.length !== 1 ? 's' : ''} configured</p>
                <button
                  onClick={() => { setTreatmentForm(EMPTY_TREATMENT); setEditingTreatmentId(null); setShowTreatmentForm(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Treatment
                </button>
              </div>

              {showTreatmentForm && (
                <div className="bg-white border-2 border-[#d4a574]/40 rounded-sm p-5 space-y-4 shadow-sm">
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#8b7355]">{editingTreatmentId ? 'Edit Treatment' : 'New Treatment'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Name *</label>
                      <input className={inp} value={treatmentForm.name} onChange={e => setTreatmentForm(f => ({ ...f, name: e.target.value }))} placeholder="Signature Hot Shave" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Status</label>
                      <select className={inp} value={treatmentForm.status} onChange={e => setTreatmentForm(f => ({ ...f, status: e.target.value as 'Active' | 'Inactive' }))}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Price ($) *</label>
                      <input type="number" min="0" className={inp} value={treatmentForm.price} onChange={e => setTreatmentForm(f => ({ ...f, price: e.target.value }))} placeholder="35" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Duration (min) *</label>
                      <input type="number" min="5" className={inp} value={treatmentForm.duration} onChange={e => setTreatmentForm(f => ({ ...f, duration: e.target.value }))} placeholder="45" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Description</label>
                      <input className={inp} value={treatmentForm.description} onChange={e => setTreatmentForm(f => ({ ...f, description: e.target.value }))} placeholder="Shown to customers on the booking page..." />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveTreatment} className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition">
                      <Save className="h-3.5 w-3.5" /> {editingTreatmentId ? 'Update' : 'Create'}
                    </button>
                    <button onClick={() => { setShowTreatmentForm(false); setEditingTreatmentId(null); setTreatmentForm(EMPTY_TREATMENT); }} className="px-4 py-2 border border-neutral-300 text-neutral-500 hover:text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-sm transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {treatmentsLoading ? (
                <div className="text-center py-12">
                  <div className="h-6 w-6 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Loading treatments...</p>
                </div>
              ) : treatments.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-sm p-12 text-center space-y-2">
                  <Scissors className="h-8 w-8 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-400">No treatments yet. Add your first service above.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                        <th className="p-4">Name</th>
                        <th className="p-4 hidden sm:table-cell">Description</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {treatments.map(t => (
                        <tr key={t.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 font-bold text-neutral-900 uppercase tracking-wide">{t.name}</td>
                          <td className="p-4 text-neutral-500 max-w-xs truncate hidden sm:table-cell">{t.description || '—'}</td>
                          <td className="p-4 font-mono font-bold">${t.price}</td>
                          <td className="p-4 text-neutral-600">{t.duration} min</td>
                          <td className="p-4">
                            <span className={cn('px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider',
                              t.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border border-neutral-200',
                            )}>{t.status}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditTreatment(t)} className="p-1.5 text-neutral-400 hover:text-[#d4a574] transition"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDeleteTreatment(t.id)} className="p-1.5 text-neutral-400 hover:text-rose-600 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── HOURS ── */}
          {activeTab === 'hours' && (
            <div className="max-w-lg space-y-4">
              <div className="bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-100">
                  <h3 className="font-black text-sm uppercase tracking-widest text-neutral-900">Operating Hours</h3>
                  <p className="text-[10px] text-neutral-400 mt-1">Displayed on your public shop page.</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {hours.map((h, i) => (
                    <div key={h.day} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-neutral-700">{h.day.slice(0, 3)}</span>
                      <button
                        onClick={() => toggleDay(i)}
                        className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none', h.isOpen ? 'bg-[#1a1a1a]' : 'bg-neutral-200')}
                      >
                        <span className={cn('pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200', h.isOpen ? 'translate-x-4' : 'translate-x-0')} />
                      </button>
                      {h.isOpen ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" className={cn(inp, 'w-28')} value={h.openTime} onChange={e => setDayTime(i, 'openTime', e.target.value)} />
                          <span className="text-xs text-neutral-400">—</span>
                          <input type="time" className={cn(inp, 'w-28')} value={h.closeTime} onChange={e => setDayTime(i, 'closeTime', e.target.value)} />
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic flex-1">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-neutral-100">
                  <button onClick={handleSaveHours} disabled={hoursSaving} className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> {hoursSaving ? 'Saving...' : 'Save Hours'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── LOCATION ── */}
          {activeTab === 'location' && (
            <div className="max-w-2xl space-y-4">
              <div className="bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm p-6 space-y-5">
                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">Parlor Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Street Address</label>
                    <input className={inp} value={location.street} onChange={e => setLocation(l => ({ ...l, street: e.target.value }))} placeholder="142 Amber Avenue" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">City</label>
                    <input className={inp} value={location.city} onChange={e => setLocation(l => ({ ...l, city: e.target.value }))} placeholder="Old Town" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">State / Province</label>
                    <input className={inp} value={location.state} onChange={e => setLocation(l => ({ ...l, state: e.target.value }))} placeholder="NY" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">ZIP / Postal Code</label>
                    <input className={inp} value={location.zip} onChange={e => setLocation(l => ({ ...l, zip: e.target.value }))} placeholder="10001" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Country</label>
                    <input className={inp} value={location.country} onChange={e => setLocation(l => ({ ...l, country: e.target.value }))} placeholder="US" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Latitude</label>
                    <input type="number" step="any" className={inp} value={location.latitude ?? ''} onChange={e => setLocation(l => ({ ...l, latitude: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="40.7128" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Longitude</label>
                    <input type="number" step="any" className={inp} value={location.longitude ?? ''} onChange={e => setLocation(l => ({ ...l, longitude: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="-74.0060" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Google Maps Embed URL</label>
                    <input className={inp} value={location.mapEmbedUrl ?? ''} onChange={e => setLocation(l => ({ ...l, mapEmbedUrl: e.target.value || null }))} placeholder="https://www.google.com/maps/embed?pb=..." />
                  </div>
                </div>

                {/* Map preview */}
                <div className="relative h-40 bg-zinc-100 rounded-sm border border-neutral-200 overflow-hidden">
                  {location.mapEmbedUrl && location.mapEmbedUrl.startsWith('https://www.google.com/maps/embed') ? (
                    <iframe src={location.mapEmbedUrl} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[#f5f0eb]/60 [background-image:linear-gradient(to_right,#e5dec9_1px,transparent_1px),linear-gradient(to_bottom,#e5dec9_1px,transparent_1px)] [background-size:16px_16px]" />
                      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2">
                        <div className="h-7 w-7 rounded-sm bg-[#1a1a1a] text-white flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-[#d4a574]" />
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                          {location.city ? `${location.street}, ${location.city}` : 'Enter address above'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={handleSaveLocation} disabled={locationSaving} className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition disabled:opacity-50">
                  <Save className="h-3.5 w-3.5" /> {locationSaving ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>
          )}

          {/* ── ARTISANS ── */}
          {activeTab === 'artisans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">{artisans.length} artisan{artisans.length !== 1 ? 's' : ''} on roster</p>
                <button
                  onClick={() => { setArtisanForm(EMPTY_ARTISAN); setEditingArtisanId(null); setShowArtisanForm(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Artisan
                </button>
              </div>

              {showArtisanForm && (
                <div className="bg-white border-2 border-[#d4a574]/40 rounded-sm p-5 space-y-4 shadow-sm">
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#8b7355]">{editingArtisanId ? 'Edit Artisan' : 'New Artisan'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Full Name *</label>
                      <input className={inp} value={artisanForm.name} onChange={e => setArtisanForm(f => ({ ...f, name: e.target.value }))} placeholder="Charles Sterling" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Specialty *</label>
                      <input className={inp} value={artisanForm.specialty} onChange={e => setArtisanForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Master Fade & Shave" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Short Bio</label>
                      <input className={inp} value={artisanForm.bio} onChange={e => setArtisanForm(f => ({ ...f, bio: e.target.value }))} placeholder="12 years of precision cutting..." />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-neutral-400 block mb-1">Avatar Image URL</label>
                      <input className={inp} value={artisanForm.avatarUrl} onChange={e => setArtisanForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div className="flex items-end pb-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={artisanForm.isActive} onChange={e => setArtisanForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-[#d4a574]" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Visible on Public Page</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveArtisan} className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-widest rounded-sm transition">
                      <Save className="h-3.5 w-3.5" /> {editingArtisanId ? 'Update' : 'Add'}
                    </button>
                    <button onClick={() => { setShowArtisanForm(false); setEditingArtisanId(null); setArtisanForm(EMPTY_ARTISAN); }} className="px-4 py-2 border border-neutral-300 text-neutral-500 hover:text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-sm transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {artisansLoading ? (
                <div className="text-center py-12">
                  <div className="h-6 w-6 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Loading artisans...</p>
                </div>
              ) : artisans.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-sm p-12 text-center space-y-2">
                  <Users className="h-8 w-8 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-400">No artisans yet. Add your first barber above.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artisans.map(a => (
                    <div key={a.id} className="bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-sm bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {a.avatarUrl
                            /* eslint-disable-next-line @next/next/no-img-element */
                            ? <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
                            : <span className="text-neutral-400 font-bold text-sm">{a.name.slice(0, 2).toUpperCase()}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs uppercase tracking-wide truncate">{a.name}</p>
                          <p className="text-[10px] text-[#8b7355] font-mono mt-0.5 truncate">{a.specialty}</p>
                        </div>
                        <span className={cn('shrink-0 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase',
                          a.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-400',
                        )}>{a.isActive ? 'Active' : 'Off'}</span>
                      </div>
                      {a.bio && <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">{a.bio}</p>}
                      <div className="flex gap-2 pt-1 border-t border-neutral-100">
                        <button onClick={() => handleEditArtisan(a)} className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 hover:border-[#d4a574] text-neutral-500 hover:text-[#d4a574] font-bold text-[10px] uppercase rounded-sm transition">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDeleteArtisan(a.id)} className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 hover:border-rose-400 text-neutral-500 hover:text-rose-600 font-bold text-[10px] uppercase rounded-sm transition">
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length > 0 && (
                <div className="flex gap-8 p-5 bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Total</p>
                    <p className="text-3xl font-black text-neutral-900 mt-0.5">{reviews.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Avg Rating</p>
                    <p className="text-3xl font-black text-[#d4a574] mt-0.5">
                      {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">5-Star</p>
                    <p className="text-3xl font-black text-neutral-900 mt-0.5">{reviews.filter(r => r.rating === 5).length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Featured</p>
                    <p className="text-3xl font-black text-neutral-900 mt-0.5">{reviews.filter(r => r.isFeatured).length}</p>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="text-center py-12">
                  <div className="h-6 w-6 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-sm p-12 text-center space-y-2">
                  <Star className="h-8 w-8 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-400">No reviews yet. They appear once customers submit them.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#1a1a1a]/5 rounded-sm shadow-sm divide-y divide-neutral-100">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-5 flex gap-4 items-start">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <p className="font-black text-sm text-neutral-900">{rev.customerName}</p>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className={cn('h-3 w-3', n <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-200')} />
                            ))}
                          </div>
                          {rev.isFeatured && (
                            <span className="px-2 py-0.5 bg-[#d4a574]/15 text-[#8b7355] text-[9px] font-bold uppercase tracking-wider rounded-sm">Featured</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleFeatured(rev)}
                        className={cn('shrink-0 px-3 py-1.5 border font-bold text-[10px] uppercase tracking-wider rounded-sm transition',
                          rev.isFeatured
                            ? 'border-[#d4a574] text-[#8b7355] hover:border-neutral-300 hover:text-neutral-500'
                            : 'border-neutral-200 text-neutral-400 hover:border-[#d4a574] hover:text-[#8b7355]',
                        )}
                      >
                        {rev.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Block Slot Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#d4a574]/20 rounded-sm max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="bg-[#1a1a1a] text-white p-5">
              <h3 className="font-black text-lg uppercase tracking-tight">Block Schedule Window</h3>
              <p className="text-[10px] text-zinc-400 mt-1 italic">Prevents guests from booking the selected slot.</p>
            </div>
            <form
              onSubmit={e => { e.preventDefault(); showToast(`Slot ${blockedTime} blocked.`); setShowBlockModal(false); }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Timeslot</label>
                <select value={blockedTime} onChange={e => setBlockedTime(e.target.value)} className={inp}>
                  {['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Reason (optional)</label>
                <input type="text" placeholder="Staff meeting, lunch break..." className={inp} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBlockModal(false)} className="px-4 py-2 text-neutral-500 hover:text-black text-xs uppercase font-bold tracking-wider">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] rounded-sm text-xs uppercase font-bold tracking-wider transition">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
