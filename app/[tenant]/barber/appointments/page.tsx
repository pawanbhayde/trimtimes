'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Eye, 
  Check, 
  X, 
  CheckCircle,
  FileText, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  AlertCircle,
  ChevronDown,
  Scissors
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import { 
  getAppointments, 
  saveAppointments, 
  Appointment, 
  getTenants, 
  Tenant 
} from '@/lib/storage';

type StatusType = 'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export default function BarberAppointmentsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenant as string) || 'grand-classic';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentShop, setCurrentShop] = useState<Tenant | null>(null);

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<StatusType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected Detail Drawer/Sheet state
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    // 1. Load tenant
    const shops = getTenants();
    const current = shops.find(s => s.id === tenantId);

    // 2. Load scheduled list
    const shopApts = getAppointments(tenantId);

    setTimeout(() => {
      if (current) setCurrentShop(current);
      setAppointments(shopApts);
    }, 0);
  }, [tenantId]);

  const handleOpenSheet = (apt: Appointment) => {
    setSelectedApt(apt);
    setNotesDraft(apt.notes || '');
  };

  const handleUpdateStatusAndNotes = (newStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
    if (!selectedApt) return;

    const masterApts = getAppointments();
    const updatedMaster = masterApts.map(item => {
      if (item.id === selectedApt.id) {
        return {
          ...item,
          status: newStatus,
          notes: notesDraft
        };
      }
      return item;
    });

    saveAppointments(updatedMaster);
    
    // Sync current lists
    const updatedShopList = updatedMaster.filter(a => a.tenantId === tenantId);
    setAppointments(updatedShopList);
    
    // Sync matching active selection in drawer
    const nextItemState = updatedShopList.find(a => a.id === selectedApt.id);
    if (nextItemState) setSelectedApt(nextItemState);

    setSuccessToast(`Record #${selectedApt.id} status is now "${newStatus}".`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSaveNotesOnly = () => {
    if (!selectedApt) return;

    const masterApts = getAppointments();
    const updatedMaster = masterApts.map(item => {
      if (item.id === selectedApt.id) {
        return {
          ...item,
          notes: notesDraft
        };
      }
      return item;
    });

    saveAppointments(updatedMaster);
    setAppointments(updatedMaster.filter(a => a.tenantId === tenantId));
    
    setSuccessToast(`Notes committed for client ${selectedApt.customerName}.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Perform filtration pipeline
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      apt.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter ? apt.date === dateFilter : true;
    
    const matchesTab = activeTab === 'All' ? true : apt.status === activeTab;

    return matchesSearch && matchesDate && matchesTab;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed':
        return 'bg-neutral-100 text-neutral-600 border-neutral-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-neutral-50 text-neutral-400';
    }
  };

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="barber-appointments-page">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <Topbar />

        {/* Global Success Banner alerts */}
        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in" id="appointments-success-toast">
            <p className="text-xs text-zinc-300 font-medium">{successToast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="appointments-view-content">
          
          {/* Header segment */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6" id="appointments-header">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">Reservations Log</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">
                💈 Booking Ledger
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Review guest queues, search profiles, and modify timeslot status logs.</p>
            </div>
          </div>

          {/* Tab Filter layout */}
          <div className="space-y-6">
            
            {/* Horizontal Filter Tabs */}
            <div className="flex border-b border-neutral-250 overflow-x-auto pb-px" id="appointments-status-tabs">
              {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as StatusType[]).map((tab) => {
                const count = tab === 'All' ? appointments.length : appointments.filter(a => a.status === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-5 text-xs font-bold uppercase tracking-widest transition border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-[#d4a574] text-neutral-950 font-black' : 'border-transparent text-neutral-400 hover:text-neutral-900'}`}
                    id={`tab-btn-${tab.toLowerCase()}`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* Inputs & Date picker filter */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between" id="filter-controls">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search guests by name or Ref Code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-neutral-200 rounded pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                  id="guest-search"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter className="h-4.5 w-4.5 text-neutral-400 shrink-0 hidden sm:block" />
                <input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#fafaf9] border border-neutral-200 rounded px-3 py-2 text-xs text-neutral-700 font-medium focus:outline-none font-mono w-full sm:w-auto"
                  id="date-filter-picker"
                />
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter('')}
                    className="text-xs text-[#8b7355] hover:underline shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* DATATABLE DATA LOGGER */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm" id="appointments-list-table">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Calendar className="h-10 w-10 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-400">No scheduled appointments match filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-4">Ref Code</th>
                        <th className="p-4">Customer Guest</th>
                        <th className="p-4">Treatment</th>
                        <th className="p-4">Scheduled Window</th>
                        <th className="p-4">Artisan barber</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-neutral-50/50" id={`apt-row-${apt.id}`}>
                          <td className="p-4 font-mono font-bold text-neutral-900">#{apt.id}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-serif font-bold text-neutral-950 text-sm leading-tight uppercase">{apt.customerName}</p>
                              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{apt.customerPhone}</span>
                            </div>
                          </td>
                          <td className="p-4 text-neutral-900">
                            <span className="bg-neutral-100 px-2.5 py-1 rounded text-[10px] font-bold text-neutral-700">
                              {apt.serviceName}
                            </span>
                          </td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-sans font-bold text-neutral-800">{apt.date}</p>
                            <p className="text-[10px] font-mono text-[#d4a574] font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {apt.time} AM/PM
                            </p>
                          </td>
                          <td className="p-4 text-stone-700 font-serif italic">{apt.barberName}</td>
                          <td className="p-4 font-mono font-bold text-[#1a1a1a] text-sm">${apt.price}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(apt.status)}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenSheet(apt)}
                              className="px-3 py-1.5 bg-neutral-950 hover:bg-[#d4a574] text-white hover:text-neutral-950 transition rounded text-[10px] font-bold uppercase tracking-wider"
                              id={`inspect-btn-${apt.id}`}
                            >
                              Inspect Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* DETAILED LEDGER SHEET (SIDE DRAWER DIALOG) */}
      {selectedApt && (
        <div className="fixed inset-0 bg-[#1a1a1a]/85 z-50 flex justify-end backdrop-blur-xs" onClick={() => setSelectedApt(null)} id="details-sheet-drawer">
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-[#1a1a1a] animate-slide-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedApt(null)}
              className="absolute top-6 right-6 p-1 rounded-full bg-neutral-100 text-neutral-500 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase bg-[#d4a574]/15 text-[#8b7355] font-bold py-0.5 px-2.5 rounded-full">
                  Record #{selectedApt.id} Inspector
                </span>
                <h3 className="text-2xl font-serif font-black text-neutral-950 uppercase tracking-tight mt-2">{selectedApt.customerName}</h3>
                <p className="text-xs text-neutral-400 font-mono">Registration timeline: {selectedApt.createdAt}</p>
              </div>

              {/* Status flag */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block font-mono">Current State Indicator</span>
                  <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border mt-1.5 ${getStatusStyle(selectedApt.status)}`}>
                    {selectedApt.status}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Total Due Charge</span>
                  <span className="text-lg font-black text-[#1a1a1a]">${selectedApt.price}</span>
                </div>
              </div>

              {/* Guest Details List */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-1">Client Contacts</h4>
                <div className="space-y-2 text-xs">
                  <p className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                    <span className="font-semibold text-neutral-400 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name:</span>
                    <span className="font-serif font-bold text-neutral-950">{selectedApt.customerName}</span>
                  </p>
                  <p className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                    <span className="font-semibold text-neutral-400 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail:</span>
                    <span className="font-mono text-neutral-950 font-medium">{selectedApt.customerEmail}</span>
                  </p>
                  <p className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                    <span className="font-semibold text-neutral-400 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Mobile:</span>
                    <span className="text-neutral-950 font-serif font-bold">{selectedApt.customerPhone}</span>
                  </p>
                </div>
              </div>

              {/* Treatment parameters */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-1">Session Parameters</h4>
                <div className="space-y-2 text-xs">
                  <p className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Treatment Choose:</span>
                    <span className="font-bold text-neutral-950 font-serif uppercase text-xs">{selectedApt.serviceName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Assigned Stylist:</span>
                    <span className="font-serif italic font-bold text-stone-700">{selectedApt.barberName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Scheduled Date:</span>
                    <span className="font-bold text-neutral-950 font-sans">{selectedApt.date}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Hours Shift:</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedApt.time} AM/PM</span>
                  </p>
                </div>
              </div>

              {/* Directives textareas */}
              <div className="space-y-2.5">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-neutral-800 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-[#8b7355]" /> Guest Directives & Staff Notes
                </h4>
                <textarea 
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Insert custom customer hair attributes, pomade choices, or fade settings here..."
                  className="w-full border border-neutral-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-[#d4a574] focus:outline-none font-medium font-sans"
                  id="notes-draft-area"
                />
                <button 
                  onClick={handleSaveNotesOnly}
                  className="px-3.5 py-1.5 bg-neutral-950 hover:bg-[#d4a574] text-white hover:text-black uppercase tracking-widest font-black rounded text-[9px] transition"
                  id="commit-notes-btn"
                >
                  Commit Notes
                </button>
              </div>
            </div>

            {/* Actions segment */}
            <div className="pt-6 border-t border-neutral-150 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Update ledger Status State:</p>
              
              <div className="grid grid-cols-3 gap-2 font-bold text-center text-xs">
                <button 
                  onClick={() => handleUpdateStatusAndNotes('Confirmed')}
                  className="py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded transition"
                  id="confirm-drawer-btn"
                >
                  Confirm Cut
                </button>
                <button 
                  onClick={() => handleUpdateStatusAndNotes('Completed')}
                  className="py-3 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] rounded transition"
                  id="complete-drawer-btn"
                >
                  Complete List
                </button>
                <button 
                  onClick={() => handleUpdateStatusAndNotes('Cancelled')}
                  className="py-3 bg-rose-600 text-white hover:bg-rose-700 rounded transition"
                  id="cancel-drawer-btn"
                >
                  Revoke
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
