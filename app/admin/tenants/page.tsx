'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Layers, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  CheckCircle,
  Coins,
  Globe,
  Database
} from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import { getTenants, saveTenants, Tenant } from '@/lib/storage';

export default function TenantManagementPageOuter() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto"></div>
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

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleOpenAddModal = () => {
    setEditingTenant(null);
    setFormName('');
    setFormSlug('');
    setFormOwnerName('');
    setFormOwnerEmail('');
    setFormPhone('(555) 100-2000');
    setFormAddress('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Tenant) => {
    setEditingTenant(t);
    setFormName(t.name);
    setFormSlug(t.id);
    setFormOwnerName(t.ownerName);
    setFormOwnerEmail(t.ownerEmail);
    setFormPhone(t.phone);
    setFormAddress(t.address);
    setFormStatus(t.status);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // 1. Load active lists
    const masterTenants = getTenants();

    // 2. Resolve edit queries
    const target = editQueryId ? masterTenants.find(t => t.id === editQueryId) : null;

    setTimeout(() => {
      setTenants(masterTenants);
      if (target) {
        handleOpenEditModal(target);
      }
    }, 0);
  }, [editQueryId]);

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formOwnerName || !formOwnerEmail) return;

    const master = getTenants();
    let updatedMaster: Tenant[] = [];

    // Calculate database format code
    const resolvedSlug = formSlug.trim().toLowerCase().replace(/\s+/g, '-') || 
                         formName.trim().toLowerCase().replace(/\s+/g, '-');

    if (editingTenant) {
      // EDIT OPERATION
      updatedMaster = master.map(item => {
        if (item.id === editingTenant.id) {
          return {
            ...item,
            name: formName,
            id: resolvedSlug,
            ownerName: formOwnerName,
            ownerEmail: formOwnerEmail,
            phone: formPhone,
            address: formAddress,
            status: formStatus
          };
        }
        return item;
      });
      setSuccessToast(`Properties updated for licensed tenant "${formName}".`);
    } else {
      // ADD OPERATION
      const scName = `tenant_${resolvedSlug.replace(/-/g, '_')}`;
      const newTenantObj: Tenant = {
        id: resolvedSlug,
        name: formName,
        ownerName: formOwnerName,
        ownerEmail: formOwnerEmail,
        schemaName: scName,
        status: formStatus,
        createdDate: new Date().toISOString().split('T')[0],
        rating: 5.0,
        phone: formPhone,
        address: formAddress || '99 Grooming Boulevard Suite 404',
        image: `https://picsum.photos/seed/barber${master.length + 1}/800/600`,
      };

      updatedMaster = [...master, newTenantObj];
      setSuccessToast(`Congratulations! Dynamic SQL schema "${scName}" successfully provisionsed.`);
    }

    // Save and sync state
    saveTenants(updatedMaster);
    setTenants(updatedMaster);
    
    setIsModalOpen(false);
    
    // Clear route query safely
    if (editQueryId) router.push('/admin/tenants');

    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDeleteTenant = (id: string) => {
    const master = getTenants();
    const updated = master.filter(t => t.id !== id);

    saveTenants(updated);
    setTenants(updated);
    
    setDeleteConfirmationId(null);
    setSuccessToast("Schema space pruned.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.schemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="admin-tenants-page">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {/* Action success alert banner */}
        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in" id="tenants-success-alert">
            <p className="text-xs font-semibold">{successToast}</p>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="tenants-view-content">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6" id="tenants-header">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">Databases pools</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">
                ⚙️ Tenants Directory
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Provision schemas, adjust operating parameters, and enforce platform restrictions.</p>
            </div>

            <button 
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] transition font-bold rounded text-xs uppercase tracking-widest flex items-center gap-1.5 shadow"
              id="admin-create-tenant-btn"
            >
              <Plus className="h-4.5 w-4.5" /> Initialize Tenant
            </button>
          </div>

          {/* Filtering panels */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4 justify-between" id="tenants-filters">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search tenant directory by name or schema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#fafaf9] border border-neutral-200 rounded pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                id="search-tenants-input"
              />
            </div>

            <p className="text-[10px] text-neutral-400 font-mono">
              Directories Found: <span className="text-[#1a1a1a] font-bold">{filteredTenants.length} Workspaces</span>
            </p>
          </div>

          {/* MAIN GRID ENVELOPE / TABLE */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm shadow-indigo-50/20" id="tenants-expanded-table">
            {filteredTenants.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Layers className="h-10 w-10 text-neutral-300 mx-auto" />
                <p className="text-xs text-neutral-400">No active schemas match your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Salon Identity</th>
                      <th className="p-4">Subdomain Slug</th>
                      <th className="p-4">Owner Profile</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Table Schema Key</th>
                      <th className="p-4">Database State</th>
                      <th className="p-4 text-right mr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredTenants.map((ten) => (
                      <tr key={ten.id} className="hover:bg-neutral-50/30" id={`tenant-item-row-${ten.id}`}>
                        <td className="p-4 space-y-0.5">
                          <p className="font-serif font-bold text-neutral-950 text-sm uppercase tracking-wide leading-tight">{ten.name}</p>
                          <p className="text-[10px] text-neutral-400 leading-normal max-w-sm truncate">{ten.address}</p>
                        </td>
                        <td className="p-4 text-neutral-500 font-mono text-xs">{ten.id}</td>
                        <td className="p-4 space-y-0.5">
                          <p className="text-stone-800 font-bold leading-normal">{ten.ownerName}</p>
                          <span className="text-[10px] font-mono text-neutral-400 block">{ten.ownerEmail}</span>
                        </td>
                        <td className="p-4 text-neutral-700 font-serif whitespace-nowrap">{ten.phone}</td>
                        <td className="p-4">
                          <span className="font-mono text-zinc-600 bg-neutral-100 px-2.5 py-1 rounded text-[10px] font-bold">
                            {ten.schemaName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${ten.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-250'}`}>
                            {ten.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(ten)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black rounded transition"
                              title="Modify coordinates"
                              id={`edit-tenant-${ten.id}`}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmationId(ten.id)}
                              className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded transition"
                              title="Purge Schema Node"
                              id={`delete-tenant-${ten.id}`}
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

      {/* CONFIRM PURGE DIALOG */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" id="confirm-tenant-delete-modal">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="p-6 text-center space-y-4">
              <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-lg text-neutral-900">Purge Tenant Database?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                  This action is highly destructive. It will wipe all isolated client records, treatment lists, and database indexes. Proceeding?
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 font-bold text-xs uppercase border-t border-neutral-100">
              <button 
                onClick={() => setDeleteConfirmationId(null)}
                className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider"
              >
                No, Keep Space
              </button>
              <button 
                onClick={() => handleDeleteTenant(deleteConfirmationId)}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded uppercase tracking-wider"
                id="do-delete-tenant-btn"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE TENANT PROVISION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md" id="tenant-form-modal">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-6 border-b border-[#8b7355]/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {editingTenant ? 'Edit Tenant Node' : 'Initialize Isolated Tenant Schema'}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1">This instantly generates separate SQL directories secure for booking.</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  if (editQueryId) router.push('/admin/tenants');
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTenant} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Barber Shop Name <span className="text-amber-600">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Amber Lounge Barber"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                  id="form-tenant-name"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Subdomain Identifier Slug</label>
                <input 
                  type="text" 
                  placeholder="e.g. amber-lounge"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  disabled={!!editingTenant}
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono font-bold text-zinc-600 disabled:bg-neutral-100 disabled:text-neutral-400"
                  id="form-tenant-slug"
                />
                {!editingTenant && <span className="text-[9px] text-neutral-400 block mt-1">Generates: tenant_&lt;slug&gt; schema inside the pool.</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Owner Name <span className="text-amber-600">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="Julian Vance"
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                    id="form-tenant-ownername"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Owner E-mail <span className="text-amber-600">*</span></label>
                  <input 
                    type="email" 
                    required
                    placeholder="owner@lounge.co"
                    value={formOwnerEmail}
                    onChange={(e) => setFormOwnerEmail(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono"
                    id="form-tenant-owneremail"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(555) 300-4000"
                    className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574]"
                    id="form-tenant-phone"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Initial DB State</label>
                  <div className="flex gap-4 pt-2">
                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tenant-status"
                        value="Active"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                        className="accent-[#d4a574]"
                      />
                      Active
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tenant-status"
                        value="Inactive"
                        checked={formStatus === 'Inactive'}
                        onChange={() => setFormStatus('Inactive')}
                        className="accent-[#d4a574]"
                      />
                      Suspended
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Address Location</label>
                <input 
                  type="text" 
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. 104 Amber Lane, Western City"
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                  id="form-tenant-address"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 font-bold text-xs uppercase">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    if (editQueryId) router.push('/admin/tenants');
                  }}
                  className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] uppercase tracking-wider rounded"
                  id="save-tenant-btn"
                >
                  {editingTenant ? 'Save Changes' : 'Provision Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
