"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  Search,
  Download,
  ChevronRight,
  Plus,
  ListFilter,
  Users,
  Settings,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintSummaryStats, COMPLAINT_CATEGORIES } from "@/types/complaint";
import { formatFirestoreTimestamp } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintSummaryStats>({
    total: 24,
    open: 8,
    inProgress: 7,
    resolved: 9,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      let url = `/api/complaints?page=1&limit=8`;
      if (statusFilter !== "all") url += `&status=${encodeURIComponent(statusFilter)}`;
      if (categoryFilter !== "all") url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints(data.complaints || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Export to CSV
  const handleExportCSV = () => {
    if (complaints.length === 0) return;
    const headers = ["Complaint ID", "Name", "Mobile", "Category", "Subject", "Status", "Date"];
    const rows = complaints.map((c) => [
      c.complaintId,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.mobile,
      `"${c.category}"`,
      `"${c.subject.replace(/"/g, '""')}"`,
      c.status,
      `"${formatFirestoreTimestamp(c.createdAt)}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaints_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for custom pill badge colors matching the screenshot
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#FEF3C7] text-[#92400E] border-transparent"; // Warm Amber
      case "In Progress":
        return "bg-[#EDE9FE] text-[#6D28D9] border-transparent"; // Soft Purple
      case "Resolved":
        return "bg-[#D1FAE5] text-[#065F46] border-transparent"; // Soft Emerald
      case "Rejected":
        return "bg-[#FFE4E6] text-[#9F1239] border-transparent"; // Soft Rose
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Percentages for status overview chart
  const totalCount = stats.total || (stats.open + stats.inProgress + stats.resolved + stats.rejected) || 1;
  const openPct = Math.round((stats.open / totalCount) * 100) || 0;
  const inProgressPct = Math.round((stats.inProgress / totalCount) * 100) || 0;
  const resolvedPct = Math.round((stats.resolved / totalCount) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* 1. TOP 4 METRIC CARDS - EXACT MATCH FROM SCREENSHOT */}
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

      {/* 2. RECENT COMPLAINTS TABLE CARD WITH INTEGRATED TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Card Header & Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
            <button
              onClick={() => fetchDashboardData()}
              className="xl:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Toolbar matching screenshot: Search + All Status + All Categories + Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name or mobile..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[160px]"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Modern Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/40">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading latest complaints...</span>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No complaints match your selected filters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 text-xs">
                      {c.complaintId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 truncate max-w-[140px]">
                      {c.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {c.mobile}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap truncate max-w-[140px]">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 truncate max-w-[180px]" title={c.subject}>
                      {c.subject}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${getBadgeStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatFirestoreTimestamp(c.createdAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/complaints/${c.id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#2563EB] hover:text-blue-800 transition-colors"
                      >
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

      {/* 3. BOTTOM SECTION: COMPLAINT STATUS OVERVIEW & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Complaint Status Overview Donut Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Complaint Status Overview</h3>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* Visual Donut Chart representation */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Resolved segment (Emerald) */}
                <path
                  className="text-[#059669]"
                  strokeDasharray={`${resolvedPct}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* In Progress segment (Purple) */}
                <path
                  className="text-[#7C3AED]"
                  strokeDasharray={`${inProgressPct}, 100`}
                  strokeDashoffset={`-${resolvedPct}`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Open segment (Amber) */}
                <path
                  className="text-[#D97706]"
                  strokeDasharray={`${openPct}, 100`}
                  strokeDashoffset={`-${resolvedPct + inProgressPct}`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Inner Circle content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-tight">{stats.total}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                  <span className="font-semibold text-slate-700">Open</span>
                </div>
                <span className="text-slate-500 font-mono font-medium">
                  {stats.open} ({openPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span>
                  <span className="font-semibold text-slate-700">In Progress</span>
                </div>
                <span className="text-slate-500 font-mono font-medium">
                  {stats.inProgress} ({inProgressPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                  <span className="font-semibold text-slate-700">Resolved</span>
                </div>
                <span className="text-slate-500 font-mono font-medium">
                  {stats.resolved} ({resolvedPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions 2x2 Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
            {/* Action 1: Register New Complaint */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span>Register New Complaint</span>
            </Link>

            {/* Action 2: View All Complaints */}
            <Link
              href="/admin/complaints"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ListFilter className="w-4 h-4" />
              </div>
              <span>View All Complaints</span>
            </Link>

            {/* Action 3: Manage Users */}
            <Link
              href="/admin/login"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span>Manage Administrators</span>
            </Link>

            {/* Action 4: Settings */}
            <button
              onClick={() => alert("System settings are automatically synchronized with Firebase Cloud Firestore.")}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
