"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Search, Lock, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm group-hover:bg-primary-600 transition-colors">
              <ShieldCheck className="w-6 h-6 text-primary-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-navy-950 block leading-tight">
                Grievance & Support
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                Official Complaint Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Register Complaint</span>
            </Link>

            <Link
              href="/track"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track Status</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 mx-2" />

            {user && isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 shadow-sm transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-primary-400" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:text-navy-900 hover:border-slate-400 bg-white transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-navy-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <FileText className="w-5 h-5 text-slate-500" />
            <span>Register Complaint</span>
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>Track Status</span>
          </Link>
          <div className="pt-2">
            {user && isAdmin ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-base font-semibold bg-navy-900 text-white"
              >
                <Lock className="w-4 h-4 text-primary-400" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-base font-medium border border-slate-300 text-slate-700 bg-white"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
