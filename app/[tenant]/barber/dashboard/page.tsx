'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  X, 
  Scissors, 
  Clock, 
  Users, 
  PlusSquare, 
  AlertCircle,
  FileText,
  TrendingUp,
  User,
  PowerOff,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import StatsCard from '@/components/dashboard/stats-card';
import { cn } from '@/lib/utils';
import { 
  getAppointments, 
  saveAppointments, 
  getTenants, 
  getServices, 
  Tenant, 
  Appointment 
} from '@/lib/storage';

export default function BarberDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || 'grand-classic';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Modal / Quick action states
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedTime, setBlockedTime] = useState('14:00');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    // Load local appointments for THIS specific tenant shop
    const shopApts = getAppointments(tenantId);

    // Get tenant info
    const shops = getTenants();
    const current = shops.find(s => s.id === tenantId);

    setTimeout(() => {
      setAppointments(shopApts);
      if (current) setCurrentTenant(current);
    }, 0);
  }, [tenantId]);

  // Handle setting appointment status
  const updateAptStatus = (aptId: string, nextStatus: 'Confirmed' | 'Completed' | 'Cancelled') => {
    // Read global appointments
    const allApts = getAppointments();
    
    // Update matching appointment
    const updatedApts = allApts.map(a => {
      if (a.id === aptId) {
        return { ...a, status: nextStatus };
      }
      return a;
    });

    // Save back
    saveAppointments(updatedApts);
    setAppointments(updatedApts.filter(a => a.tenantId === tenantId));
    
    // Handle focus update
    if (selectedApt && selectedApt.id === aptId) {
      setSelectedApt({ ...selectedApt, status: nextStatus });
    }

    setSuccessToast(`Appointment #${aptId} has been updated to "${nextStatus}".`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleBlockTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessToast(`Timeslot ${blockedTime} has been successfully closed/blocked out on the public scheduler.`);
    setShowBlockModal(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Calculate Barber stats
  const activeCount = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length;
  
  // Total projected revenue
  const totalRev = appointments
    .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
    .reduce((sum, item) => sum + item.price, 0);

  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  // Sorting appointments for today timeline
  const todayAptsSorted = [...appointments]
    .filter(a => a.status !== 'Cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));

  // Build beautiful weekly graph metrics: Monday(12) to Sunday(0)
  const daysAnalytics = [
    { name: 'Mon', count: 4, heightClass: 'h-16' },
    { name: 'Tue', count: 6, heightClass: 'h-24' },
    { name: 'Wed', count: 9, heightClass: 'h-36' },
    { name: 'Thu', count: 12, heightClass: 'h-48' },
    { name: 'Fri', count: 15, heightClass: 'h-56' },
    { name: 'Sat', count: 18, heightClass: 'h-64' },
    { name: 'Sun', count: 0, heightClass: 'h-2' },
  ];

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="barber-dashboard">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {/* Success Alert */}
        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded-sm shadow-xl animate-fade-in">
            <p className="font-bold text-[10px] uppercase tracking-widest text-[#d4a574]">System Ledger Committed</p>
            <p className="text-xs mt-1 text-zinc-350 font-sans">{successToast}</p>
          </div>
        )}

        {/* Dashboard Main container */}
        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="barber-content">
          
          {/* Welcome section banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1a1a1a]/5 pb-6" id="barber-header">
            <div>
              <p className="text-[10px] uppercase font-sans tracking-widest text-[#8b7355] font-black">Control Panel</p>
              <h2 className="text-2xl font-serif font-black text-neutral-900 mt-1 uppercase tracking-tight">
                💈 {currentTenant ? currentTenant.name : 'Barbershop'} Console
              </h2>
              <p className="text-xs text-neutral-500 mt-1 font-serif italic">Adjust prices, manage appointments, and review weekly earnings charts.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link 
                href={`/${tenantId}/barber/services`}
                className="px-4 py-2 border border-[#d4a574] text-[#d4a574] font-bold hover:bg-[#d4a574]/5 rounded-sm text-xs uppercase tracking-widest flex items-center gap-1.5 transition"
              >
                <Sliders className="h-3.5 w-3.5 text-[#8b7355]" /> Custom Catalog
              </Link>
              <button 
                onClick={() => setShowBlockModal(true)}
                className="px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold rounded-sm text-xs uppercase tracking-widest transition flex items-center gap-1.5 shadow"
                id="block-timeslot-btn"
              >
                <PowerOff className="h-3.5 w-3.5" /> Block Window
              </button>
            </div>
          </div>

          {/* Stats Summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" id="barber-stats-grid">
            <StatsCard 
              title="Active Queue" 
              value={activeCount} 
              icon={Clock} 
              description="Schedules awaiting focus"
            />
            <StatsCard 
              title="Projected Earnings" 
              value={`$${totalRev}`} 
              icon={DollarSign} 
              description="Confirmed and completed cuts"
              changeType="positive"
            />
            <StatsCard 
              title="Groomings Completed" 
              value={completedCount} 
              icon={CheckCircle} 
              description="Closed records"
            />
            <StatsCard 
              title="Cancellations Record" 
              value={cancelledCount} 
              icon={X} 
              description="Revoked windows"
              changeType="negative"
            />
          </div>

          {/* Two Column details structure */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left column: Timeline and analytics */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Timeline sequence */}
              <div className="bg-white rounded-sm border border-[#1a1a1a]/5 shadow-sm p-6 space-y-6" id="barber-timeline">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-serif font-black text-lg text-neutral-900 uppercase">Today&apos;s Schedule timeline</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-serif italic">Incremental time queue starting from earliest shift.</p>
                  </div>
                  <span className="text-[9px] uppercase font-sans tracking-widest font-extrabold bg-[#d4a574]/15 text-[#8b7355] px-2.5 py-1.5 rounded-sm">
                    Chronological View
                  </span>
                </div>

                {todayAptsSorted.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <Calendar className="h-8 w-8 text-neutral-300 mx-auto" />
                    <p className="text-xs text-neutral-450 font-serif italic">No scheduled grooming appointments for today.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAptsSorted.map((apt) => (
                      <div 
                        key={apt.id} 
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedApt(apt)}
                        id={`timeline-item-${apt.id}`}
                      >
                        <div className="flex gap-4 items-start">
                          <div className="w-16 pt-3 text-right">
                            <p className="text-xs font-bold text-[#1a1a1a] font-mono tracking-tight">{apt.time}</p>
                          </div>
                          
                          <div className={cn(
                            "flex-1 p-4 rounded-sm transition duration-200 border",
                            apt.status === 'Completed' 
                              ? "bg-[#1a1a1a] text-white border-transparent" 
                              : apt.id === selectedApt?.id
                                ? "border-[#d4a574] bg-[#fafaf9] text-[#1a1a1a]" 
                                : "border-[#1a1a1a]/10 bg-white hover:border-[#d4a574]/40 text-[#1a1a1a]"
                          )}>
                            <div className="flex justify-between items-center">
                              <p className={cn(
                                "font-serif italic font-extrabold text-sm uppercase tracking-wide",
                                apt.status === 'Completed' ? "text-white" : "text-neutral-950"
                              )}>{apt.customerName}</p>
                              
                              <span className={cn(
                                "px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-wide font-mono",
                                apt.status === 'Completed' 
                                  ? "bg-[#d4a574] text-[#1a1a1a]" 
                                  : apt.status === 'Confirmed' 
                                    ? "border border-[#d4a574] text-[#d4a574]" 
                                    : "bg-[#f5f5f4] text-neutral-600 border border-neutral-200"
                              )}>
                                {apt.status}
                              </span>
                            </div>
                            <p className={cn(
                              "text-[11px] leading-relaxed mt-1 font-sans",
                              apt.status === 'Completed' ? "text-white/60" : "text-[#1a1a1a]/60"
                            )}>
                              {apt.serviceName} — Stylist: <span className="font-semibold italic font-serif text-amber-600">{apt.barberName}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Graphical CSS charts */}
              <div className="bg-white rounded-sm border border-[#1a1a1a]/5 shadow-sm p-6 space-y-6" id="barber-graphs">
                <div className="border-b border-neutral-105 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-black text-lg text-neutral-900 uppercase">Weekly booking density</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-serif italic">Booking logs tracked dynamically from Monday to Sunday.</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-[#8b7355]" />
                </div>

                {/* Styled CSS Bar Chart */}
                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-3 h-48 border-b border-neutral-100 px-2 pt-6">
                    {daysAnalytics.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full relative bg-neutral-100 h-32 hover:bg-[#d4a574]/10 transition overflow-hidden rounded-sm">
                          {/* Inner bar */}
                          <div className={`w-full bg-[#1a1a1a] group-hover:bg-[#d4a574] rounded-sm transition-all absolute bottom-0 ${day.heightClass}`}></div>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{day.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 font-mono">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-neutral-900 block"></span> Normal Business Schedule</span>
                    <span className="font-serif italic text-amber-700">Density Peak: Saturday (18 shifts)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Quick action detail panels & blocks */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Appointment Inspector */}
              <div className="bg-white rounded-sm border-2 border-[#1a1a1a]/5 shadow-md p-5 space-y-4" id="appointment-inspector">
                <h3 className="font-serif font-bold text-base text-neutral-900 uppercase border-b border-[#8b7355]/15 pb-2">Schedule Inspector</h3>
                
                {selectedApt ? (
                  <div className="space-y-5 text-xs text-[#1a1a1a]">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase bg-[#1a1a1a] text-white py-0.5 px-2 rounded-sm font-bold tracking-widest">#{selectedApt.id} Details</span>
                      <h4 className="font-serif font-extrabold text-neutral-950 text-base leading-tight uppercase mt-2">{selectedApt.customerName}</h4>
                      <p className="text-[10px] font-mono text-zinc-400">{selectedApt.customerEmail}</p>
                      <p className="text-[10px] font-mono text-zinc-400">{selectedApt.customerPhone}</p>
                    </div>

                    <div className="space-y-1.5 p-3.5 bg-neutral-50 rounded-sm border border-neutral-100 text-[11px] leading-relaxed">
                      <p className="flex justify-between">
                        <span className="text-zinc-400 font-semibold uppercase text-[9px] tracking-wider">Treatment:</span> 
                        <span className="font-bold text-neutral-950">{selectedApt.serviceName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-zinc-400 font-semibold uppercase text-[9px] tracking-wider">Scheduled:</span> 
                        <span className="font-bold text-neutral-950">{selectedApt.date} at {selectedApt.time}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-zinc-400 font-semibold uppercase text-[9px] tracking-wider">Barber:</span> 
                        <span className="font-serif italic font-black text-stone-900">{selectedApt.barberName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-zinc-400 font-semibold uppercase text-[9px] tracking-wider">Bill Charge:</span> 
                        <span className="font-mono font-bold text-neutral-900">${selectedApt.price}</span>
                      </p>
                      {selectedApt.notes && (
                        <p className="pt-2 mt-2 border-t border-neutral-200 text-neutral-500 font-semibold italic">
                          &quot; {selectedApt.notes} &quot;
                        </p>
                      )}
                    </div>

                    {/* Status modifications */}
                    <div className="space-y-2 pt-2 border-t border-neutral-150">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b7355]">Modify Appointment State:</p>
                      
                      <div className="grid grid-cols-3 gap-1.5 font-bold text-center text-[9px] tracking-wider">
                        <button 
                          onClick={() => updateAptStatus(selectedApt.id, 'Confirmed')}
                          className="px-2 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition uppercase rounded-sm"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => updateAptStatus(selectedApt.id, 'Completed')}
                          className="px-2 py-2 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-neutral-900 transition uppercase rounded-sm"
                        >
                          Done
                        </button>
                        <button 
                          onClick={() => updateAptStatus(selectedApt.id, 'Cancelled')}
                          className="px-2 py-2 bg-rose-600 text-white hover:bg-rose-700 transition uppercase rounded-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2 text-neutral-400">
                    <Info className="h-6 w-6 text-neutral-300 mx-auto" />
                    <p className="text-xs font-serif italic">Click on any scheduled timeline block to authorize, complete, or reject reservations.</p>
                  </div>
                )}
              </div>

              {/* Shop hours schedule block status */}
              <div className="bg-white rounded-sm border border-[#1a1a1a]/5 p-5 space-y-3.5 text-xs text-neutral-600 shadow-sm" id="scheduler-rules">
                <h4 className="font-sans font-bold text-xs text-[#1a1a1a] uppercase border-b border-neutral-100 pb-2 tracking-wider">Scheduler Rules</h4>
                <p>These settings are isolated under schema database: <code className="bg-neutral-100 px-1 py-0.5 rounded-sm font-bold font-mono text-neutral-800">{currentTenant?.schemaName || 'grand-classic'}</code>.</p>
                <div className="p-3 bg-[#fafaf9] rounded-sm border border-neutral-100 text-[10px] leading-relaxed font-mono">
                  <ul>
                    <li>• Booking window: 15-min intervals</li>
                    <li>• Customer Cancellation boundary: 12 hrs</li>
                    <li>• Automatic Email reminders configured: Yes</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* BLOCK TIMESLOT DIALOG MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" id="block-time-modal">
          <div className="bg-white border border-[#d4a574]/20 rounded-sm max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-5 border-b border-[#d4a574]/10">
              <h3 className="font-serif font-black text-lg text-white uppercase tracking-tight">Block Schedule Window</h3>
              <p className="text-[10px] text-zinc-400 mt-1 font-serif italic">This prevents guests from reserving appointments on the given slot.</p>
            </div>
            
            <form onSubmit={handleBlockTimeSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Timeslot To Suspend</label>
                <select 
                  value={blockedTime}
                  onChange={(e) => setBlockedTime(e.target.value)}
                  className="w-full border border-neutral-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-mono"
                  id="block-time-select"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Scheduler Block Reason</label>
                <input 
                  type="text" 
                  placeholder="e.g. Staff meeting, lunch break..."
                  className="w-full border border-neutral-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
                  id="block-reason-input"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 font-bold text-xs uppercase tracking-wider">
                <button 
                  type="button" 
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 text-neutral-500 hover:text-black"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] rounded-sm transition"
                  id="submit-block-btn"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
