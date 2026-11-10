'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { purgeMockData } from '@/lib/storage';
import { Flame } from 'lucide-react';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // Automatically purge any old mock test data from client cache
    purgeMockData();

    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isLoginPage, pathname, router]);

  // If we are on the login page, render full screen login without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If loading auth state, show a clean, high-tech loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A10] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF4D00] to-orange-400 flex items-center justify-center text-white shadow-xl shadow-orange-950/60 mb-4 animate-bounce">
          <Flame className="w-6 h-6 fill-current" />
        </div>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 font-mono">
          Verifying Console Credentials...
        </p>
      </div>
    );
  }

  // If unauthenticated on a protected page, show redirecting state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070A10] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-gray-400 font-medium">Redirecting to Secure Admin Login...</p>
      </div>
    );
  }

  // Authenticated: Render protected admin layout
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left Dark Sidebar */}
      <AdminSidebar />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

