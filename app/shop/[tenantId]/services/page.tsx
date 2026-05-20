'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, X, Clock, Scissors, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import { getServices, saveServices, Service, getTenants, Tenant } from '@/lib/storage';

export default function ShopServicesPage() {
  const params = useParams();
  const tenantId = (params?.tenantId as string) || 'grand-classic';

  const [currentShop, setCurrentShop] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formPrice, setFormPrice] = useState('35');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    const shops = getTenants();
    const current = shops.find(s => s.id === tenantId);
    const shopServices = getServices(tenantId);
    setTimeout(() => {
      if (current) setCurrentShop(current);
      setServices(shopServices);
    }, 0);
  }, [tenantId]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormName(''); setFormDescription(''); setFormDuration('30'); setFormPrice('35'); setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (svc: Service) => {
    setEditingService(svc);
    setFormName(svc.name); setFormDescription(svc.description);
    setFormDuration(svc.duration.toString()); setFormPrice(svc.price.toString()); setFormStatus(svc.status);
    setIsModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    const masterServices = getServices();
    let updatedMaster: Service[];

    if (editingService) {
      updatedMaster = masterServices.map(item =>
        item.id === editingService.id
          ? { ...item, name: formName, description: formDescription, duration: parseInt(formDuration), price: parseFloat(formPrice), status: formStatus }
          : item
      );
      setSuccessToast(`Treatment "${formName}" updated.`);
    } else {
      const newSvc: Service = {
        id: 'svc-' + Math.floor(100 + Math.random() * 900),
        tenantId,
        name: formName,
        description: formDescription,
        duration: parseInt(formDuration),
        price: parseFloat(formPrice),
        status: formStatus,
      };
      updatedMaster = [...masterServices, newSvc];
      setSuccessToast(`Treatment "${formName}" created.`);
    }

    saveServices(updatedMaster);
    setServices(updatedMaster.filter(s => s.tenantId === tenantId));
    setIsModalOpen(false);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleStatus = (svcId: string) => {
    const masterServices = getServices();
    const updatedMaster = masterServices.map(item => {
      if (item.id === svcId) {
        const next = item.status === 'Active' ? 'Inactive' as const : 'Active' as const;
        setSuccessToast(`${item.name} set to ${next}.`);
        return { ...item, status: next };
      }
      return item;
    });
    saveServices(updatedMaster);
    setServices(updatedMaster.filter(s => s.tenantId === tenantId));
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteService = (svcId: string) => {
    const masterServices = getServices();
    const updatedMaster = masterServices.filter(item => item.id !== svcId);
    saveServices(updatedMaster);
    setServices(updatedMaster.filter(s => s.tenantId === tenantId));
    setDeleteConfirmationId(null);
    setSuccessToast('Treatment deleted.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#fafaf9] overflow-hidden font-sans" id="shop-services-page">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />

        {successToast && (
          <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1a1a1a] text-white border-l-4 border-[#d4a574] p-4 rounded shadow-xl animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#d4a574] shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-200">{successToast}</p>
            </div>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="shop-services-content">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-[#8b7355]">Offerings Catalogue</p>
              <h2 className="text-3xl font-serif font-black text-neutral-900 mt-1">💈 Services Management</h2>
              <p className="text-xs text-neutral-500 mt-1">Publish and adjust treatments, prices, times, and scheduling states.</p>
            </div>
            <button onClick={handleOpenAddModal} className="px-4 py-2 bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] transition font-bold rounded text-xs uppercase tracking-widest flex items-center gap-1.5 shadow" id="add-service-btn">
              <Plus className="h-4 w-4" /> Add Treatment
            </button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input type="text" placeholder="Search treatments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#fafaf9] border border-neutral-200 rounded pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium" />
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">Total: <span className="text-[#1a1a1a] font-bold">{filteredServices.length} Published</span></p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            {filteredServices.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Scissors className="h-10 w-10 text-neutral-300 mx-auto" />
                <p className="text-xs text-neutral-400">No services match the filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf9] text-neutral-400 border-b border-neutral-250 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Service Name</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredServices.map((svc) => (
                      <tr key={svc.id} className="hover:bg-[#fafaf9]/40" id={`service-row-${svc.id}`}>
                        <td className="p-4 space-y-1 max-w-sm">
                          <p className="font-serif font-bold text-neutral-900 text-sm uppercase tracking-wide leading-tight">{svc.name}</p>
                          <p className="text-[10px] text-neutral-500 font-normal leading-relaxed truncate">{svc.description}</p>
                        </td>
                        <td className="p-4"><span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded text-[10px]"><Clock className="h-3 w-3 text-[#8b7355]" /> {svc.duration} min</span></td>
                        <td className="p-4 font-mono font-bold text-neutral-900 text-sm">${svc.price}</td>
                        <td className="p-4">
                          <button onClick={() => handleToggleStatus(svc.id)} className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border transition ${svc.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'}`}>
                            {svc.status === 'Active' ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenEditModal(svc)} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black rounded transition"><Edit2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setDeleteConfirmationId(svc.id)} className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded transition"><Trash2 className="h-3.5 w-3.5" /></button>
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

      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="p-6 text-center space-y-4">
              <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 className="h-5 w-5" /></div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-lg text-neutral-900">Purge Treatment?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">This removes the service from the customer booking grid permanently.</p>
              </div>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 font-bold text-xs uppercase border-t border-neutral-100">
              <button onClick={() => setDeleteConfirmationId(null)} className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider">Cancel</button>
              <button onClick={() => handleDeleteService(deleteConfirmationId)} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded uppercase tracking-wider">Yes, Purge</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#8b7355]/30 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a]">
            <div className="bg-[#1a1a1a] text-white p-6 border-b border-[#8b7355]/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">{editingService ? 'Modify Treatment' : 'Publish New Treatment'}</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Affects guest booking options immediately.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Name <span className="text-amber-600">*</span></label>
                <input type="text" required placeholder="e.g. Skin Fade & Bay Rum" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Description <span className="text-amber-600">*</span></label>
                <textarea rows={3} required placeholder="Service description..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-sans" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Duration (Mins)</label>
                  <select value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium">
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="75">75 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Price ($) <span className="text-amber-600">*</span></label>
                  <input type="number" required min="1" placeholder="35" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-mono" />
                </div>
              </div>
              <div className="flex gap-4 pt-1">
                <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer"><input type="radio" name="form-status" value="Active" checked={formStatus === 'Active'} onChange={() => setFormStatus('Active')} className="accent-[#d4a574]" /> Active</label>
                <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer"><input type="radio" name="form-status" value="Inactive" checked={formStatus === 'Inactive'} onChange={() => setFormStatus('Inactive')} className="accent-[#d4a574]" /> Inactive</label>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 font-bold text-xs uppercase">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] uppercase tracking-wider rounded">{editingService ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
