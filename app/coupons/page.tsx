'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, Trash2, Power, Edit2, X, Search, Calendar, AlertCircle } from 'lucide-react';
import { AdminCoupon } from '@/types';
import { formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  fetchAdminCoupons,
  createAdminCouponApi,
  updateAdminCouponApi,
  deleteAdminCouponApi,
  toggleCouponActiveApi,
} from '@/lib/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValue, setFormValue] = useState<number>(15);
  const [formMin, setFormMin] = useState<number>(50);
  const [formExpires, setFormExpires] = useState('2026-12-31');
  const [formActive, setFormActive] = useState(true);

  // Delete Confirm State
  const [deletingCoupon, setDeletingCoupon] = useState<AdminCoupon | null>(null);

  const loadCoupons = async () => {
    const res = await fetchAdminCoupons();
    if (res.coupons) {
      setCoupons(res.coupons);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCode(null);
    setFormCode('');
    setFormType('percentage');
    setFormValue(15);
    setFormMin(50);
    setFormExpires('2026-12-31');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: AdminCoupon) => {
    setModalMode('edit');
    setEditingCode(coupon.code);
    setFormCode(coupon.code);
    setFormType(coupon.discountType);
    setFormValue(coupon.discountValue);
    setFormMin(coupon.minPurchaseAmount || 0);
    setFormExpires(coupon.expiresAt || '2026-12-31');
    setFormActive(coupon.active);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;

    const payload: AdminCoupon = {
      code: formCode.trim().toUpperCase(),
      discountType: formType,
      discountValue: Number(formValue),
      minPurchaseAmount: Number(formMin),
      active: formActive,
      usedCount: modalMode === 'edit' ? (coupons.find((c) => c.code === editingCode)?.usedCount || 0) : 0,
      expiresAt: formExpires || undefined,
    };

    if (modalMode === 'create') {
      const res = await createAdminCouponApi(payload);
      setCoupons(res.coupons);
      setToastMessage(`Coupon code "${payload.code}" created and active.`);
    } else {
      const res = await updateAdminCouponApi(editingCode!, payload);
      setCoupons(res.coupons);
      setToastMessage(`Coupon code "${payload.code}" updated successfully.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggle = async (code: string) => {
    const res = await toggleCouponActiveApi(code);
    setCoupons(res.coupons);
    const updated = res.coupons.find((c) => c.code === code);
    setToastMessage(`Coupon "${code}" is now ${updated?.active ? 'ACTIVE' : 'DISABLED'}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const confirmDelete = async () => {
    if (!deletingCoupon) return;
    const res = await deleteAdminCouponApi(deletingCoupon.code);
    setCoupons(res.coupons);
    setToastMessage(`Coupon "${deletingCoupon.code}" permanently deleted.`);
    setDeletingCoupon(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredCoupons = coupons.filter((c) => {
    if (searchQuery.trim()) {
      return c.code.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Discounts &amp; Promotional Codes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete promo provisions: Add, Update, Delete, and Activate/Deactivate discount rules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#FF4D00] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Success Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 uppercase font-bold">COUPON SYNCED</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4D00]"
          />
        </div>

        <span className="text-xs text-gray-400 font-medium">
          Showing <strong>{filteredCoupons.length}</strong> active promo codes
        </span>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-6">Promo Code</th>
                <th className="py-3 px-6">Discount</th>
                <th className="py-3 px-6">Minimum Purchase</th>
                <th className="py-3 px-6">Total Times Used</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Provisions / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    No promotional vouchers found. Click &quot;Create New Coupon&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr
                    key={c.code}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      !c.active ? 'bg-gray-50/40 opacity-70' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-mono font-extrabold text-sm text-gray-950">
                      <span className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-900">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `$${c.discountValue}.00 OFF`}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {c.minPurchaseAmount ? formatPrice(c.minPurchaseAmount) : 'None'}
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-gray-700">
                      {c.usedCount} redemptions
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={c.active ? 'active' : 'expired'} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {/* Toggle Active Provision */}
                        <button
                          onClick={() => handleToggle(c.code)}
                          className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                            c.active
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-black'
                          }`}
                          title="Toggle active status"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{c.active ? 'Active' : 'Disabled'}</span>
                        </button>

                        {/* Edit Provision */}
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 rounded-xl border border-gray-200 hover:border-[#FF4D00] hover:text-[#FF4D00] text-gray-600 bg-white shadow-2xs transition-colors"
                          title="Edit discount details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Provision */}
                        <button
                          onClick={() => setDeletingCoupon(c)}
                          className="p-2 rounded-xl border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-400 bg-white shadow-2xs transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF4D00]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    {modalMode === 'create' ? 'Create Promotional Voucher' : `Edit Coupon: ${editingCode}`}
                  </h3>
                  <p className="text-xs text-gray-400">Configure discount value, min spend, and active status</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH30"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  disabled={modalMode === 'edit'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono font-bold text-sm focus:outline-none focus:border-[#FF4D00] disabled:opacity-60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-[#FF4D00]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    {formType === 'percentage' ? 'Percentage Off (%)' : 'Amount Off ($)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formValue}
                    onChange={(e) => setFormValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min. Order Total ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formMin}
                    onChange={(e) => setFormMin(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={formExpires}
                    onChange={(e) => setFormExpires(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Status</span>
                  <span className="text-[10px] text-gray-400">
                    {formActive ? 'Active and applicable at checkout' : 'Disabled (invalid for users)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    formActive ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {formActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF4D00] hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-950/20"
                >
                  {modalMode === 'create' ? 'Save & Activate Voucher' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-center animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-950">Confirm Promo Deletion</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete coupon code <strong>{deletingCoupon.code}</strong>? Customers will no longer be able to redeem this voucher at checkout.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCoupon(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-950/20"
              >
                Yes, Delete Promo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
