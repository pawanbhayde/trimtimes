'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import {
  getAdminToken,
  listAdminTenants,
  createAdminTenant,
  updateAdminTenantStatus,
  deleteAdminTenant,
  type AdminTenant,
  type TenantStatus,
} from '@/lib/adminApi';

export default function TenantManagementPageOuter() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#8b7355] font-mono">Assembling registry nodes...</p>
        </div>
      </div>
    }>
      <TenantManagementPageContent />
    </Suspense>
  );
}

function TenantManagementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editQueryId = searchParams?.get('edit');

  const filterParam = searchParams?.get('filter');

  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'ALL'>(
    filterParam === 'pending' ? 'PENDING' : 'ALL'
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ shopName: '', subdomain: '', ownerEmail: '' });
  const [creating, setCreating] = useState(false);

  // Edit modal (status only)
  const [editingTenant, setEditingTenant] = useState<AdminTenant | null>(null);
  const [editStatus, setEditStatus] = useState<TenantStatus>('ACTIVE');
  const [updating, setUpdating] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!getAdminToken()) { router.replace('/admin/login'); return; }
    setLoading(true);
    listAdminTenants()
      .then((data) => {
        setTenants(data);
        if (editQueryId) {
          const target = data.find(t => t.id === editQueryId);
          if (target) { setEditingTenant(target); setEditStatus(target.status); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, editQueryId]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createAdminTenant(createForm);
      setTenants(prev => [created, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ shopName: '', subdomain: '', ownerEmail: '' });
      showToast(`Tenant "${created.shopName}" provisioned successfully.`);
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.msg ?? err.response?.data?.message ?? 'Failed to create tenant.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setUpdating(true);
    try {
      const updated = await updateAdminTenantStatus(editingTenant.id, editStatus);
      setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
      setEditingTenant(null);
      if (editQueryId) router.push('/admin/tenants');
      showToast(`${updated.shopName} status updated to ${updated.status}.`);
    } catch {
      showToast('Failed to update tenant status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async (ten: AdminTenant) => {
    try {
      const updated = await updateAdminTenantStatus(ten.id, 'ACTIVE');
      setTenants(prev => prev.map(t => t.id === ten.id ? updated : t));
      showToast(`"${ten.shopName}" approved and is now live.`);
    } catch {
      showToast('Failed to approve shop.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const ten = tenants.find(t => t.id === deleteId);
    try {
      await deleteAdminTenant(deleteId);
      setTenants(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      showToast(`${ten?.shopName ?? 'Tenant'} purged.`);
    } catch {
      showToast('Failed to delete tenant.');
    }
  };

  const pendingCount = tenants.filter(t => t.status === 'PENDING').length;

  const filtered = tenants.filter(t => {
    const matchesSearch =
      t.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.schemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ownerEmail ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="admin-tenants-page">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in">
            <p className="text-xs font-semibold">{successToast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">Database Pools</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">Tenants Directory</h2>
              <p className="text-xs text-neutral-500 mt-1">Provision schemas, adjust operating parameters, and enforce platform restrictions.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] transition font-bold rounded text-xs uppercase tracking-widest flex items-center gap-1.5 shadow"
            >
              <Plus className="h-3.5 w-3.5" /> Initialize Tenant
            </button>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-amber-800 font-semibold">
                <span className="font-black">{pendingCount}</span> shop{pendingCount !== 1 ? 's' : ''} awaiting approval — review and approve below.
              </p>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className="ml-auto text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900 underline"
              >
                Show Only
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, subdomain, or schema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#fafaf9] border border-neutral-200 rounded pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border transition ${
                    statusFilter === s
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center">
                <div className="h-6 w-6 border-2 border-[#d4a574] border-t-transparent rounded-sm animate-spin mx-auto mb-2" />
                <p className="text-xs text-neutral-400">Loading tenants...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Layers className="h-10 w-10 text-neutral-300 mx-auto" />
                <p className="text-xs text-neutral-400">No tenants match your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Shop Name</th>
                      <th className="p-4">Subdomain</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Schema Key</th>
                      <th className="p-4">Created</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filtered.map(ten => (
                      <tr key={ten.id} className="hover:bg-neutral-50/30">
                        <td className="p-4">
                          <Link href={`/${ten.subdomain}`} target="_blank" className="font-serif font-bold text-neutral-950 text-sm hover:text-[#d4a574] uppercase tracking-wide flex items-center gap-1">
                            {ten.shopName} <ExternalLink className="h-3 w-3 text-neutral-400" />
                          </Link>
                        </td>
                        <td className="p-4 text-neutral-500 font-mono">{ten.subdomain}</td>
                        <td className="p-4 space-y-0.5">
                          {ten.ownerName && <p className="text-stone-800 font-bold">{ten.ownerName}</p>}
                          <span className="text-[10px] font-mono text-neutral-400 block">{ten.ownerEmail || '—'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-zinc-600 bg-neutral-100 px-2.5 py-1 rounded text-[10px] font-bold">{ten.schemaName}</span>
                        </td>
                        <td className="p-4 text-neutral-400 text-xs font-mono">
                          {new Date(ten.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                            ten.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ten.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : ten.status === 'SUSPENDED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          }`}>
                            {ten.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ten.status === 'PENDING' && (
                              <button
                                onClick={() => handleApprove(ten)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[9px] font-bold uppercase tracking-wider transition"
                              >
                                <CheckCircle className="h-3 w-3" /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => { setEditingTenant(ten); setEditStatus(ten.status); }}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black rounded transition"
                              title="Edit status"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(ten.id)}
                              className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded transition"
                              title="Purge"
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
        </main>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-md w-full overflow-hidden shadow-2xl text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-6 border-b border-[#8b7355]/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Initialize Tenant Schema</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Provisions a new shop in the database cluster.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Royal Blades Barber Co."
                  value={createForm.shopName}
                  onChange={e => setCreateForm(f => ({ ...f, shopName: e.target.value }))}
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Subdomain Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="royal-blades"
                  value={createForm.subdomain}
                  onChange={e => setCreateForm(f => ({ ...f, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                />
                <span className="text-[9px] text-neutral-400 block mt-1">Lowercase letters, numbers and hyphens only.</span>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Owner Email *</label>
                <input
                  type="email"
                  required
                  placeholder="owner@royalblades.com"
                  value={createForm.ownerEmail}
                  onChange={e => setCreateForm(f => ({ ...f, ownerEmail: e.target.value }))}
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                />
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 font-bold text-xs uppercase">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-neutral-500 hover:text-black tracking-wider">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] tracking-wider rounded disabled:opacity-60">
                  {creating ? 'Provisioning...' : 'Provision Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {editingTenant && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-6 border-b border-[#8b7355]/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Update Tenant Status</h3>
                <p className="text-[10px] text-zinc-400 mt-1 font-mono">{editingTenant.shopName}</p>
              </div>
              <button onClick={() => { setEditingTenant(null); if (editQueryId) router.push('/admin/tenants'); }} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div className="space-y-2">
                {(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'] as TenantStatus[]).map(s => (
                  <label key={s} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 transition">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={editStatus === s}
                      onChange={() => setEditStatus(s)}
                      className="accent-[#d4a574]"
                    />
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wide ${
                        s === 'ACTIVE' ? 'text-emerald-700' : s === 'SUSPENDED' ? 'text-rose-600' : 'text-neutral-500'
                      }`}>{s}</p>
                      <p className="text-[10px] text-neutral-400">
                        {s === 'ACTIVE' ? 'Shop is live and accepting bookings.'
                          : s === 'PENDING' ? 'Awaiting admin approval before going live.'
                          : s === 'INACTIVE' ? 'Shop is disabled but data retained.'
                          : 'Shop is suspended (policy violation).'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 font-bold text-xs uppercase">
                <button type="button" onClick={() => { setEditingTenant(null); if (editQueryId) router.push('/admin/tenants'); }} className="px-4 py-2 text-neutral-500 hover:text-black tracking-wider">Cancel</button>
                <button type="submit" disabled={updating} className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] tracking-wider rounded disabled:opacity-60">
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl text-[#1a1a1a]">
            <div className="p-6 text-center space-y-4">
              <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-lg text-neutral-900">Purge Tenant?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  This will permanently delete <span className="font-bold">{tenants.find(t => t.id === deleteId)?.shopName}</span> and all associated data. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 font-bold text-xs uppercase border-t border-neutral-100">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-neutral-500 hover:text-black tracking-wider">Keep</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded tracking-wider">Yes, Purge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
