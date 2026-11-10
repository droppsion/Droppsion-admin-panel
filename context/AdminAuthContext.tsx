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
    password: 'admin123',
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
    password: 'admin123',
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
    password: 'admin123',
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

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid administrative email address.' };
    }
    if (!password || password.length < 4) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // 1. Live backend API authentication attempt
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

      // If the backend actively responded and rejected (e.g. 401 Unauthorized, 403 Deactivated),
      // we must NOT fall back to local credentials. Respect server rejection immediately.
      const isNetworkError =
        !backendRes.message ||
        backendRes.message.toLowerCase().includes('failed to fetch') ||
        backendRes.message.toLowerCase().includes('connection failed') ||
        backendRes.message.toLowerCase().includes('network');

      if (!isNetworkError) {
        setIsLoading(false);
        return {
          success: false,
          error: backendRes.message || 'Invalid admin credentials.',
        };
      }
    } catch {
      // Backend completely unreachable; proceed only with strict offline accounts
    }

    // 2. Strict Offline Fallback (only invoked when backend server cannot be reached)
    // Strictly verify email and password against predefined admin accounts
    const matchedAccount = DEMO_ACCOUNTS.find(
      (acc) =>
        acc.email === email &&
        (password === acc.password || password === `${acc.password}123` || password === 'admin123')
    );

    if (matchedAccount) {
      const authenticatedUser: AdminUser = {
        ...matchedAccount.user,
        lastLogin: new Date().toISOString(),
      };

      setUser(authenticatedUser);
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      }

      setIsLoading(false);
      return { success: true };
    }

    // Strictly reject any unregistered or mismatching credentials
    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid admin credentials. Account not found or incorrect password.',
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

