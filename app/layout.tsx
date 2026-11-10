import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminLayoutClient } from '@/components/layout/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Droppsion Command Center | Dropship Admin Panel',
  description: 'Enterprise operations, automated fulfillment, and catalog control panel',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] antialiased">
        <AdminAuthProvider>
          <AdminLayoutClient>{children}</AdminLayoutClient>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
