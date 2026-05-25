'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  DollarSign,
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Activity,
  Power,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import StatsCard from '@/components/dashboard/stats-card';
import {
  getAdminToken,
  listAdminTenants,
  updateAdminTenantStatus,
  deleteAdminTenant,
  getAdminStats,
  type AdminTenant,
  type AdminStats,
} from '@/lib/adminApi';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!getAdminToken()) { router.replace('/admin/login'); return; }
    Promise.all([listAdminTenants(), getAdminStats()])
      .then(([t, s]) => { setTenants(t); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleStatus = async (ten: AdminTenant) => {
    const next = ten.status === 'PENDING' || ten.status === 'SUSPENDED' || ten.status === 'INACTIVE'
      ? 'ACTIVE'
      : 'SUSPENDED';
    try {
      const updated = await updateAdminTenantStatus(ten.id, next);
      setTenants(prev => prev.map(t => t.id === ten.id ? updated : t));
      if (stats) setStats({ ...stats, pending: Math.max(0, stats.pending - (ten.status === 'PENDING' ? 1 : 0)) });
      showToast(`${ten.shopName} is now ${next}.`);
    } catch {
      showToast('Failed to update status.');
    }
  };

  const handleDelete = async (ten: AdminTenant) => {
    if (!confirm(`Purge "${ten.shopName}"? This cannot be undone.`)) return;
    try {
      await deleteAdminTenant(ten.id);
      setTenants(prev => prev.filter(t => t.id !== ten.id));
      showToast(`${ten.shopName} has been purged.`);
    } catch {
      showToast('Failed to delete tenant.');
    }
  };

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="superadmin-dashboard">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in">
            <p className="text-xs text-neutral-200">{successToast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">Registry Superintendent</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">Platform Control Deck</h2>
              <p className="text-xs text-neutral-500 mt-1">Audit tenant schemas, monitor aggregate reservation metrics.</p>
            </div>
            <Link
              href="/admin/tenants"
              className="px-4 py-2 bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold rounded text-xs uppercase tracking-widest transition flex items-center gap-1.5 shadow"
            >
              <Plus className="h-3.5 w-3.5" /> Initialize Tenant
            </Link>
          </div>

          {stats && stats.pending > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-amber-800 font-semibold">
                <span className="font-black">{stats.pending}</span> shop{stats.pending !== 1 ? 's' : ''} awaiting approval
              </p>
              <Link href="/admin/tenants?filter=pending" className="ml-auto text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900 underline">
                Review
              </Link>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Global Tenants"    value={stats?.total ?? '—'}                            icon={Layers}      description="Registered shops" />
            <StatsCard title="Active Shops"      value={stats ? `${stats.active} / ${stats.total}` : '—'} icon={Power}       description="Live databases" changeType="positive" />
            <StatsCard title="Total Bookings"    value={stats?.totalAppointments ?? '—'}               icon={CalendarDays} description="Across all salons" />
            <StatsCard title="Platform Revenue"  value={stats ? `$${stats.totalRevenue}` : '—'}        icon={DollarSign}  description="Confirmed + completed" changeType="positive" />
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Tenant table */}
            <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-black text-base text-neutral-900 uppercase">Licensed Tenant Schemas</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Isolated workspaces running within the cluster pool.</p>
                </div>
                <span className="text-[9px] uppercase font-mono tracking-widest bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 py-1 px-3 rounded-full">
                  Postgres Connected
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="h-6 w-6 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Loading tenants...</p>
                </div>
              ) : tenants.length === 0 ? (
                <div className="p-12 text-center">
                  <Layers className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No tenants provisioned yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-4">Shop Name</th>
                        <th className="p-4">Schema Key</th>
                        <th className="p-4">Owner Email</th>
                        <th className="p-4">Created</th>
                        <th className="p-4">State</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {tenants.map(ten => (
                        <tr key={ten.id} className="hover:bg-neutral-50/50">
                          <td className="p-4">
                            <Link href={`/${ten.subdomain}`} target="_blank" className="font-serif font-bold text-neutral-950 text-sm hover:text-[#d4a574] uppercase tracking-wide flex items-center gap-1">
                              {ten.shopName} <ExternalLink className="h-3 w-3 text-neutral-400" />
                            </Link>
                          </td>
                          <td className="p-4 font-mono text-stone-500 font-bold">
                            <span className="bg-neutral-100 px-2.5 py-1 rounded text-[10px]">{ten.schemaName}</span>
                          </td>
                          <td className="p-4 text-neutral-500 font-mono max-w-[140px] truncate">{ten.ownerEmail || '—'}</td>
                          <td className="p-4 text-neutral-400 text-xs font-mono">
                            {new Date(ten.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-4">
                            {ten.status === 'PENDING' ? (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                                ● Pending
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(ten)}
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border transition ${
                                  ten.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                                }`}
                              >
                                {ten.status === 'ACTIVE' ? '● Active' : ten.status === 'SUSPENDED' ? '○ Suspended' : '○ Inactive'}
                              </button>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ten.status === 'PENDING' && (
                                <button
                                  onClick={() => handleToggleStatus(ten)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[9px] font-bold uppercase tracking-wider transition"
                                  title="Approve shop"
                                >
                                  <CheckCircle className="h-3 w-3" /> Approve
                                </button>
                              )}
                              <Link
                                href={`/admin/tenants?edit=${ten.id}`}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black rounded transition"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(ten)}
                                className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded transition"
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
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">

              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-4">
                <div className="border-b border-neutral-100 pb-2 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-[#1a1a1a] uppercase flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-[#8b7355]" /> Tenant Breakdown
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Active', value: stats?.active ?? 0, color: 'bg-emerald-500' },
                    { label: 'Inactive', value: stats?.inactive ?? 0, color: 'bg-neutral-300' },
                    { label: 'Suspended', value: stats?.suspended ?? 0, color: 'bg-rose-400' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.color}`} />
                        <span className="text-neutral-600 font-medium">{item.label}</span>
                      </div>
                      <span className="font-bold font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-amber-500/10 rounded-xl space-y-3 text-xs text-[#8b7355]">
                <h4 className="font-serif font-bold uppercase tracking-widest text-[9.5px] text-amber-950 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Cluster Telemetry
                </h4>
                <p className="leading-snug">Shared PostgreSQL table architecture with tenant_id isolation. New provisions are available immediately after creation.</p>
                <div className="bg-white/50 p-2.5 rounded border border-neutral-200/50 text-[10px] space-y-0.5 font-mono">
                  <p>• Engine: PostgreSQL v16</p>
                  <p>• ORM: Prisma v6</p>
                  <p>• Strategy: Shared tables + tenant_id FK</p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
