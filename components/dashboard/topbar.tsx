'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { 
  Bell, 
  Menu, 
  User, 
  LogOut, 
  CheckCircle, 
  Calendar,
  AlertCircle,
  Scissors,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentUser, getTenants, Tenant } from '@/lib/storage';

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  const currentUser = getCurrentUser();
  const tenantId = params?.tenant as string;

  useEffect(() => {
    if (tenantId) {
      const tenants = getTenants();
      const match = tenants.find(t => t.id === tenantId);
      setTimeout(() => {
        if (match) setCurrentTenant(match);
      }, 0);
    }
  }, [tenantId]);

  // Generate dynamic breadcrumb segments
  const getBreadcrumbs = () => {
    const parts = pathname?.split('/').filter(Boolean) || [];
    const crumbs = [];

    // Base breadcrumb
    if (pathname?.startsWith('/admin')) {
      crumbs.push({ label: 'Platform Admin', href: '/admin/dashboard' });
      if (parts[1]) {
        crumbs.push({ label: parts[1].charAt(0).toUpperCase() + parts[1].slice(1), href: `/admin/${parts[1]}` });
      }
    } else if (tenantId) {
      const shopLabel = currentTenant ? currentTenant.name : 'Barber Shop';
      crumbs.push({ label: shopLabel, href: `/${tenantId}` });
      
      if (parts[1] === 'customer') {
        crumbs.push({ label: 'Client Center', href: `/${tenantId}/customer/dashboard` });
        if (parts[2]) crumbs.push({ label: parts[2].charAt(0).toUpperCase() + parts[2].slice(1), href: '#' });
      } else if (parts[1] === 'barber') {
        crumbs.push({ label: 'Barber Portal', href: `/${tenantId}/barber/dashboard` });
        if (parts[2]) crumbs.push({ label: parts[2].charAt(0).toUpperCase() + parts[2].slice(1), href: '#' });
      }
    } else {
      crumbs.push({ label: 'Home', href: '/' });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const mockNotifications = [
    { id: 1, text: 'Appointment booked: Pawan Bhayde (Classic Haircut)', time: '5 mins ago', icon: CheckCircle, unread: true },
    { id: 2, text: 'Vince "Razor" Spade blocked out 15:00 - 16:00', time: '1 hr ago', icon: Calendar, unread: true },
    { id: 3, text: 'Reminder: Scheduled system maintenance at 22:00', time: '5 hrs ago', icon: AlertCircle, unread: false },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-white border-b border-[#1a1a1a]/5 px-8 flex items-center justify-between" id="dashboard-topbar">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 rounded-sm md:hidden hover:bg-neutral-50 transition text-neutral-800"
          aria-label="Toggle Mobile Menu"
          id="mobile-menu-toggle"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Breadcrumbs (Geometric balance styling) */}
        <nav className="hidden sm:flex items-center space-x-2 text-xs font-semibold">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-neutral-300 font-normal">/</span>}
              <span className={cn(
                idx === breadcrumbs.length - 1 
                  ? "text-[#1a1a1a] font-serif font-semibold italic text-sm" 
                  : "text-[#1a1a1a]/40 tracking-wider uppercase text-[10px] hover:text-[#d4a574] transition"
              )}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Tenant context badge */}
        {currentTenant && (
          <div className="hidden lg:flex items-center gap-2 bg-[#d4a574]/10 border border-[#d4a574]/20 rounded-sm px-3 py-1.5 text-[10px] text-[#8b7355] font-extrabold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4a574] animate-pulse"></span>
            Tenant: {currentTenant.name}
          </div>
        )}

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-sm hover:bg-neutral-50 transition relative text-neutral-600"
            aria-label="View Notifications"
            id="notifications-bell-btn"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#d4a574]"></span>
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-sm shadow-xl border border-[#1a1a1a]/10 py-2 z-50 animate-fade-in" id="notifications-panel">
              <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-widest text-[#1a1a1a]">Notifications</span>
                <span className="text-[9px] bg-[#d4a574]/15 text-[#8b7355] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider">New Alerts</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "flex gap-3 p-3.5 hover:bg-neutral-50 transition border-b border-neutral-50 last:border-0",
                      notif.unread ? "bg-[#d4a574]/5" : ""
                    )}
                  >
                    <notif.icon className={cn("h-4 w-4 mt-0.5 shrink-0", notif.unread ? "text-[#d4a574]" : "text-neutral-450")} />
                    <div>
                      <p className="text-xs text-neutral-800 leading-normal font-sans">{notif.text}</p>
                      <span className="text-[10px] text-[#1a1a1a]/40 block mt-1 font-mono">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center border-t border-neutral-100">
                <button className="text-[10px] uppercase font-bold tracking-widest text-[#8b7355] hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-100">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-neutral-900 font-sans tracking-tight">{currentUser?.name}</p>
            <span className="text-[9px] text-[#8b7355] uppercase tracking-widest font-mono font-bold block">
              {currentUser?.role === 'customer' ? 'Customer' : currentUser?.role === 'barber' ? 'Barber' : 'Platform Owner'}
            </span>
          </div>
          <div className="h-9 w-9 rounded-sm bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-extrabold ring-1 ring-[#d4a574]/30 shrink-0">
            {currentUser?.name?.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile View Sidebar Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-64 max-w-xs bg-[#1a1a1a] h-full flex flex-col p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-[#d4a574]" />
                <span className="font-serif font-semibold text-lg text-white">TrimTimes</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[#fafaf9] text-xs uppercase tracking-wider hover:text-[#d4a574]">
                Close
              </button>
            </div>

            <div className="text-xs text-amber-500 font-sans tracking-widest uppercase mb-4">Routes Menu</div>
            <div className="space-y-2 flex-1">
              <button onClick={() => { router.push('/'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] transition border-b border-neutral-800/50 block">Home Landing</button>
              
              {tenantId && (
                <>
                  <button onClick={() => { router.push(`/${tenantId}`); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] transition border-b border-neutral-800/50 block">Shop Banner</button>
                  <button onClick={() => { router.push(`/${tenantId}/customer/book`); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-[#d4a574] font-semibold border-b border-neutral-800/50 block">Book Appointment</button>
                  <button onClick={() => { router.push(`/${tenantId}/customer/dashboard`); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] border-b border-neutral-800/50 block">Customer Dashboard</button>
                  <button onClick={() => { router.push(`/${tenantId}/barber/dashboard`); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] border-b border-neutral-800/50 block">Barber Panel</button>
                  <button onClick={() => { router.push(`/${tenantId}/barber/services`); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] border-b border-neutral-800/50 block">Barber Services</button>
                  <button onClick={() => { router.push(`/${tenantId}/barber/appointments`); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] border-b border-neutral-800/50 block">Barber Appointments</button>
                </>
              )}
              <button onClick={() => { router.push('/admin/dashboard'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] border-b border-neutral-800/50 block">Super Admin Dashboard</button>
              <button onClick={() => { router.push('/admin/tenants'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-neutral-300 hover:text-[#d4a574] border-b border-neutral-800/50 block">Tenant Registry</button>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs">
                  {currentUser?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-white font-serif">{currentUser?.name}</p>
                  <p className="text-[10px] text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
