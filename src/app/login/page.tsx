"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Shield,
  User,
  Lock,
  Mail,
  Key,
  Phone,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Settings
} from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || "user"; // 'user' | 'admin' | 'register'
  const redirectParam = searchParams.get("redirect");

  const { login, registerUser, user, role, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"user" | "admin" | "register">(modeParam as any);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect role-based
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "admin") {
        router.push(redirectParam || "/admin/dashboard");
      } else {
        router.push(redirectParam || "/user/dashboard");
      }
    }
  }, [user, role, authLoading, redirectParam, router]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Authentication failed. Please verify your credentials.");
        setLoading(false);
        return;
      }

      // Role-based routing
      if (res.role === "admin") {
        router.push(redirectParam || "/admin/dashboard");
      } else {
        if (mode === "admin") {
          setError("Your account does not have administrative privileges.");
          setLoading(false);
          return;
        }
        router.push(redirectParam || "/user/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Sign in failed.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(name, email, password, mobile);
      if (!res.success) {
        setError(res.error || "Registration failed.");
        setLoading(false);
        return;
      }

      router.push("/user/dashboard");
    } catch (err: any) {
      setError(err?.message || "Sign up error.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center mx-auto shadow-lg shadow-slate-900/10 mb-4 border border-slate-800">
            {mode === "admin" ? (
              <Shield className="w-7 h-7 text-[#2563EB]" />
            ) : (
              <GraduationCap className="w-7 h-7 text-[#2563EB]" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            IT Academics Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {mode === "admin"
              ? "Official Administrator Control Access"
              : mode === "register"
              ? "Create Student / Employee Account"
              : "Sign in to track and manage your grievances"}
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="mt-8 bg-slate-200/80 p-1 rounded-xl flex text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("user");
              setError(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              mode === "user" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              mode === "register" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              mode === "admin" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Main Card */}
        <div className="mt-4 bg-white py-8 px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === "register" ? (
            /* REGISTRATION FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Kumar"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@itacademy.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password (min 6 chars)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create User Account</span>}
              </button>
            </form>
          ) : (
            /* SIGN IN FORM (User or Admin) */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {mode === "admin" ? "Admin Email Address" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === "admin" ? "admin@itacademy.com" : "rahul@itacademy.com"}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0A1128] text-white hover:bg-slate-800 shadow-md transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to {mode === "admin" ? "Admin Panel" : "IT Academics"}</span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              ← Back to Portal Home
            </Link>
            <Link href="/track" className="text-blue-600 font-semibold hover:underline">
              Track Complaint ID
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading authentication portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
