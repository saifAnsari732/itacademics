"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/dashboard";

  const { login, user, isAdmin, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initial Admin Provisioning Modal/Tab
  const [showSetup, setShowSetup] = useState(false);
  const [setupEmail, setSetupEmail] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // If already authenticated admin, redirect
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.push(redirect);
    }
  }, [user, isAdmin, authLoading, redirect, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Invalid administrator credentials.");
        setLoading(false);
        return;
      }

      if (result.role !== "admin") {
        setError("Access denied. Your account is authenticated as a standard user, not an authorized administrator.");
        setLoading(false);
        return;
      }

      router.push(redirect);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleAdminProvision = async (e: FormEvent) => {
    e.preventDefault();
    setSetupMessage(null);
    setSetupLoading(true);

    try {
      const res = await fetch("/api/admin/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: setupEmail,
          password: setupPassword,
          secret: setupSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSetupMessage({ type: "error", text: data.error || "Provisioning failed." });
      } else {
        setSetupMessage({
          type: "success",
          text: `Success: ${data.message} You can now log in above with this email.`,
        });
        setEmail(setupEmail);
      }
    } catch {
      setSetupMessage({ type: "error", text: "Network error during setup." });
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-navy-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-4 border border-navy-800">
            <Lock className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Administrator Authentication
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Secure administrative control portal for grievance management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="adminEmail" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="adminEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="adminPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="adminPassword"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-navy-900 hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* First-time setup toggle */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>First-time setup?</span>
            <button
              type="button"
              onClick={() => setShowSetup(!showSetup)}
              className="font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showSetup ? "Hide Provisioning Tool" : "Initialize Admin User"}</span>
            </button>
          </div>
        </div>

        {/* Initial Provisioning Box (Collapsible) */}
        {showSetup && (
          <div className="bg-slate-50 rounded-2xl border border-slate-300 p-6 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Admin Account Provisioning</span>
            </div>
            <p className="text-xs text-slate-600">
              Set up or grant the <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">admin</code> custom claim via Firebase Admin SDK.
            </p>

            {setupMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  setupMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {setupMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{setupMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAdminProvision} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  New Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="Strong password"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Setup Secret Key <span className="text-slate-400 font-normal">(Default: init-admin-secure-2026)</span>
                </label>
                <input
                  type="password"
                  value={setupSecret}
                  onChange={(e) => setSetupSecret(e.target.value)}
                  placeholder="init-admin-secure-2026"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={setupLoading}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {setupLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Provision Admin Account</span>
              </button>
            </form>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-navy-950 font-medium transition-colors"
          >
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading admin portal...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
