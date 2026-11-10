'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, ShieldCheck, ChevronDown, User, ExternalLink } from 'lucide-react';
import { testBackendConnection } from '@/lib/api';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function AdminHeader() {
  const { user, logout } = useAdminAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [dbInfo, setDbInfo] = useState<{
    connected: boolean;
    label: string;
    latency: number;
  }>({
    connected: true,
    label: 'Connecting...',
    latency: 0,
  });

  useEffect(() => {
    const check = async () => {
      const res = await testBackendConnection();
      if (res.connected) {
        setDbInfo({
          connected: true,
          label: `Atlas Active (${res.latencyMs}ms)`,
          latency: res.latencyMs,
        });
      } else {
        setDbInfo({
          connected: false,
          label: 'Local Protected Cache',
          latency: res.latencyMs,
        });
      }
    };

    check();
    const interval = setInterval(check, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200/90 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-2xs">
      {/* Search Input */}
      <div className="relative w-72 sm:w-96">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search products, orders, customers, or SKUs..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Real-time Backend & Storage Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${
            dbInfo.connected
              ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
              : 'bg-amber-50 border-amber-200/80 text-amber-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              dbInfo.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>API :5000 • {dbInfo.label}</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
          title="Fulfillment and order notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4D00] rounded-full" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:opacity-85 transition-opacity text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-950 to-gray-800 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-gray-700">
              {user?.avatar || 'AD'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-gray-900 leading-none">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5 capitalize">
                {user?.role?.replace('_', ' ') || 'super_admin'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/90 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || 'admin@novatrend.com'}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-[#FF4D00] font-mono text-[9px] font-bold uppercase border border-orange-100">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>{user?.role || 'super_admin'}</span>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Lock Console &amp; Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
