import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintStatus } from "@/types/complaint";

/**
 * Generate a cryptographically secure unique complaint ID.
 * Example format: CMP-20261023-A7K92
 */
export function generateComplaintId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed easily confused characters (0, O, 1, I)
  let randomCode = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomCode += chars.charAt(randomIndex);
  }

  return `CMP-${dateStr}-${randomCode}`;
}

export function validateComplaintSubmission(data: {
  fullName?: string;
  mobile?: string;
  email?: string;
  category?: string;
  subject?: string;
  description?: string;
  address?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = "Full name is required (at least 2 characters).";
  }

  const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
  if (!data.mobile || !phoneRegex.test(data.mobile.trim())) {
    errors.mobile = "A valid contact mobile number is required.";
  }

  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Please provide a valid email address or leave blank.";
    }
  }

  if (!data.category || !COMPLAINT_CATEGORIES.includes(data.category as ComplaintCategory)) {
    errors.category = "Please select a valid complaint category.";
  }

  if (!data.subject || data.subject.trim().length < 5) {
    errors.subject = "Subject must be at least 5 characters long.";
  }

  if (!data.description || data.description.trim().length < 15) {
    errors.description = "Please provide detailed description (at least 15 characters).";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatFirestoreTimestamp(timestamp: any): string {
  if (!timestamp) return "N/A";
  if (typeof timestamp === "string") {
    try {
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? timestamp : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return timestamp;
    }
  }
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }
  return "N/A";
}

export function getStatusBadgeClass(status: ComplaintStatus | string): string {
  switch (status) {
    case "Open":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
    case "In Progress":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
    case "Rejected":
      return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20";
  }
}
