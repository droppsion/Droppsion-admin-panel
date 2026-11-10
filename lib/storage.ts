'use client';

import { AdminProduct, AdminOrder, AdminSupplier, AdminCoupon, AdminUser } from '../types';
import { ADMIN_PRODUCTS, ADMIN_ORDERS, ADMIN_SUPPLIERS, ADMIN_COUPONS } from '../data/adminMockData';

const STORAGE_KEYS = {
  PRODUCTS: 'novatrend_admin_products',
  ORDERS: 'novatrend_admin_orders',
  SUPPLIERS: 'novatrend_admin_suppliers',
  COUPONS: 'novatrend_admin_coupons',
  USERS: 'novatrend_admin_users',
};

const DEFAULT_STAFF: AdminUser[] = [
  {
    id: 'usr_super_01',
    name: 'Super Admin',
    email: 'admin@novatrend.com',
    role: 'super_admin',
    avatar: 'SA',
    status: 'active',
    lastLogin: '2026-11-10T10:00:00Z',
  },
  {
    id: 'usr_director_02',
    name: 'Store Director',
    email: 'director@novatrend.com',
    role: 'store_manager',
    avatar: 'SD',
    status: 'active',
    lastLogin: '2026-11-09T18:30:00Z',
  },
  {
    id: 'usr_ops_03',
    name: 'Logistics Operator',
    email: 'ops@novatrend.com',
    role: 'logistics_operator',
    avatar: 'LO',
    status: 'active',
    lastLogin: '2026-11-08T14:15:00Z',
  },
];

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStored<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// ---------------- PRODUCTS ----------------
export function getLocalProducts(): AdminProduct[] {
  return getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, ADMIN_PRODUCTS);
}

export function saveLocalProduct(product: AdminProduct): AdminProduct[] {
  const current = getLocalProducts();
  const exists = current.some((p) => p.id === product.id);
  const updated = exists
    ? current.map((p) => (p.id === product.id ? product : p))
    : [product, ...current];
  setStored(STORAGE_KEYS.PRODUCTS, updated);
  return updated;
}

export function updateLocalProduct(id: string, updates: Partial<AdminProduct>): AdminProduct[] {
  const current = getLocalProducts();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  setStored(STORAGE_KEYS.PRODUCTS, updated);
  return updated;
}

export function deleteLocalProduct(id: string): AdminProduct[] {
  const current = getLocalProducts();
  const updated = current.filter((p) => p.id !== id);
  setStored(STORAGE_KEYS.PRODUCTS, updated);
  return updated;
}

export function toggleLocalProductActive(id: string): AdminProduct[] {
  const current = getLocalProducts();
  const updated = current.map((p) => {
    if (p.id === id) {
      const nextActive = !p.isActive;
      return {
        ...p,
        isActive: nextActive,
        inStock: nextActive ? p.inStock : false,
      };
    }
    return p;
  });
  setStored(STORAGE_KEYS.PRODUCTS, updated);
  return updated;
}

// ---------------- COUPONS ----------------
export function getLocalCoupons(): AdminCoupon[] {
  return getStored<AdminCoupon[]>(STORAGE_KEYS.COUPONS, ADMIN_COUPONS);
}

export function saveLocalCoupon(coupon: AdminCoupon): AdminCoupon[] {
  const current = getLocalCoupons();
  const exists = current.some((c) => c.code === coupon.code);
  const updated = exists
    ? current.map((c) => (c.code === coupon.code ? coupon : c))
    : [coupon, ...current];
  setStored(STORAGE_KEYS.COUPONS, updated);
  return updated;
}

export function updateLocalCoupon(code: string, updates: Partial<AdminCoupon>): AdminCoupon[] {
  const current = getLocalCoupons();
  const updated = current.map((c) => (c.code === code ? { ...c, ...updates } : c));
  setStored(STORAGE_KEYS.COUPONS, updated);
  return updated;
}

export function deleteLocalCoupon(code: string): AdminCoupon[] {
  const current = getLocalCoupons();
  const updated = current.filter((c) => c.code !== code);
  setStored(STORAGE_KEYS.COUPONS, updated);
  return updated;
}

export function toggleLocalCouponActive(code: string): AdminCoupon[] {
  const current = getLocalCoupons();
  const updated = current.map((c) => (c.code === code ? { ...c, active: !c.active } : c));
  setStored(STORAGE_KEYS.COUPONS, updated);
  return updated;
}

// ---------------- SUPPLIERS ----------------
export function getLocalSuppliers(): AdminSupplier[] {
  return getStored<AdminSupplier[]>(STORAGE_KEYS.SUPPLIERS, ADMIN_SUPPLIERS);
}

export function saveLocalSupplier(supplier: AdminSupplier): AdminSupplier[] {
  const current = getLocalSuppliers();
  const exists = current.some((s) => s.id === supplier.id);
  const updated = exists
    ? current.map((s) => (s.id === supplier.id ? supplier : s))
    : [supplier, ...current];
  setStored(STORAGE_KEYS.SUPPLIERS, updated);
  return updated;
}

export function updateLocalSupplier(id: string, updates: Partial<AdminSupplier>): AdminSupplier[] {
  const current = getLocalSuppliers();
  const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
  setStored(STORAGE_KEYS.SUPPLIERS, updated);
  return updated;
}

export function deleteLocalSupplier(id: string): AdminSupplier[] {
  const current = getLocalSuppliers();
  const updated = current.filter((s) => s.id !== id);
  setStored(STORAGE_KEYS.SUPPLIERS, updated);
  return updated;
}

export function toggleLocalSupplierActive(id: string): AdminSupplier[] {
  const current = getLocalSuppliers();
  const updated: AdminSupplier[] = current.map((s) => {
    if (s.id === id) {
      const nextStatus: AdminSupplier['status'] = s.status === 'connected' ? 'offline' : 'connected';
      return { ...s, status: nextStatus };
    }
    return s;
  });
  setStored(STORAGE_KEYS.SUPPLIERS, updated);
  return updated;
}

// ---------------- ORDERS ----------------
export function getLocalOrders(): AdminOrder[] {
  return getStored<AdminOrder[]>(STORAGE_KEYS.ORDERS, ADMIN_ORDERS);
}

export function updateLocalOrderStatus(id: string, status: AdminOrder['status']): AdminOrder[] {
  const current = getLocalOrders();
  const updated = current.map((o) => (o.id === id ? { ...o, status } : o));
  setStored(STORAGE_KEYS.ORDERS, updated);
  return updated;
}

export function deleteLocalOrder(id: string): AdminOrder[] {
  const current = getLocalOrders();
  const updated = current.filter((o) => o.id !== id);
  setStored(STORAGE_KEYS.ORDERS, updated);
  return updated;
}

// ---------------- ADMIN TEAM & USERS ----------------
export function getLocalAdminUsers(): AdminUser[] {
  return getStored<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_STAFF);
}

export function saveLocalAdminUser(user: AdminUser): AdminUser[] {
  const current = getLocalAdminUsers();
  const exists = current.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  const updated = exists
    ? current.map((u) => (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase() ? user : u))
    : [user, ...current];
  setStored(STORAGE_KEYS.USERS, updated);
  return updated;
}

export function updateLocalAdminUser(id: string, updates: Partial<AdminUser>): AdminUser[] {
  const current = getLocalAdminUsers();
  const updated = current.map((u) => (u.id === id ? { ...u, ...updates } : u));
  setStored(STORAGE_KEYS.USERS, updated);
  return updated;
}

export function deleteLocalAdminUser(id: string): AdminUser[] {
  const current = getLocalAdminUsers();
  const updated = current.filter((u) => u.id !== id);
  setStored(STORAGE_KEYS.USERS, updated);
  return updated;
}

export function toggleLocalAdminUserStatus(id: string): AdminUser[] {
  const current = getLocalAdminUsers();
  const updated: AdminUser[] = current.map((u) => {
    if (u.id === id) {
      const nextStatus: AdminUser['status'] = u.status === 'active' ? 'deactivated' : 'active';
      return { ...u, status: nextStatus };
    }
    return u;
  });
  setStored(STORAGE_KEYS.USERS, updated);
  return updated;
}
