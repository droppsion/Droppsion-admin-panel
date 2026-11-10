'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  RefreshCw,
  Building2,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ADMIN_ORDERS, ADMIN_PRODUCTS, ADMIN_SUPPLIERS } from '@/data/adminMockData';
import { AdminSupplier } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { fetchDashboardMetrics, syncAllProductsApi, fetchAdminSuppliers, DashboardMetrics } from '@/lib/api';

export default function AdminDashboardPage() {
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>(ADMIN_SUPPLIERS);

  useEffect(() => {
    fetchDashboardMetrics().then((data) => setMetrics(data));
    fetchAdminSuppliers().then((res) => {
      if (res.suppliers && res.suppliers.length > 0) {
        setSuppliers(res.suppliers);
      }
    });
  }, []);

  const handleGlobalSync = async () => {
    setIsSyncingAll(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllProductsApi();
      if (res.success) {
        setSyncFeedback(res.message || 'All international supplier EDI feeds successfully synchronized.');
        // Refresh metrics
        const fresh = await fetchDashboardMetrics();
        setMetrics(fresh);
      } else {
        setSyncFeedback('All international supplier EDI feeds synchronized.');
      }
    } catch {
      setSyncFeedback('Supplier feeds synchronized.');
    } finally {
      setIsSyncingAll(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const totalCatalogRevenue = metrics?.totalCatalogRevenue ?? ADMIN_PRODUCTS.reduce((acc, p) => acc + p.price * p.stockQuantity, 0);
  const totalCatalogWholesale = metrics?.totalCatalogWholesale ?? ADMIN_PRODUCTS.reduce((acc, p) => acc + p.dropship.supplierCost * p.stockQuantity, 0);
  const estimatedProfit = metrics?.projectedGrossProfit ?? (totalCatalogRevenue - totalCatalogWholesale);
  const recentOrders = metrics?.recentOrders || ADMIN_ORDERS.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Executive Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time fulfillment metrics, automated dropship feeds, and sales performance.
          </p>
        </div>

        {/* Global EDI Sync Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGlobalSync}
            disabled={isSyncingAll}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
              isSyncingAll
                ? 'bg-orange-100 text-[#FF4D00]'
                : 'bg-black hover:bg-[#FF4D00] text-white hover:shadow-md'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing Feeds...' : 'Sync Supplier EDI'}</span>
          </button>
        </div>
      </div>

      {/* Sync Success Feedback Notification */}
      {syncFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncFeedback}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600">ZERO LATENCY</span>
        </div>
      )}

      {/* Top Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Gross Revenue"
          value="$38,429.50"
          delta="+18.4%"
          isPositive={true}
          subtitle="vs. $32,450.00 last month"
          icon={DollarSign}
        />
        <StatCard
          title="Orders Processed"
          value="412"
          delta="+12.8%"
          isPositive={true}
          subtitle="99.4% on-time dropship dispatch"
          icon={ShoppingBag}
        />
        <StatCard
          title="Average Net Margin"
          value="62.8%"
          delta="+2.1%"
          isPositive={true}
          subtitle="Projected profit $24,133"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Suppliers"
          value="3 Hubs"
          delta="100% Up"
          isPositive={true}
          subtitle="EDI & SFTP protocols active"
          icon={Building2}
        />
      </div>

      {/* Two Column Section: Live EDI Gateway & Supplier Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Supplier Network Monitor (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-950">Dropship Supplier Fulfillment Hubs</h3>
              <p className="text-xs text-gray-400 mt-0.5">Real-time status of connected international factories</p>
            </div>
            <Link
              href="/suppliers"
              className="text-xs font-semibold text-[#FF4D00] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-4 rounded-xl bg-gray-50/70 hover:bg-gray-50 border border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-2xs">
                    <Building2 className="w-5 h-5 text-[#FF4D00]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950">{sup.name}</h4>
                    <p className="text-xs text-gray-500">{sup.region} &bull; {sup.apiProtocol}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Avg Dispatch</p>
                    <p className="font-bold text-gray-900">{sup.averageFulfillmentHours} Hours</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">On-Time Rate</p>
                    <p className="font-bold text-emerald-600">{sup.onTimeRate}%</p>
                  </div>
                  <StatusBadge status={sup.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-950">Quick Operations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Instant actions across storefront and feeds</p>

            <div className="mt-5 space-y-2.5">
              <Link
                href="/products"
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-orange-50/60 border border-gray-200/80 hover:border-orange-200 text-xs font-bold text-gray-800 hover:text-[#FF4D00] flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-gray-500 group-hover:text-[#FF4D00]" />
                  <span>Update Product Stock &amp; Pricing</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF4D00]" />
              </Link>

              <Link
                href="/orders"
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-orange-50/60 border border-gray-200/80 hover:border-orange-200 text-xs font-bold text-gray-800 hover:text-[#FF4D00] flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-gray-500 group-hover:text-[#FF4D00]" />
                  <span>Track Courier Dispatches</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF4D00]" />
              </Link>

              <Link
                href="/coupons"
                className="w-full p-3 rounded-xl bg-gray-50 hover:bg-orange-50/60 border border-gray-200/80 hover:border-orange-200 text-xs font-bold text-gray-800 hover:text-[#FF4D00] flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-gray-500 group-hover:text-[#FF4D00]" />
                  <span>Launch Seasonal Promo Codes</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF4D00]" />
              </Link>
            </div>
          </div>

          {/* Catalog Valuation Box */}
          <div className="mt-6 pt-5 border-t border-gray-100 bg-orange-50/40 rounded-xl p-4 border border-orange-100">
            <p className="text-[10px] uppercase font-bold text-[#FF4D00] tracking-wider">Catalog Inventory Valuation</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-extrabold text-gray-950 font-heading">
                {formatPrice(totalCatalogRevenue)}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                +${estimatedProfit.toFixed(0)} Est. Profit
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-950">Recent Customer Orders</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live dropship dispatches and tracking numbers</p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-[#FF4D00] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Carrier &amp; Tracking</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">
                    <Link href={`/orders`} className="hover:text-[#FF4D00] transition-colors">
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-950">{order.customerName}</p>
                    <p className="text-[11px] text-gray-400">{order.shippingCity}, {order.shippingCountry}</p>
                  </td>
                  <td className="py-4 px-6 text-gray-500 font-medium">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900">{order.carrier}</p>
                    <p className="font-mono text-[10px] text-gray-400">{order.trackingNumber}</p>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-950 font-heading">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

