"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Paperclip,
  Download,
  AlertCircle,
  CheckCircle2,
  Save,
  Trash2,
  Loader2,
  FileText,
  ShieldAlert,
  Send
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import { getStatusBadgeClass, formatFirestoreTimestamp } from "@/lib/utils";

export default function ComplaintDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>("Open");
  const [adminNote, setAdminNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Deletion modal state
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComplaintDetails = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load complaint details.");
      }

      setComplaint(data.complaint);
      setSelectedStatus(data.complaint.status);
      setAdminNote(data.complaint.adminNote || "");
    } catch (err: any) {
      console.error("Complaint fetch error:", err);
      setError(err?.message || "Failed to retrieve complaint.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  // Handle Save
  const handleSaveChanges = async () => {
    if (!token) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedStatus,
          adminNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update complaint.");
      }

      setSaveSuccess(true);
      // Refresh current details
      fetchComplaintDetails();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err?.message || "Error saving updates.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to permanently delete this complaint record? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete complaint.");
      }

      router.push("/admin/complaints");
    } catch (err: any) {
      alert(err?.message || "Failed to delete complaint.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Retrieving complaint record from Firestore...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Unable to load complaint</h2>
        <p className="text-sm text-slate-600">{error || "The requested complaint does not exist or has been removed."}</p>
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/complaints"
            className="p-2 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-200 transition-colors"
            title="Back to complaints list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-500">Grievance Record</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">Doc ID: {complaint.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-950 font-mono tracking-tight">
              {complaint.complaintId}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Complaint status and administrative note saved successfully! Notification sent if complainant provided email.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Complainant & Subject & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Complaint Overview Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {complaint.category}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ring-1 ${getStatusBadgeClass(complaint.status)}`}>
                  Current: {complaint.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-navy-950 mt-1">
                {complaint.subject}
              </h2>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Statement of Grievance
              </h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </div>
            </div>

            {/* Complainant Contact Profile */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Complainant Identity &amp; Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[11px] font-semibold">Full Name</span>
                    <span className="font-semibold text-slate-900">{complaint.fullName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[11px] font-semibold">Mobile Number</span>
                    <a href={`tel:${complaint.mobile}`} className="font-semibold text-primary-600 hover:underline">
                      {complaint.mobile}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[11px] font-semibold">Email Address</span>
                    {complaint.email ? (
                      <a href={`mailto:${complaint.email}`} className="font-semibold text-primary-600 hover:underline">
                        {complaint.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[11px] font-semibold">Location / Address</span>
                    <span className="text-slate-800 font-medium">
                      {complaint.address || <span className="text-slate-400 italic">Not specified</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting Attachment */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Attached Document or Image
              </h3>
              {complaint.attachmentUrl || complaint.attachmentPath || complaint.attachmentName ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {complaint.attachmentName || "Attached_Document.pdf"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Stored securely in Firebase Cloud Storage
                      </p>
                    </div>
                  </div>

                  {complaint.attachmentUrl ? (
                    <a
                      href={complaint.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-700 bg-white border border-slate-300 hover:bg-primary-50 rounded-lg shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">
                      Path: {complaint.attachmentPath}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                  No supporting files were attached to this submission.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Admin Notes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Resolution Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary-600" />
              <span>Administrative Action</span>
            </h3>

            {/* Status Selector */}
            <div>
              <label htmlFor="statusSelect" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Update Status
              </label>
              <select
                id="statusSelect"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-semibold text-slate-800"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Internal Admin Note */}
            <div>
              <label htmlFor="adminNote" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Internal Administrative Note
              </label>
              <textarea
                id="adminNote"
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add internal remarks, action taken, department assigned, or resolution summary..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white placeholder-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Notes are preserved in the permanent audit trail. If complainant provided email, this note is optionally sent during status updates.
              </p>
            </div>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 text-xs sm:text-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Updates to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

          {/* Audit Metadata Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Audit &amp; Timeline
            </h4>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5" /> Created Date:
              </span>
              <span className="font-semibold text-slate-800">{formatFirestoreTimestamp(complaint.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5" /> Last Updated:
              </span>
              <span className="font-semibold text-slate-800">{formatFirestoreTimestamp(complaint.updatedAt)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500">Email Notification:</span>
              <span className="font-semibold text-emerald-600">
                {complaint.notificationStatus?.adminNotified ? "Dispatched" : "Pending / Local"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
