"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Tag,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { getStatusBadgeClass, formatFirestoreTimestamp } from "@/lib/utils";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [complaintIdInput, setComplaintIdInput] = useState(initialId);
  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (idToSearch: string) => {
    if (!idToSearch.trim()) {
      setError("Please enter a valid Complaint ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(idToSearch.trim())}?track=true`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "No complaint found with this reference number. Please check the ID and try again.");
      } else {
        setComplaint(data.complaint);
      }
    } catch {
      setError("Failed to fetch complaint status. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchStatus(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(complaintIdInput);
  };

  const getStepStatus = (currentStatus: string, step: number) => {
    const statusMap: Record<string, number> = {
      "Open": 1,
      "In Progress": 2,
      "Resolved": 3,
      "Rejected": 3,
    };
    const currentStep = statusMap[currentStatus] || 1;
    if (currentStep > step) return "completed";
    if (currentStep === step) return "active";
    return "pending";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grievance Registration</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
        <div className="bg-navy-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-navy-800 rounded-lg text-primary-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Track Complaint Status</h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Enter your unique Complaint ID to check real-time progress and history.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <label htmlFor="trackId" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Complaint Reference ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                id="trackId"
                type="text"
                required
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value.toUpperCase())}
                placeholder="e.g. CMP-20261023-A7K92"
                className="w-full pl-4 pr-4 py-3 rounded-lg border border-slate-300 font-mono text-base uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Status</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Complaint Result Details */}
        {complaint && (
          <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header Status Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block">Complaint Reference</span>
                <span className="text-xl font-mono font-extrabold text-navy-950">{complaint.complaintId}</span>
              </div>
              <div>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ring-1 ${getStatusBadgeClass(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Redressal Progress</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                    getStepStatus(complaint.status, 1) === "completed" || getStepStatus(complaint.status, 1) === "active"
                      ? "bg-navy-900 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    1
                  </div>
                  <span className="font-semibold text-slate-800">Submitted</span>
                  <span className="text-slate-400 text-[11px]">Logged in system</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                    getStepStatus(complaint.status, 2) === "completed"
                      ? "bg-navy-900 text-white"
                      : getStepStatus(complaint.status, 2) === "active"
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    2
                  </div>
                  <span className="font-semibold text-slate-800">Under Review</span>
                  <span className="text-slate-400 text-[11px]">Assigned to department</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                    complaint.status === "Resolved"
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : complaint.status === "Rejected"
                      ? "bg-rose-600 text-white ring-4 ring-rose-100"
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    3
                  </div>
                  <span className="font-semibold text-slate-800">
                    {complaint.status === "Rejected" ? "Rejected" : "Resolved"}
                  </span>
                  <span className="text-slate-400 text-[11px]">Final determination</span>
                </div>
              </div>
            </div>

            {/* Info Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-sm">
              <div className="p-4 bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" /> Category
                </span>
                <span className="font-semibold text-slate-900">{complaint.category}</span>
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <span className="text-slate-500 font-medium">Subject</span>
                <span className="font-semibold text-slate-900 text-right">{complaint.subject}</span>
              </div>
              <div className="p-4 bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Submitted On
                </span>
                <span className="font-semibold text-slate-900">{formatFirestoreTimestamp(complaint.createdAt)}</span>
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Last Updated
                </span>
                <span className="font-semibold text-slate-900">{formatFirestoreTimestamp(complaint.updatedAt)}</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => fetchStatus(complaint.complaintId)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading tracking portal...</div>}>
      <TrackContent />
    </Suspense>
  );
}
