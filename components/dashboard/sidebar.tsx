'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  PlusSquare, 
  Settings, 
  Users, 
  CheckCircle, 
  Layers, 
  LogOut,
  ChevronLeft, 
  ChevronRight,
  Shield,
  User,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const tenant = (params?.tenant as string) || 'grand-classic';
  const user = getCurrentUser();

  // Navigation config based on the path / role
  const isSuperAdmin = pathname?.startsWith('/admin');
  const isBarber = pathname?.includes('/barber');
  const isCustomer = pathname?.includes('/customer');

  let navItems = [
    { label: 'Shop Landing', icon: ShoppingBag, href: `/${tenant}` },
    { label: 'Booking', icon: PlusSquare, href: `/${tenant}/customer/book` },
    { label: 'My Bookings', icon: Calendar, href: `/${tenant}/customer/dashboard` },
  ];

  if (isSuperAdmin) {
    navItems = [
      { label: 'Platform Stats', icon: LayoutDashboard, href: '/admin/dashboard' },
      { label: 'Tenants Directory', icon: Layers, href: '/admin/tenants' },
    ];
  } else if (isBarber) {
    navItems = [
      { label: 'Shop Stats', icon: LayoutDashboard, href: `/${tenant}/barber/dashboard` },
      { label: 'Services Catalogue', icon: Scissors, href: `/${tenant}/barber/services` },
      { label: 'Appointments Book', icon: Calendar, href: `/${tenant}/barber/appointments` },
    ];
  } else if (isCustomer) {
    navItems = [
      { label: 'Shop Landing', icon: ShoppingBag, href: `/${tenant}` },
      { label: 'Book Trim', icon: PlusSquare, href: `/${tenant}/customer/book` },
      { label: 'My Dashboard', icon: LayoutDashboard, href: `/${tenant}/customer/dashboard` },
    ];
  }

  const handleRoleChange = (role: 'customer' | 'barber' | 'admin') => {
    setCurrentUser({
      name: role === 'customer' ? 'Pawan Bhayde' : role === 'barber' ? 'Charles Sterling' : 'Julian Vance',
      email: role === 'customer' ? 'pawanbhayde721@gmail.com' : role === 'barber' ? 'charles@grandclassic.com' : 'julian@trimtimes.com',
      role: role
    });
    setShowRoleSelector(false);
    
    // Redirect cleanly
    if (role === 'customer') {
      router.push(`/${tenant}/customer/dashboard`);
    } else if (role === 'barber') {
      router.push(`/${tenant}/barber/dashboard`);
    } else {
      router.push(`/admin/dashboard`);
    }
  };

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen bg-[#1a1a1a] text-[#fafaf9] border-r border-[#d4a574]/20 transition-all duration-300 relative z-30",
        collapsed ? "w-20" : "w-64"
      )}
      id="main-sidebar"
    >
      {/* Brand & Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-[#d4a574]/10">
        <Link href="/" className="flex items-center gap-3" id="sidebar-logo-link">
          <div className="w-8 h-8 bg-[#d4a574] rounded-sm flex items-center justify-center text-[#1a1a1a]">
            <Scissors className="h-4 w-4 stroke-[2.5]" />
          </div>
          {!collapsed && (
            <span className="font-sans font-extrabold tracking-wider text-white text-base">
              TRIMTIMES
            </span>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-sm bg-[#fafaf9]/5 hover:bg-[#d4a574]/20 text-[#d4a574] transition"
          aria-label="Toggle Sidebar"
          id="sidebar-toggle-btn"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Role State Indicator */}
      {!collapsed && (
        <div className="px-4 py-3 mx-4 my-4 bg-white/5 rounded-sm border border-[#d4a574]/20 text-xs">
          <div className="text-[#d4a574] font-bold flex items-center gap-1.5 uppercase tracking-widest text-[9px]">
            <Shield className="h-3.5 w-3.5 text-[#d4a574]" />
            Active Context
          </div>
          <p className="font-sans font-bold text-white mt-1">
            {isSuperAdmin ? 'SUPER ADMIN SYSTEM' : isBarber ? 'BARBER MANAGEMENT' : 'CUSTOMER ACCOUNT'}
          </p>
          <p className="text-white/40 font-mono text-[9px] mt-0.5 truncate">{user?.email}</p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5" id="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-sm transition duration-200 text-sm group",
                isActive 
                  ? "bg-[#d4a574] text-[#1a1a1a] font-semibold shadow-sm" 
                  : "text-white/60 hover:text-[#d4a574] hover:bg-white/5"
              )}
              id={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className={cn(
                "h-4 w-4 transition shrink-0", 
                isActive ? "text-[#1a1a1a]" : "text-white/40 group-hover:text-[#d4a574]"
              )} />
              {!collapsed && <span className="font-sans tracking-tight text-xs uppercase font-bold">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher Action (Usability Superpower) */}
      <div className="p-4 border-t border-[#d4a574]/15 bg-black/15">
        {showRoleSelector && !collapsed && (
          <div className="mb-3 p-2 bg-[#1a1a1a] rounded-sm border border-[#d4a574]/20 space-y-1 transition duration-200">
            <p className="text-[9px] text-white/40 uppercase tracking-widest px-2 font-bold">Switch Sandbox Role:</p>
            <button 
              onClick={() => handleRoleChange('customer')}
              className={cn("w-full text-left text-xs px-2 py-1.5 rounded-sm hover:bg-white/5", isCustomer ? "text-[#d4a574] font-bold" : "text-white/60")}
            >
              👤 Customer Account
            </button>
            <button 
              onClick={() => handleRoleChange('barber')}
              className={cn("w-full text-left text-xs px-2 py-1.5 rounded-sm hover:bg-white/5", isBarber ? "text-[#d4a574] font-bold" : "text-white/60")}
            >
              💈 Barber Owner
            </button>
            <button 
              onClick={() => handleRoleChange('admin')}
              className={cn("w-full text-left text-xs px-2 py-1.5 rounded-sm hover:bg-white/5", isSuperAdmin ? "text-[#d4a574] font-bold" : "text-white/60")}
            >
              ⚙️ Super Admin
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button 
            onClick={() => !collapsed && setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-3 text-left overflow-hidden w-full p-1.5 rounded-sm hover:bg-white/5 transition"
            id="role-indicator-btn"
          >
            <div className="h-9 w-9 rounded-sm bg-[#d4a574]/15 border border-[#d4a574]/30 flex items-center justify-center text-[#d4a574] shrink-0 font-bold text-xs">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight uppercase tracking-wider">{user?.name}</p>
                <p className="text-[9px] text-white/40 truncate leading-none mt-1">Sandbox Power Menu</p>
              </div>
            )}
          </button>
          {!collapsed && (
            <Link 
              href="/"
              className="text-white/40 hover:text-red-400 transition p-1.5 rounded-sm ml-1"
              title="Return Home"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
