'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  ShieldCheck,
  Check,
  RefreshCw,
  Globe,
  Database,
  Sparkles,
  User,
  KeyRound,
  Lock,
  LogOut,
  Power,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  triggerDbSeedApi,
  fetchAdminUsersApi,
  createAdminUserApi,
  deleteAdminUserApi,
  toggleAdminUserStatusApi,
} from '@/lib/api';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminUser } from '@/types';

export default function AdminSettingsPage() {
  const { user, updateUser, logout } = useAdminAuth();

  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [autoSyncInterval, setAutoSyncInterval] = useState('60');

  // Admin Profile form
  const [adminName, setAdminName] = useState(user?.name || 'Store Director');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@novatrend.com');
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Staff Management State
  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'super_admin' | 'store_manager' | 'logistics_operator'>('store_manager');
  const [staffMessage, setStaffMessage] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadStaff = async () => {
    const res = await fetchAdminUsersApi();
    if (res.users) {
      setStaffList(res.users);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: adminName,
      email: adminEmail,
    });
    setProfileSuccess('Administrative profile and credentials updated.');
    setNewPassword('');
    setTimeout(() => setProfileSuccess(null), 3500);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newStaff: AdminUser = {
      id: `usr_staff_${Date.now().toString().slice(-4)}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim().toLowerCase(),
      role: newStaffRole,
      avatar: newStaffName.slice(0, 2).toUpperCase(),
      status: 'active',
      lastLogin: new Date().toISOString(),
    };

    const res = await createAdminUserApi(newStaff);
    setStaffList(res.users);
    setIsStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setStaffMessage(`New admin account for ${newStaff.name} created successfully.`);
    setTimeout(() => setStaffMessage(null), 3500);
  };

  const handleToggleStaffStatus = async (id: string) => {
    const res = await toggleAdminUserStatusApi(id);
    setStaffList(res.users);
    const updated = res.users.find((u) => u.id === id);
    setStaffMessage(`Account for ${updated?.name} is now ${updated?.status?.toUpperCase()}.`);
    setTimeout(() => setStaffMessage(null), 3500);
  };

  const confirmDeleteStaff = async () => {
    if (!deletingUser) return;
    const res = await deleteAdminUserApi(deletingUser.id);
    setStaffList(res.users);
    setStaffMessage(`Account for ${deletingUser.name} deleted.`);
    setDeletingUser(null);
    setTimeout(() => setStaffMessage(null), 3500);
  };

  const handleReSeedDatabase = async () => {
    if (
      !confirm(
        'Are you sure you want to re-seed the MongoDB database? This will refresh all products, suppliers, coupons, and reviews.'
      )
    ) {
      return;
    }
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await triggerDbSeedApi();
      if (res.success) {
        setSeedMessage(res.message || 'Database successfully re-seeded with fresh catalog data!');
      } else {
        setSeedMessage(res.message || 'Seeding failed. Verify backend connection.');
      }
    } catch {
      setSeedMessage('Seeding request failed.');
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(null), 6000);
    }
  };

  const testBackendConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch(`${apiUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        setTestStatus({
          ok: true,
          message: `Backend Connected! Status: ${data.status}, Uptime: ${data.uptimeSeconds}s.`,
        });
      } else {
        setTestStatus({
          ok: false,
          message: `Backend returned status ${res.status}. Check Express server.`,
        });
      }
    } catch (err: any) {
      setTestStatus({
        ok: false,
        message: `Failed to reach backend at ${apiUrl}. Verify server is running on port 5000.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
          System &amp; Console Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Admin credential provisions, authentication controls, and microservices gateway parameters.
        </p>
      </div>

      {/* Admin Profile & Credential Management Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF4D00]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Active Admin Profile &amp; Privileges</h3>
              <p className="text-xs text-gray-400">
                Logged in as <strong className="text-gray-700">{user?.role || 'super_admin'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Admin Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-[#FF4D00]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Change Admin Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4D00]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Security Role</label>
              <input
                type="text"
                value="Super Administrator (Full Root Access)"
                disabled
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-[#FF4D00] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              Update Admin Profile
            </button>
          </div>
        </form>
      </div>

      {/* Admin Team & Staff Provisioning Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF4D00]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Administrative Staff &amp; Team Provisions</h3>
              <p className="text-xs text-gray-400">
                Manage roles, grant console access, and toggle active staff credentials
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#FF4D00] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Admin Staff</span>
          </button>
        </div>

        {staffMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{staffMessage}</span>
          </div>
        )}

        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
          {staffList.map((member) => {
            const isActive = member.status !== 'deactivated';

            return (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
                    {member.avatar || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-950">{member.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold capitalize">
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleStaffStatus(member.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-gray-300 text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{isActive ? 'Active' : 'Deactivated'}</span>
                  </button>

                  {member.role !== 'super_admin' && (
                    <button
                      onClick={() => setDeletingUser(member)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Gateway & Open Supermarket Lockdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-950">Security Gate &amp; Access Lockdown</h3>
            <p className="text-xs text-gray-400">Restricts unauthenticated access to the command center</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-emerald-950">
                Supermarket Open Mode: <span className="uppercase text-emerald-700">DISABLED (LOCKED DOWN)</span>
              </p>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1">
              Protected authentication required for all routes (/products, /orders, /coupons, /suppliers).
            </p>
          </div>

          <span className="px-3 py-1 bg-emerald-600 text-white font-mono text-[10px] font-extrabold rounded-lg uppercase">
            SECURED
          </span>
        </div>
      </div>

      {/* API Gateway Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF4D00]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-950">Express Backend API Gateway</h3>
            <p className="text-xs text-gray-400">Microservice powering catalog, fulfillment, and EDI feeds</p>
          </div>
        </div>

        {testStatus && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fadeIn ${
              testStatus.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>{testStatus.message}</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold">
              {testStatus.ok ? 'HEALTHY' : 'UNREACHABLE'}
            </span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5">API Base URL</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#FF4D00]"
              />
              <button
                onClick={testBackendConnection}
                disabled={isTesting}
                className="px-5 py-2.5 bg-black hover:bg-[#FF4D00] text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MongoDB Database Management Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-950">MongoDB Database Administration</h3>
            <p className="text-xs text-gray-400">Re-seed catalog products, supplier scorecards, coupons, and verified reviews</p>
          </div>
        </div>

        {seedMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{seedMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-bold text-gray-900">Restore Factory Catalog</p>
            <p className="text-[11px] text-gray-500">Populate or refresh MongoDB Atlas collections with luxury seed data.</p>
          </div>

          <button
            onClick={handleReSeedDatabase}
            disabled={isSeeding}
            className="px-5 py-2.5 bg-black hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Seeding MongoDB...' : 'Re-Seed Database'}</span>
          </button>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF4D00]" />
                <h3 className="text-sm font-bold text-gray-950">Add Admin Team Member</h3>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Hayes"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#FF4D00]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jordan@novatrend.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-[#FF4D00]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Administrative Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-[#FF4D00]"
                >
                  <option value="store_manager">Store Manager</option>
                  <option value="logistics_operator">Logistics Operator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4D00] hover:bg-orange-600 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE STAFF MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-950">Delete Admin Account</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <strong>{deletingUser.name}</strong> ({deletingUser.email})? This user will no longer be able to log into the console.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
