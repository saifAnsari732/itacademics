"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Inbox,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login page, render children without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isAdmin, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading admin environment...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "All Complaints",
      href: "/admin/complaints",
      icon: Inbox,
    },
    {
      name: "Add Complaint",
      href: "/",
      icon: PlusCircle,
      external: true,
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* DESKTOP SIDEBAR - Dark Navy #0B132B as shown in screenshot */}
      <aside className="hidden lg:flex w-64 bg-[#0A1128] text-slate-300 flex-col shrink-0 min-h-screen fixed left-0 top-0 bottom-0 z-40 border-r border-slate-900 shadow-xl">
        {/* Logo / Header */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">IT Academics</h1>
            <span className="text-[10px] text-slate-400 font-medium">Admin Control Panel</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="p-4 flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && !item.external && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.external && <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </div>

        {/* Logout Button at bottom matching screenshot */}
        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 bg-[#0A1128] text-slate-300 flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Admin Panel</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-white border-t border-slate-800 pt-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* TOP HEADER BAR - Matching screenshot exactly */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Welcome Text */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Welcome, IT Academics Admin
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Here&apos;s what&apos;s happening with your complaints
              </p>
            </div>
          </div>

          {/* Right: Notifications & User Profile Chip */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white"></span>
            </div>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs ring-2 ring-slate-100">
                AD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Admin</p>
                <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[150px]">
                  {user.email || "admin@institution.edu"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
