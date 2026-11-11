'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Flame,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Sparkles,
  Server,
  CheckCircle2,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-gray-200 flex flex-col justify-center items-center p-3.5 sm:p-4 relative overflow-hidden select-none">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FF4D00]/15 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FF4D00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF4D00] to-orange-400 text-white shadow-xl shadow-orange-950/50 mb-4 ring-4 ring-[#FF4D00]/20">
            <Flame className="w-7 h-7 fill-current animate-pulse" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-white font-heading">
              Droppsion
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-orange-500/20 text-[#FF4D00] border border-orange-500/30">
              Command Center
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Executive Dropship Control &amp; Fulfillment Security Gateway
          </p>

          {/* Secure Lockdown Notice */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Console Protected &bull; Open Supermarket Mode Disabled</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0E131F]/90 backdrop-blur-xl border border-gray-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
          
          {/* Form Header */}
          <div className="border-b border-gray-800/80 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#FF4D00]" />
              <span>Administrative Sign In</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Enter your privileged credentials to manage products, pricing, and EDI dispatch.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Email or ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@droppsion.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Password
                </label>
                <span className="text-[10px] text-gray-500 font-mono">
                  Default: admin123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-900/90 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-800 text-[#FF4D00] focus:ring-[#FF4D00] focus:ring-offset-0"
                />
                <span>Remember this terminal session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#FF4D00] hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 mt-2 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Privileges...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Open Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Credentials */}
          <div className="pt-3 border-t border-gray-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FF4D00]" />
              <span>Instant Quick-Fill Credentials</span>
            </p>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@droppsion.com', 'admin123')}
                className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800/90 border border-gray-800 hover:border-orange-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] group-hover:text-[#FF4D00]">Super Admin</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="font-mono text-[9px] text-gray-500 truncate mt-0.5">admin@droppsion.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('director@droppsion.com', 'admin123')}
                className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800/90 border border-gray-800 hover:border-orange-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] group-hover:text-[#FF4D00]">Store Director</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="font-mono text-[9px] text-gray-500 truncate mt-0.5">director@droppsion.com</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Info */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 1.3 Encrypted</span>
            </span>
            <span>&bull;</span>
            <span>Zero-Trust Architecture</span>
            <span>&bull;</span>
            <span>ISO 27001 Compliant</span>
          </div>
          <p className="text-[10px] text-gray-600">
            &copy; 2026 Droppsion Operations Inc. Unauthorized access strictly prohibited.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A10] flex items-center justify-center text-white">
          <div className="w-10 h-10 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
