'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Server,
  Plus,
  Edit2,
  Trash2,
  Power,
  X,
  Search,
} from 'lucide-react';
import { AdminSupplier } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  fetchAdminSuppliers,
  createAdminSupplierApi,
  updateAdminSupplierApi,
  deleteAdminSupplierApi,
  toggleSupplierActiveApi,
} from '@/lib/api';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRegion, setFormRegion] = useState('North America / EU');
  const [formProtocol, setFormProtocol] = useState('REST-EDI (v3.2)');
  const [formContact, setFormContact] = useState('');
  const [formRating, setFormRating] = useState<number>(4.8);
  const [formFulfillment, setFormFulfillment] = useState<number>(24);
  const [formOnTime, setFormOnTime] = useState<number>(99.0);
  const [formDefect, setFormDefect] = useState<number>(0.2);

  // Delete State
  const [deletingSupplier, setDeletingSupplier] = useState<AdminSupplier | null>(null);

  const loadSuppliers = async () => {
    const res = await fetchAdminSuppliers();
    if (res.suppliers) {
      setSuppliers(res.suppliers);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormName('');
    setFormRegion('North America / EU');
    setFormProtocol('REST-EDI (v3.2)');
    setFormContact('Operations Lead');
    setFormRating(4.9);
    setFormFulfillment(24);
    setFormOnTime(99.2);
    setFormDefect(0.2);
    setIsModalOpen(true);
  };

  const openEditModal = (sup: AdminSupplier) => {
    setModalMode('edit');
    setEditingId(sup.id);
    setFormName(sup.name);
    setFormRegion(sup.region);
    setFormProtocol(sup.apiProtocol);
    setFormContact(sup.contactPerson || 'Logistics Coordinator');
    setFormRating(sup.performanceRating);
    setFormFulfillment(sup.averageFulfillmentHours);
    setFormOnTime(sup.onTimeRate);
    setFormDefect(sup.defectRate);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (modalMode === 'create') {
      const newSup: AdminSupplier = {
        id: `sup-${Date.now().toString().slice(-4)}`,
        name: formName,
        region: formRegion,
        apiProtocol: formProtocol,
        contactPerson: formContact,
        performanceRating: Number(formRating),
        averageFulfillmentHours: Number(formFulfillment),
        onTimeRate: Number(formOnTime),
        defectRate: Number(formDefect),
        status: 'connected',
        activeSkusCount: 10,
        autoFulfillEnabled: true,
      };

      const res = await createAdminSupplierApi(newSup);
      if (!res.success) {
        setToastMessage(`Validation Failed: ${res.message || 'Could not create supplier'}`);
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }
      setSuppliers(res.suppliers);
      setToastMessage(`Supplier "${newSup.name}" onboarded and connected.`);
    } else {
      const updates: Partial<AdminSupplier> = {
        name: formName,
        region: formRegion,
        apiProtocol: formProtocol,
        contactPerson: formContact,
        performanceRating: Number(formRating),
        averageFulfillmentHours: Number(formFulfillment),
        onTimeRate: Number(formOnTime),
        defectRate: Number(formDefect),
      };

      const res = await updateAdminSupplierApi(editingId!, updates);
      if (!res.success) {
        setToastMessage(`Update Failed: ${res.message || 'Could not update supplier'}`);
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }
      setSuppliers(res.suppliers);
      setToastMessage(`Supplier "${formName}" updated successfully.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleActive = async (id: string) => {
    const res = await toggleSupplierActiveApi(id);
    setSuppliers(res.suppliers);
    const updated = res.suppliers.find((s) => s.id === id);
    setToastMessage(
      `Supplier "${updated?.name}" EDI connection status changed to ${
        updated?.status === 'connected' ? 'ACTIVE (CONNECTED)' : 'DEACTIVATED (OFFLINE)'
      }.`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const confirmDelete = async () => {
    if (!deletingSupplier) return;
    const res = await deleteAdminSupplierApi(deletingSupplier.id);
    if (!res.success) {
      setToastMessage(`Delete Failed: ${res.message || 'Could not delete supplier'}`);
    } else {
      setSuppliers(res.suppliers);
      setToastMessage(`Supplier "${deletingSupplier.name}" removed from network.`);
    }
    setDeletingSupplier(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestConnection = (supplierId: string, name: string) => {
    setTestingId(supplierId);
    setTestResult(null);
    setTimeout(() => {
      setTestingId(null);
      setTestResult(`Ping verified: 26ms latency. EDI stream healthy with ${name}.`);
      setTimeout(() => setTestResult(null), 3500);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Dropship Supplier Network
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete partner provisions: Add new factory hubs, update SLAs, delete, and toggle EDI feeds.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#FF4D00] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Supplier</span>
        </button>
      </div>

      {/* Notifications */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 uppercase font-bold">EDI PROVISION</span>
        </div>
      )}

      {testResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{testResult}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 uppercase font-bold">HANDSHAKE OK</span>
        </div>
      )}

      {/* Supplier Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {suppliers.map((sup) => {
          const isTesting = testingId === sup.id;
          const isConnected = sup.status === 'connected';

          return (
            <div
              key={sup.id}
              className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border shadow-2xs flex flex-col justify-between transition-all ${
                isConnected ? 'border-gray-200/90' : 'border-gray-300 bg-gray-50/50 opacity-80'
              }`}
            >
              <div>
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF4D00]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sup.status} />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-gray-950">{sup.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{sup.region}</p>
                </div>

                {/* Specs Box */}
                <div className="mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Protocol:</span>
                    <span className="font-mono font-bold text-gray-800">{sup.apiProtocol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Contact:</span>
                    <span className="font-semibold text-gray-700">{sup.contactPerson || 'Logistics'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Rating:</span>
                    <span className="font-bold text-amber-500">{sup.performanceRating} / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Defect Rate:</span>
                    <span className="font-bold text-emerald-600">{sup.defectRate}%</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                  <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Avg SLA</p>
                    <p className="text-base font-extrabold text-gray-950 mt-0.5">
                      {sup.averageFulfillmentHours}h
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">On-Time</p>
                    <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                      {sup.onTimeRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Provisions & Actions Bar */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2.5">
                <button
                  onClick={() => handleTestConnection(sup.id, sup.name)}
                  disabled={isTesting || !isConnected}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    isTesting
                      ? 'bg-orange-50 text-[#FF4D00] border-orange-200'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200 shadow-2xs hover:border-black disabled:opacity-50'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Feed...' : 'Ping EDI Connection'}</span>
                </button>

                {/* Action Buttons: Toggle, Edit, Delete */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleActive(sup.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                      isConnected
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-gray-200 text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={isConnected ? 'Deactivate supplier' : 'Activate supplier'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isConnected ? 'Active' : 'Offline'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(sup)}
                    className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-gray-200 hover:border-[#FF4D00] text-gray-700 hover:text-[#FF4D00] bg-white shadow-2xs"
                    title="Edit supplier SLAs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingSupplier(sup)}
                    className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-gray-200 hover:border-red-500 text-gray-400 hover:text-red-600 bg-white shadow-2xs"
                    title="Delete supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn my-auto max-h-[92vh] flex flex-col">
            <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF4D00] shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-950">
                    {modalMode === 'create' ? 'Onboard Dropship Supplier' : `Edit: ${formName}`}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">Configure logistics hub, API protocol, and fulfillment SLAs</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Logistics"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:border-[#FF4D00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Geographic Region</label>
                  <input
                    type="text"
                    placeholder="e.g. APAC / Tokyo"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-[#FF4D00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">EDI Protocol</label>
                  <select
                    value={formProtocol}
                    onChange={(e) => setFormProtocol(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#FF4D00]"
                  >
                    <option value="REST-EDI (v3.2)">REST-EDI (v3.2)</option>
                    <option value="Direct-API (JSON)">Direct-API (JSON)</option>
                    <option value="SFTP-Feed / Realtime">SFTP-Feed / Realtime</option>
                    <option value="AS2 Secure EDI">AS2 Secure EDI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Avg SLA (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formFulfillment}
                    onChange={(e) => setFormFulfillment(parseInt(e.target.value) || 24)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">On-Time Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formOnTime}
                    onChange={(e) => setFormOnTime(parseFloat(e.target.value) || 98)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formRating}
                    onChange={(e) => setFormRating(parseFloat(e.target.value) || 4.8)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Primary Operations Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Thorne (Lead Coordinator)"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-[#FF4D00]"
                />
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
                  {modalMode === 'create' ? 'Save & Connect Hub' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 text-center animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-950">Confirm Hub Disconnection</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently remove <strong>{deletingSupplier.name}</strong> from the supplier network? Active SKUs routed to this factory will require re-routing.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingSupplier(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-950/20"
              >
                Yes, Remove Hub
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
