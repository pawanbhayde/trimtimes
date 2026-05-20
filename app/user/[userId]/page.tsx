'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  PlusSquare,
  Clock,
  MapPin,
  X,
  AlertCircle,
  FileText,
  DollarSign,
  CheckCircle2,
  CalendarDays,
  History,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import StatsCard from '@/components/dashboard/stats-card';
import {
  getAppointments,
  saveAppointments,
  getCurrentUser,
  getTenants,
  Appointment,
  Tenant,
  setCurrentUser,
} from '@/lib/storage';

type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export default function UserDashboardPage() {
  const params = useParams();

  const [currentUser, setLocalCurrentUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    const apts = getAppointments();
    const shops = getTenants();

    setTimeout(() => {
      setLocalCurrentUser(user);
      setProfileName(user.name);
      setTenants(shops);
      setAppointments(apts.filter(a => a.customerEmail === user.email));
    }, 0);
  }, []);

  const handleCancelAppointment = () => {
    if (!selectedApt) return;
    const masterApts = getAppointments();
    const updatedMaster = masterApts.map(item =>
      item.id === selectedApt.id ? { ...item, status: 'Cancelled' as const } : item
    );
    saveAppointments(updatedMaster);
    setAppointments(updatedMaster.filter(a => a.customerEmail === currentUser.email));
    setSuccessToast(`Appointment ${selectedApt.id} has been cancelled.`);
    setTimeout(() => setSuccessToast(null), 4000);
    setShowCancelModal(false);
    setSelectedApt(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return;
    const updated = { ...currentUser, name: profileName };
    setCurrentUser(updated);
    setLocalCurrentUser(updated);
    setShowProfileModal(false);
    setSuccessToast('Profile updated successfully.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const totalBooked = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const totalSpend = appointments.filter(a => a.status === 'Completed').reduce((sum, a) => sum + a.price, 0);
  const upcomingApts = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed');
  const pastApts = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed': return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
      case 'Pending': return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'Completed': return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">Completed</span>;
      case 'Cancelled': return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="user-dashboard">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-amber-500 p-4 rounded shadow-xl animate-fade-in">
            <p className="font-bold text-xs uppercase tracking-wider text-amber-400">Notification</p>
            <p className="text-xs mt-1 text-zinc-200">{successToast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="user-dashboard-content">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6" id="welcome-header">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">My Dashboard</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">
                Welcome, {currentUser?.name || 'Guest'}!
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Manage your appointments and booking history.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-4 py-2 border border-neutral-300 text-[#1a1a1a] font-bold hover:bg-neutral-100 transition rounded text-xs uppercase tracking-wider"
              >
                Edit Profile
              </button>
              <Link
                href="/#tenants-list"
                className="px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] transition rounded text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow"
              >
                <PlusSquare className="h-4 w-4" /> Book Appointment
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Scheduled" value={totalBooked} icon={FileText} description="Lifetime requests" />
            <StatsCard title="Confirmed Bookings" value={confirmedCount} icon={CheckCircle2} description="Active appointments" changeType="positive" />
            <StatsCard title="Pending Approval" value={pendingCount} icon={Clock} description="Awaiting shop confirmation" changeType="neutral" />
            <StatsCard title="Total Spent" value={`$${totalSpend}`} icon={DollarSign} description="Completed appointments" />
          </div>

          <div className="space-y-6">
            <div className="flex border-b border-neutral-200">
              <button onClick={() => setActiveTab('upcoming')} className={`py-3 px-6 text-xs uppercase tracking-widest font-extrabold transition focus:outline-none flex items-center gap-2 border-b-2 ${activeTab === 'upcoming' ? 'border-[#d4a574] text-neutral-950 bg-white/50' : 'border-transparent text-neutral-400 hover:text-neutral-900'}`}>
                <CalendarDays className="h-4 w-4 text-[#8b7355]" /> Upcoming ({upcomingApts.length})
              </button>
              <button onClick={() => setActiveTab('history')} className={`py-3 px-6 text-xs uppercase tracking-widest font-extrabold transition focus:outline-none flex items-center gap-2 border-b-2 ${activeTab === 'history' ? 'border-[#d4a574] text-neutral-950 bg-white/50' : 'border-transparent text-neutral-400 hover:text-neutral-900'}`}>
                <History className="h-4 w-4 text-[#8b7355]" /> History ({pastApts.length})
              </button>
            </div>

            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingApts.length === 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                    <Calendar className="h-12 w-12 text-[#d4a574]/40 mx-auto" />
                    <h3 className="font-serif font-bold text-lg text-neutral-900">No Upcoming Appointments</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">You have no active appointments. Browse our shops and book a slot now.</p>
                    <Link href="/#tenants-list" className="px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold rounded text-xs uppercase tracking-wider transition inline-block">Browse Shops</Link>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {upcomingApts.map((apt) => {
                      const shop = tenants.find(t => t.id === apt.tenantId);
                      return (
                        <div key={apt.id} className="bg-white border-2 border-neutral-200 hover:border-[#d4a574]/40 rounded-xl p-6 transition duration-300 relative overflow-hidden flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-neutral-400">#{apt.id}</span>
                                <h4 className="font-serif font-bold text-base text-[#1a1a1a] mt-0.5 uppercase tracking-wide">{shop ? shop.name : 'Barbershop'}</h4>
                              </div>
                              {getStatusBadge(apt.status)}
                            </div>
                            <div className="space-y-2.5 text-xs">
                              <p className="flex justify-between"><span className="font-semibold text-neutral-400">Service:</span><span className="font-bold text-neutral-900">{apt.serviceName}</span></p>
                              <p className="flex justify-between"><span className="font-semibold text-neutral-400">Barber:</span><span className="font-serif font-bold text-stone-800">{apt.barberName}</span></p>
                              <p className="flex justify-between"><span className="font-semibold text-neutral-400">Date & Time:</span><span className="font-bold text-neutral-900">{apt.date} at {apt.time}</span></p>
                              <p className="flex justify-between"><span className="font-semibold text-neutral-400">Charge:</span><span className="font-mono text-neutral-900 font-bold">${apt.price}</span></p>
                            </div>
                          </div>

                          <div className="pt-4 mt-6 border-t border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full">
                              <MapPin className="h-3 w-3 text-[#d4a574]" />
                              {shop?.address || 'Old Town Office'}
                            </div>
                            <button onClick={() => { setSelectedApt(apt); setShowCancelModal(true); }} className="text-xs text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider">
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                {pastApts.length === 0 ? (
                  <div className="p-12 text-center max-w-md mx-auto space-y-4">
                    <History className="h-10 w-10 text-neutral-300 mx-auto" />
                    <h4 className="font-serif font-bold text-base text-neutral-900">No History Yet</h4>
                    <p className="text-xs text-neutral-400">Completed and cancelled appointments will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                          <th className="p-4">Ref</th>
                          <th className="p-4">Shop</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Barber</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Bill</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {pastApts.map((hist) => {
                          const shop = tenants.find(t => t.id === hist.tenantId);
                          return (
                            <tr key={hist.id} className="hover:bg-neutral-50/50">
                              <td className="p-4 font-mono font-bold text-neutral-900">#{hist.id}</td>
                              <td className="p-4 font-serif font-bold text-neutral-950 uppercase">{shop ? shop.name : hist.tenantId}</td>
                              <td className="p-4 text-neutral-900">{hist.serviceName}</td>
                              <td className="p-4 text-stone-700">{hist.barberName}</td>
                              <td className="p-4 font-sans text-neutral-800">{hist.date} at {hist.time}</td>
                              <td className="p-4 font-mono text-neutral-900 font-bold">${hist.price}</td>
                              <td className="p-4">{getStatusBadge(hist.status)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showCancelModal && selectedApt && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-lg text-neutral-900">Cancel Appointment?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                  Cancel your appointment on <span className="font-bold text-neutral-950">{selectedApt.date} at {selectedApt.time}</span> with <span className="font-bold text-neutral-950">{selectedApt.barberName}</span>?
                </p>
              </div>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 font-bold text-xs uppercase border-t border-neutral-100">
              <button onClick={() => { setShowCancelModal(false); setSelectedApt(null); }} className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider">Keep It</button>
              <button onClick={handleCancelAppointment} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded uppercase tracking-wider">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-5 border-b border-[#8b7355]/20">
              <h3 className="font-serif font-bold text-lg text-white">Edit Profile</h3>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Full Name</label>
                <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574]" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Email</label>
                <input type="email" disabled value={currentUser?.email || ''} className="w-full border border-neutral-200 bg-neutral-100 rounded p-2 text-xs text-neutral-400 focus:outline-none font-mono" />
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 font-bold text-xs">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-neutral-900 uppercase tracking-wider rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
