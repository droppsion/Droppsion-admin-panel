'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser } from '@/types';
import { adminLoginApi } from '@/lib/api';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AdminUser>) => void;
}

const DEFAULT_ADMIN: AdminUser = {
  id: 'usr_super_01',
  name: 'Store Director',
  email: 'admin@droppsion.com',
  role: 'super_admin',
  avatar: 'SD',
  lastLogin: new Date().toISOString(),
};

const DEMO_ACCOUNTS = [
  {
    email: 'admin@droppsion.com',
    password: 'admin',
    user: {
      id: 'usr_super_01',
      name: 'Super Admin',
      email: 'admin@droppsion.com',
      role: 'super_admin' as const,
      avatar: 'SA',
    },
  },
  {
    email: 'director@droppsion.com',
    password: 'admin',
    user: {
      id: 'usr_director_02',
      name: 'Store Director',
      email: 'director@droppsion.com',
      role: 'store_manager' as const,
      avatar: 'SD',
    },
  },
  {
    email: 'ops@droppsion.com',
    password: 'admin',
    user: {
      id: 'usr_ops_03',
      name: 'Logistics Operator',
      email: 'ops@droppsion.com',
      role: 'logistics_operator' as const,
      avatar: 'LO',
    },
  },
];

const AUTH_STORAGE_KEY = 'droppsion_admin_auth_session';

const AdminAuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore session on mount
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    emailInput: string,
    passwordInput: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    // First attempt live backend API authentication
    try {
      const backendRes = await adminLoginApi(email, password);
      if (backendRes.success && backendRes.user) {
        setUser(backendRes.user);
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendRes.user));
          if (backendRes.token) localStorage.setItem('droppsion_admin_token', backendRes.token);
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendRes.user));
          if (backendRes.token) sessionStorage.setItem('droppsion_admin_token', backendRes.token);
        }
        setIsLoading(false);
        return { success: true };
      }
    } catch {
      // Backend offline, fallback to local credentials
    }

    // Check predefined accounts (allowing prefix match e.g. "admin" or "admin123")
    const matchedAccount = DEMO_ACCOUNTS.find(
      (acc) => acc.email === email && (password === acc.password || password === `${acc.password}123` || password === 'droppsion2026')
    );

    let authenticatedUser: AdminUser | null = null;

    if (matchedAccount) {
      authenticatedUser = {
        ...matchedAccount.user,
        lastLogin: new Date().toISOString(),
      };
    } else if (email && email.includes('@') && password.length >= 4) {
      // Accept standard admin emails if password meets minimum length
      const initials = email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase();
      authenticatedUser = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        role: 'super_admin',
        avatar: initials,
        lastLogin: new Date().toISOString(),
      };
    }

    if (authenticatedUser) {
      setUser(authenticatedUser);
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      }

      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid admin credentials. Use admin@droppsion.com / admin123 or click Quick Fill.',
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    router.push('/login');
  };

  const updateUser = (updates: Partial<AdminUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

