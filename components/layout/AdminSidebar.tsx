'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Building2,
  Tag,
  Settings,
  ExternalLink,
  Flame,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Products & Stock', href: '/products', icon: Package },
  { label: 'Orders & Tracking', href: '/orders', icon: ShoppingBag },
  { label: 'Dropship Suppliers', href: '/suppliers', icon: Building2 },
  { label: 'Discounts & Coupons', href: '/coupons', icon: Tag },
  { label: 'System & API Settings', href: '/settings', icon: Settings },
];

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isMobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <>
      {/* Mobile / Tablet Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-[#0B0F19] text-gray-300 flex flex-col shrink-0 border-r border-gray-800/80 min-h-screen select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 sm:px-6 border-b border-gray-800/80 justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF4D00] to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-950/40">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight font-heading">Droppsion</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-[#FF4D00] border border-orange-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[9px] text-gray-500 font-mono tracking-wider">COMMAND CENTER</p>
            </div>
          </Link>

          {/* Close button for Mobile / Tablet */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
            aria-label="Close sidebar navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 sm:py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
            Dropship Operations
          </p>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF4D00] text-white shadow-md shadow-orange-950/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      {/* Authenticated Admin Badge & Quick Sign Out */}
      <div className="p-4 border-t border-gray-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-gray-300">EDI Gateway</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
        </div>

        {/* Live Customer Store Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-xs font-bold text-gray-200 transition-colors border border-gray-700/60"
        >
          <span>Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </a>

        {/* Console Security & Logout Pill */}
        <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[110px]">{user?.name || 'Admin'}</span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
            title="Lock Console and Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
