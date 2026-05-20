'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Layers, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CalendarDays, 
  Plus, 
  Edit2, 
  Trash2,
  CheckCircle,
  FileText,
  Activity,
  User,
  Power,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import StatsCard from '@/components/dashboard/stats-card';
import { 
  getTenants, 
  saveTenants, 
  getAppointments, 
  Tenant, 
  Appointment 
} from '@/lib/storage';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    // Load platform scopes
    const globalTenants = getTenants();
    const globalApts = getAppointments();

    setTimeout(() => {
      setTenants(globalTenants);
      setAppointments(globalApts);
    }, 0);
  }, []);

  const handleToggleTenantStatus = (tenantId: string) => {
    const list = getTenants();
    const updated = list.map(item => {
      if (item.id === tenantId) {
        const nextStatus = item.status === 'Active' ? 'Inactive' as const : 'Active' as const;
        setSuccessToast(`Tenant ${item.name} status is now "${nextStatus}".`);
        return { ...item, status: nextStatus };
      }
      return item;
    });

    saveTenants(updated);
    setTenants(updated);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handlePurgeTenant = (tenantId: string) => {
    const list = getTenants();
    const updated = list.filter(item => item.id !== tenantId);

    saveTenants(updated);
    setTenants(updated);
    setSuccessToast(`Database Schema tenant isolated node has been purged.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Compute platform metrics
  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(t => t.status === 'Active').length;
  const totalAppointmentsCount = appointments.length;
  
  // Total platform projected billings
  const platformEarnings = appointments
    .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
    .reduce((val, curr) => val + curr.price, 0);

  const feeds = [
    { text: 'Schema tenant_grand_classic loaded successfully.', time: '10 mins ago', type: 'system' },
    { text: 'Owner Charles Sterling updated service prices.', time: '1 hr ago', type: 'owner' },
    { text: 'Client Pawan Bhayde booked a Classic Haircut slot.', time: '2 hrs ago', type: 'client' },
    { text: 'Security patch v2.14 committed to database pools.', time: '1 day ago', type: 'system' },
  ];

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="superadmin-dashboard">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {/* Global Toast */}
        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in" id="admin-toast">
            <p className="text-xs text-neutral-200">{successToast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="superadmin-content">
          
          {/* Welcome section banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6" id="superadmin-header">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">Registry Superintendent</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">
                ⚙️ Platform Control Deck
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Audit container structures, manage isolated tenant schemas, and monitor aggregate reservation metrics.</p>
            </div>

            <Link 
              href="/admin/tenants"
              className="px-4 py-2 bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold rounded text-xs uppercase tracking-widest transition flex items-center gap-1.5 shadow"
              id="admin-new-tenant-nav"
            >
              <Plus className="h-4.5 w-4.5" /> Initialize Tenant
            </Link>
          </div>

          {/* Aggregate platform indicators */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" id="admin-stats-grid">
            <StatsCard 
              title="Global Tenants" 
              value={totalTenantsCount} 
              icon={Layers} 
              description="Configured schemas"
            />
            <StatsCard 
              title="Active Databases" 
              value={`${activeTenantsCount} / ${totalTenantsCount}`} 
              icon={Power} 
              description="Connected slots"
              changeType="positive"
            />
            <StatsCard 
              title="Total reservations" 
              value={totalAppointmentsCount} 
              icon={CalendarDays} 
              description="Across all salons"
            />
            <StatsCard 
              title="Platform Gross" 
              value={`$${platformEarnings}`} 
              icon={DollarSign} 
              description="Aggregated client spend"
              changeType="positive"
            />
          </div>

          {/* Two columns: main table + sidebar action feeds */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Main column: Isolation directories */}
            <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm" id="admin-tenants-list">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-black text-base text-neutral-900 uppercase">Licensed Tenant Schemas</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Isolated table workspaces running within the cluster pool.</p>
                </div>
                <span className="text-[9px] uppercase font-mono tracking-widest bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 py-1 px-3 rounded-full">
                  Postgres Pool Connected
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Barber Shop Name</th>
                      <th className="p-4">Schema Key Name</th>
                      <th className="p-4">Owner Email</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Database State</th>
                      <th className="p-4 text-right mr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {tenants.map((ten) => (
                      <tr key={ten.id} className="hover:bg-neutral-50/50" id={`tenant-row-${ten.id}`}>
                        <td className="p-4">
                          <Link href={`/${ten.id}`} className="font-serif font-bold text-neutral-950 text-sm hover:text-[#d4a574] uppercase tracking-wide flex items-center gap-1">
                            {ten.name} <ExternalLink className="h-3 w-3 text-neutral-400" />
                          </Link>
                        </td>
                        <td className="p-4 font-mono text-stone-500 font-bold">
                          <span className="bg-neutral-100 px-2.5 py-1 rounded text-[10px]">
                            {ten.schemaName}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-500 font-mono mt-0.5 max-w-[120px] truncate">{ten.ownerEmail}</td>
                        <td className="p-4 text-neutral-400 text-xs font-mono">{ten.createdDate}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleToggleTenantStatus(ten.id)}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border transition duration-200 ${ten.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100' : 'bg-neutral-100 text-neutral-500 border-neutral-205 hover:bg-neutral-200'}`}
                            id={`status-toggle-${ten.id}`}
                            title="Click to suspend database connection"
                          >
                            {ten.status === 'Active' ? '● Active' : '○ Suspended'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/tenants?edit=${ten.id}`}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black rounded transition"
                              title="Modify Workspace parameters"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handlePurgeTenant(ten.id)}
                              className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded transition"
                              title="Wipe database node"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar column: Activity feeds */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Event logging panels */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-4" id="admin-activity-feeds">
                <div className="border-b border-neutral-105 pb-2 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-[#1a1a1a] uppercase flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-[#8b7355]" /> Cluster Event Stream
                  </h3>
                  <span className="text-[9px] uppercase font-mono bg-blue-50 text-blue-700 border border-blue-100 py-0.5 px-2 rounded-full font-bold animate-pulse">Live</span>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {feeds.map((feed, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed pb-3 border-b border-neutral-50 last:border-0 last:pb-0">
                      <Clock className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-neutral-800 font-medium">{feed.text}</p>
                        <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">{feed.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server attributes summary */}
              <div className="p-4 bg-orange-50 border border-amber-500/10 rounded-xl space-y-3 text-xs text-[#8b7355]">
                <h4 className="font-serif font-bold uppercase tracking-widest text-[9.5px] text-amber-950 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Cluster Telemetry Info
                </h4>
                <p className="leading-snug">The platform database relies on PostgreSQL schema multi-tenant isolation. All new provisions dynamically compile separate schemas to secure guest records.</p>
                <div className="bg-white/50 p-2.5 rounded border border-neutral-200/50 text-[10px] space-y-0.5 font-mono">
                  <p>• Connected Pools: 16/30</p>
                  <p>• Engine Version: v16.4</p>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
