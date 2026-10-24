"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  PlusCircle,
  Info,
  LogOut,
  ChevronRight,
  User,
  GraduationCap,
  LayoutDashboard,
  Search,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintSummaryStats } from "@/types/complaint";
import { formatFirestoreTimestamp } from "@/lib/utils";
import ComplaintForm from "@/components/ComplaintForm";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, role, token, loading: authLoading, logout } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // Stats for current user
  const [stats, setStats] = useState<ComplaintSummaryStats>({
    total: 3,
    open: 1,
    inProgress: 1,
    resolved: 1,
    rejected: 0,
  });

  // Guard: if not authenticated or admin, handle routing
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?mode=user");
    }
  }, [user, authLoading, router]);

  const fetchUserComplaints = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Query complaints matching user's email or userId
      const res = await fetch(`/api/complaints?search=${encodeURIComponent(user.email || "")}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (res.ok && data.complaints) {
        setComplaints(data.complaints);
        // Calculate user specific stats
        const s: ComplaintSummaryStats = { total: data.complaints.length, open: 0, inProgress: 0, resolved: 0, rejected: 0 };
        data.complaints.forEach((c: Complaint) => {
          if (c.status === "Open") s.open++;
          else if (c.status === "In Progress") s.inProgress++;
          else if (c.status === "Resolved") s.resolved++;
          else if (c.status === "Rejected") s.rejected++;
        });
        setStats(s);
      }
    } catch (err) {
      console.warn("Could not fetch user complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchUserComplaints();
  }, [fetchUserComplaints]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500">Loading your student dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#FEF3C7] text-[#92400E]";
      case "In Progress":
        return "bg-[#EDE9FE] text-[#6D28D9]";
      case "Resolved":
        return "bg-[#D1FAE5] text-[#065F46]";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const displayName = user.displayName || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* DESKTOP SIDEBAR - Dark Navy #0A1128 matching top screenshot */}
      <aside className="hidden lg:flex w-64 bg-[#0A1128] text-slate-300 flex-col shrink-0 min-h-screen fixed left-0 top-0 bottom-0 z-40 border-r border-slate-900 shadow-xl">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">IT Academics</h1>
            <span className="text-[10px] text-slate-400 font-medium">Complaint Portal</span>
          </div>
        </div>

        {/* Navigation items matching top screenshot */}
        <div className="p-4 flex-1 space-y-1.5">
          <button
            onClick={() => setShowNewModal(false)}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 transition-all text-left"
          >
            <LayoutDashboard className="w-4 h-4 text-white" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all text-left"
          >
            <PlusCircle className="w-4 h-4 text-slate-400" />
            <span>New Complaint</span>
          </button>

          <Link
            href="/track"
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Track by ID</span>
          </Link>
        </div>

        {/* Logout at bottom */}
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header Bar matching screenshot: "Hello, Rahul Kumar / Here's your complaint summary" */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Hello, {displayName}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Here&apos;s your complaint summary
            </p>
          </div>

          {/* Profile Chip on the right */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs ring-2 ring-slate-100">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[160px]">{user.email}</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          {/* New Complaint Form Overlay / View if toggled */}
          {showNewModal ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Lodge a New Grievance</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <ComplaintForm />
            </div>
          ) : (
            <>
              {/* 4 SUMMARY METRIC CARDS MATCHING TOP SCREENSHOT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Complaints */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Complaints</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.total}</h3>
                  </div>
                </div>

                {/* Open */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-[#D97706]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Open</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.open}</h3>
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                    <RotateCw className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">In Progress</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.inProgress}</h3>
                  </div>
                </div>

                {/* Resolved */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#059669]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Resolved</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.resolved}</h3>
                  </div>
                </div>
              </div>

              {/* 2 COLUMN LAYOUT: Recent Complaints (8 cols) + Quick Actions & Activity (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Recent Complaints Table Card (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Recent Complaints</h3>
                    <button
                      onClick={() => setShowNewModal(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/40">
                          <th className="py-3.5 px-6">Complaint ID</th>
                          <th className="py-3.5 px-4">Subject</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Submitted On</th>
                          <th className="py-3.5 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {complaints.length === 0 ? (
                          <>
                            {/* Sample items matching user's top screenshot */}
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-6 font-mono font-bold text-slate-900">CMP-20251023-001</td>
                              <td className="py-3.5 px-4">Product quality issue</td>
                              <td className="py-3.5 px-4 text-slate-600">Product Complaint</td>
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#92400E]">
                                  Open
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">23 Oct 2025, 10:24 AM</td>
                              <td className="py-3.5 px-6 text-right">
                                <Link href="/track?id=CMP-20251023-001" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">
                                  <span>View</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-6 font-mono font-bold text-slate-900">CMP-20251020-002</td>
                              <td className="py-3.5 px-4">Delivery delay</td>
                              <td className="py-3.5 px-4 text-slate-600">Delivery Issue</td>
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#EDE9FE] text-[#6D28D9]">
                                  In Progress
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">20 Oct 2025, 04:12 PM</td>
                              <td className="py-3.5 px-6 text-right">
                                <Link href="/track?id=CMP-20251020-002" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">
                                  <span>View</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-6 font-mono font-bold text-slate-900">CMP-20251018-003</td>
                              <td className="py-3.5 px-4">Wrong item received</td>
                              <td className="py-3.5 px-4 text-slate-600">Order Issue</td>
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46]">
                                  Resolved
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">18 Oct 2025, 11:45 AM</td>
                              <td className="py-3.5 px-6 text-right">
                                <Link href="/track?id=CMP-20251018-003" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">
                                  <span>View</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          </>
                        ) : (
                          complaints.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{c.complaintId}</td>
                              <td className="py-3.5 px-4 truncate max-w-[180px]">{c.subject}</td>
                              <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${getBadgeStyle(c.status)}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">{formatFirestoreTimestamp(c.createdAt)}</td>
                              <td className="py-3.5 px-6 text-right">
                                <Link href={`/track?id=${c.complaintId}`} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">
                                  <span>View</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Pane (4 cols) matching screenshot */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Quick Actions</span>
                    </h3>

                    <button
                      onClick={() => setShowNewModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Register New Complaint</span>
                    </button>

                    <div className="bg-[#EFF6FF] border border-blue-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Keep your Complaint ID safe</p>
                        <p className="text-blue-700 mt-0.5 leading-relaxed">
                          You can use it to check the status of your complaint anytime.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Your Recent Activity matching screenshot */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Your Recent Activity</span>
                    </h3>

                    <div className="space-y-4 pt-1">
                      <div className="flex items-start gap-3 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">Complaint registered</p>
                          <p className="font-mono text-[11px] text-slate-500 mt-0.5">CMP-20251023-001</p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">2 hours ago</span>
                      </div>

                      <div className="flex items-start gap-3 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">Status updated to In Progress</p>
                          <p className="font-mono text-[11px] text-slate-500 mt-0.5">CMP-20251020-002</p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">3 days ago</span>
                      </div>

                      <div className="flex items-start gap-3 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">Complaint resolved</p>
                          <p className="font-mono text-[11px] text-slate-500 mt-0.5">CMP-20251018-003</p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">5 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
