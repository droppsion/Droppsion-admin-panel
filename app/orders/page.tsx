'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  X,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { AdminOrder } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { fetchAdminOrders, updateOrderStatusApi, deleteAdminOrderApi } from '@/lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Delete Order State
  const [deletingOrder, setDeletingOrder] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminOrders();
      if (res.orders && res.orders.length > 0) {
        setOrders(res.orders);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCopyTracking = (tracking: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(tracking);
    setCopiedId(tracking);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (orderId: string, newStatus: AdminOrder['status']) => {
    const res = await updateOrderStatusApi(orderId, newStatus);
    if (!res.success) {
      setToastMessage(`Update Failed: ${res.message || 'Could not update status'}`);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setOrders(res.orders);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    setToastMessage(`Order ${orderId} updated to status "${newStatus}".`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const confirmDelete = async () => {
    if (!deletingOrder) return;
    const res = await deleteAdminOrderApi(deletingOrder.id);
    if (!res.success) {
      setToastMessage(`Delete Failed: ${res.message || 'Could not delete order'}`);
    } else {
      setOrders(res.orders);
      setToastMessage(`Order "${deletingOrder.id}" removed from records.`);
      if (selectedOrder?.id === deletingOrder.id) {
        setSelectedOrder(null);
      }
    }
    setDeletingOrder(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.id.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Orders &amp; Courier Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete order provisions: Live status pipeline updates, order details inspection, and courier tracking.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-black bg-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Success Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 uppercase font-bold">PIPELINE SYNCED</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, tracking, or customer..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#FF4D00] flex-1 sm:flex-initial"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
            Showing <strong>{filteredOrders.length}</strong> orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-4">Customer &amp; City</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Carrier &amp; Tracking</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status Pipeline</th>
                <th className="py-3 px-6 text-right">Provisions / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                    No matching fulfillment orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCopied = copiedId === order.trackingNumber;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="py-4 px-6 font-mono font-bold text-gray-900">
                        <span className="text-gray-950 hover:text-[#FF4D00] transition-colors">
                          {order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-950">{order.customerName}</p>
                        <p className="text-[11px] text-gray-400">{order.customerEmail}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {order.shippingCity}, {order.shippingCountry}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-500 font-medium whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Items Count */}
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">{order.carrier}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {order.trackingNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopyTracking(order.trackingNumber, e)}
                            className="text-gray-400 hover:text-black transition-colors"
                            title="Copy tracking number"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 font-extrabold text-gray-950 font-heading">
                        {formatPrice(order.total)}
                      </td>

                      {/* Status Pipeline Select */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as AdminOrder['status'])
                            }
                            className={`appearance-none pl-3 pr-8 py-1 rounded-lg text-xs font-bold border capitalize cursor-pointer focus:outline-none ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.status === 'shipped' || order.status === 'out_for_delivery'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-black'
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-xl border border-gray-200 hover:border-black text-gray-600 bg-white shadow-2xs transition-colors"
                            title="View full order details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="p-2 rounded-xl border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-400 bg-white shadow-2xs transition-colors"
                            title="Delete order record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS INSPECTION MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF4D00] shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 font-mono">
                    Order {selectedOrder.id}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">
                    Placed {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={selectedOrder.status} />
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs overflow-y-auto">
              
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                    <User className="w-3.5 h-3.5 text-[#FF4D00]" />
                    <span>Customer Details</span>
                  </div>
                  <p className="font-semibold text-gray-950">{selectedOrder.customerName}</p>
                  <p className="text-gray-500 font-mono text-[11px]">{selectedOrder.customerEmail}</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4D00]" />
                    <span>Destination</span>
                  </div>
                  <p className="font-semibold text-gray-950">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingCountry}
                  </p>
                  <p className="text-gray-500">{selectedOrder.carrier}</p>
                </div>
              </div>

              {/* Carrier Tracking Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-900">{selectedOrder.carrier}</span>
                  <span className="font-mono text-blue-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
                    {selectedOrder.trackingNumber}
                  </span>
                </div>
                <button
                  onClick={(e) => handleCopyTracking(selectedOrder.trackingNumber, e)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-950 mb-2">Purchased Items Breakdown</h4>
                <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100 bg-white">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{item.title}</p>
                          <p className="text-[10px] font-mono text-gray-400">
                            {item.sku || 'SKU-001'} &bull; Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-gray-950 font-heading">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">Dropship Catalog Items</p>
                        <p className="text-[10px] text-gray-400">Total {selectedOrder.itemsCount} units</p>
                      </div>
                      <span className="font-bold text-gray-950 font-heading">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Total */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Billed</span>
                  <p className="text-lg font-extrabold text-gray-950 font-heading">
                    {formatPrice(selectedOrder.total)}
                  </p>
                </div>

                {/* Status Changer */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value as AdminOrder['status'])
                    }
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF4D00]"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 text-center animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-950">Remove Order Record</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove order <strong>{deletingOrder.id}</strong> ({deletingOrder.customerName})? This will archive the order from live courier tracking.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-950/20"
              >
                Yes, Remove Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
