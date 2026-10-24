"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import {
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  X,
  FileCheck2,
  Info
} from "lucide-react";
import { COMPLAINT_CATEGORIES } from "@/types/complaint";
import { validateComplaintSubmission } from "@/lib/utils";

interface FormState {
  fullName: string;
  mobile: string;
  email: string;
  category: string;
  subject: string;
  description: string;
  address: string;
}

export default function ComplaintForm() {
  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    mobile: "",
    email: "",
    category: "",
    subject: "",
    description: "",
    address: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selected.type)) {
      setFileError("Invalid format. Only PDF, JPG, PNG, or WEBP files are allowed.");
      return;
    }

    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateComplaintSubmission(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("mobile", formData.mobile);
      data.append("email", formData.email);
      data.append("category", formData.category);
      data.append("subject", formData.subject);
      data.append("description", formData.description);
      data.append("address", formData.address);

      if (file) {
        data.append("file", file);
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setServerError(result.error || "Submission failed. Please try again.");
        }
        return;
      }

      setSubmittedComplaintId(result.complaintId);
    } catch (err: any) {
      console.error("Submission error:", err);
      setServerError("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!submittedComplaintId) return;
    navigator.clipboard.writeText(submittedComplaintId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      mobile: "",
      email: "",
      category: "",
      subject: "",
      description: "",
      address: "",
    });
    setFile(null);
    setFieldErrors({});
    setServerError(null);
    setSubmittedComplaintId(null);
  };

  // SUCCESS RECEIPT
  if (submittedComplaintId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#059669] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Complaint Registered Successfully</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Your grievance has been logged in Firebase Cloud Firestore. An automated acknowledgement has been triggered.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Your Reference Complaint ID
            </span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
                {submittedComplaintId}
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                title="Copy Complaint ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <span className="text-xs font-semibold text-emerald-600 mt-2 block animate-in fade-in">
                ✓ Copied to clipboard!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href={`/track?id=${encodeURIComponent(submittedComplaintId)}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-xs sm:text-sm"
            >
              <span>Track Progress Live</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-xs sm:text-sm"
            >
              Register Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORM CARD
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Register New Complaint</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the details below to submit an official grievance to administration.
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {serverError && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        {/* Contact info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Rahul Kumar"
                className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  fieldErrors.fullName ? "border-rose-400" : "border-slate-200"
                } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            {fieldErrors.fullName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="98XXXXXXXX"
                className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  fieldErrors.mobile ? "border-rose-400" : "border-slate-200"
                } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            {fieldErrors.mobile && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.mobile}</p>}
          </div>
        </div>

        {/* Email & Location row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-slate-400 font-normal">(Optional, for notification updates)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Address / Campus Location <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Hostel Block A, Room 204"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Category & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Complaint Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border ${
                fieldErrors.category ? "border-rose-400" : "border-slate-200"
              } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium`}
            >
              <option value="">-- Select Category --</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. WiFi connection drops in Block B"
              className={`w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border ${
                fieldErrors.subject ? "border-rose-400" : "border-slate-200"
              } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Please explain the issue in detail, when it began, and any relevant details..."
            className={`w-full p-3 text-xs sm:text-sm rounded-xl border ${
              fieldErrors.description ? "border-rose-400" : "border-slate-200"
            } bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>

        {/* File attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Supporting Document or Image <span className="text-slate-400 font-normal">(Optional, max 10MB)</span>
          </label>
          {!file ? (
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 group">
              <Paperclip className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
              <span className="text-xs font-semibold text-slate-700">Click to attach photo or PDF</span>
              <span className="text-[11px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">{file.name}</span>
              </div>
              <button type="button" onClick={removeFile} className="p-1 rounded-lg text-slate-400 hover:text-rose-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {fileError && <p className="text-[11px] text-rose-600 mt-1">{fileError}</p>}
        </div>

        {/* Submit button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Registering Complaint...</span>
              </>
            ) : (
              <>
                <span>Register Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
