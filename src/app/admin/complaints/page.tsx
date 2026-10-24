"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Paperclip,
  Check,
  Calendar,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { COMPLAINT_CATEGORIES, Complaint, ComplaintStatus } from "@/types/complaint";
import { getStatusBadgeClass, formatFirestoreTimestamp } from "@/lib/utils";

export default function ComplaintsListPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        sort,
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);

      const res = await fetch(`/api/complaints?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load complaints.");
      }

      setComplaints(data.complaints || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err: any) {
      console.error("Complaints list fetch error:", err);
      setError(err?.message || "Error loading complaints from Firestore.");
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, status, category, sort]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setCategory("all");
    setSort("desc");
    setPage(1);
  };

  const hasActiveFilters = search || status !== "all" || category !== "all" || sort !== "desc";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Complaint Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive grievance management, search, status tracking, and resolution logs.
          </p>
        </div>

        <button
          onClick={() => fetchComplaints()}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchComplaints()} className="text-xs font-bold text-rose-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* SEARCH AND FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by ID, Name or Phone */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, name, mobile, subject..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="desc">Sort: Newest First</option>
              <option value="asc">Sort: Oldest First</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 flex-shrink-0"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <span>Filtered results: <strong>{totalCount}</strong> matching complaints</span>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Complaint ID</th>
                <th className="py-3.5 px-4">Complainant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Attachment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading complaint records...</span>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-xs">
                    No complaints found. Try clearing your filters or search terms.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Complaint ID */}
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-xs text-navy-950">
                      <Link
                        href={`/admin/complaints/${c.id}`}
                        className="hover:underline text-primary-700"
                      >
                        {c.complaintId}
                      </Link>
                    </td>

                    {/* Complainant & Contact */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm">{c.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{c.mobile}</p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <span className="inline-block max-w-[140px] truncate" title={c.category}>
                        {c.category}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs max-w-[200px] truncate" title={c.subject}>
                      {c.subject}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatFirestoreTimestamp(c.createdAt)}
                    </td>

                    {/* Attachment Indicator */}
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      {c.attachmentPath || c.attachmentName ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <Paperclip className="w-3.5 h-3.5 text-primary-600" />
                          <span>File</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ring-1 ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/complaints/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:text-white bg-slate-100 hover:bg-navy-900 rounded-lg transition-colors border border-slate-200 hover:border-transparent"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong> ({totalCount} total complaints)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
