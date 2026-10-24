import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebaseAdmin";
import { generateComplaintId, validateComplaintSubmission } from "@/lib/utils";
import {
  saveStoredComplaint,
  getAllStoredComplaints,
  getStoredStats
} from "@/lib/complaintsStore";
import {
  sendEmailNotification,
  buildAdminNotificationHtml,
  buildComplainantAcknowledgementHtml
} from "@/lib/emailService";
import { Complaint } from "@/types/complaint";

// Rate limiting map
const rateLimitMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    // 1. Anti-spam Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    const lastRequest = rateLimitMap.get(ip);
    if (lastRequest && now - lastRequest < 2500) {
      return NextResponse.json(
        { success: false, error: "Please wait a moment before submitting again." },
        { status: 429 }
      );
    }
    rateLimitMap.set(ip, now);

    const contentType = req.headers.get("content-type") || "";
    let fullName = "";
    let mobile = "";
    let email = "";
    let category = "";
    let subject = "";
    let description = "";
    let address = "";
    let attachmentName = "";
    let attachmentPath = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      fullName = (formData.get("fullName") as string) || "";
      mobile = (formData.get("mobile") as string) || "";
      email = (formData.get("email") as string) || "";
      category = (formData.get("category") as string) || "";
      subject = (formData.get("subject") as string) || "";
      description = (formData.get("description") as string) || "";
      address = (formData.get("address") as string) || "";

      if (formData.get("website_url")) {
        return NextResponse.json({ success: true, complaintId: "CMP-SPAM-IGNORED" });
      }

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        attachmentName = file.name;
        attachmentPath = `complaints/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      }
    } else {
      const body = await req.json();
      fullName = body.fullName || "";
      mobile = body.mobile || "";
      email = body.email || "";
      category = body.category || "";
      subject = body.subject || "";
      description = body.description || "";
      address = body.address || "";
      attachmentName = body.attachmentName || "";
      attachmentPath = body.attachmentPath || "";

      if (body.website_url) {
        return NextResponse.json({ success: true, complaintId: "CMP-SPAM-IGNORED" });
      }
    }

    // 2. Validate input on the server
    const validation = validateComplaintSubmission({
      fullName,
      mobile,
      email,
      category,
      subject,
      description,
      address,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // 3. Generate unique Complaint ID on the server
    const complaintId = generateComplaintId();
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newComplaint: Complaint = {
      id: docId,
      complaintId,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      category,
      subject: subject.trim(),
      description: description.trim(),
      address: address.trim() || undefined,
      attachmentName: attachmentName || undefined,
      attachmentPath: attachmentPath || undefined,
      status: "Open",
      adminNote: "",
      createdAt: nowIso,
      updatedAt: nowIso,
      notificationStatus: {
        adminNotified: false,
        complainantNotified: false,
      },
    };

    // 4. Save to Persistent Store (Guarantees zero data loss)
    saveStoredComplaint(newComplaint);

    // 5. Also attempt to sync with Cloud Firestore
    try {
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const firestoreRef = await adminDb.collection("complaints").add({
          ...newComplaint,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        newComplaint.id = firestoreRef.id;
        saveStoredComplaint(newComplaint);
      }
    } catch (fsErr) {
      console.warn("[Firestore sync note]", fsErr);
    }

    // 6. Send Transactional Email Notifications
    try {
      const adminEmail = process.env.COMPLAINT_RECEIVER_EMAIL || process.env.SMTP_USER || "ansarisaifuddin732@gmail.com";
      
      const adminResult = await sendEmailNotification({
        to: adminEmail,
        subject: `[IT Academics] [${complaintId}] New Complaint: ${subject}`,
        html: buildAdminNotificationHtml({
          complaintId,
          fullName,
          mobile,
          email,
          category,
          subject,
          description,
          address,
        }),
      });

      if (adminResult.success) {
        newComplaint.notificationStatus = {
          ...newComplaint.notificationStatus,
          adminNotified: true,
        };
      }

      if (email.trim()) {
        const complainantResult = await sendEmailNotification({
          to: email.trim(),
          subject: `Complaint Received [Ref: ${complaintId}] - IT Academics Support`,
          html: buildComplainantAcknowledgementHtml({
            complaintId,
            fullName,
            category,
            subject,
            status: "Open",
          }),
        });

        if (complainantResult.success) {
          newComplaint.notificationStatus = {
            ...newComplaint.notificationStatus,
            complainantNotified: true,
          };
        }
      }

      saveStoredComplaint(newComplaint);
    } catch (emailErr) {
      console.warn("[Email dispatch notice]", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Complaint registered successfully.",
      complaintId,
      id: newComplaint.id,
    });
  } catch (error: any) {
    console.error("[Complaint Submission API Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const sort = searchParams.get("sort") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let allDocs = getAllStoredComplaints();

    // Try reading from Cloud Firestore if available
    try {
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const snapshot = await adminDb.collection("complaints").orderBy("createdAt", "desc").get();
        if (!snapshot.empty) {
          allDocs = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              complaintId: data.complaintId || d.id,
              fullName: data.fullName || "",
              mobile: data.mobile || "",
              email: data.email || "",
              category: data.category || "",
              subject: data.subject || "",
              description: data.description || "",
              address: data.address || "",
              attachmentName: data.attachmentName || "",
              attachmentPath: data.attachmentPath || "",
              status: data.status || "Open",
              adminNote: data.adminNote || "",
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
            };
          });
        }
      }
    } catch {
      // Fallback already assigned to allDocs
    }

    // Filter by status
    if (status !== "all") {
      allDocs = allDocs.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by category
    if (category !== "all") {
      allDocs = allDocs.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }

    // Search filter
    if (search) {
      allDocs = allDocs.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(search) ||
          c.fullName.toLowerCase().includes(search) ||
          c.mobile.toLowerCase().includes(search) ||
          c.subject.toLowerCase().includes(search) ||
          (c.email && c.email.toLowerCase().includes(search))
      );
    }

    // Sort
    allDocs.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === "asc" ? timeA - timeB : timeB - timeA;
    });

    const stats = getStoredStats();
    const totalMatching = allDocs.length;
    const startIndex = (page - 1) * limit;
    const paginatedComplaints = allDocs.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      complaints: paginatedComplaints,
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages: Math.ceil(totalMatching / limit) || 1,
      },
      stats,
    });
  } catch (error: any) {
    console.error("[Complaint Fetch Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch complaints." },
      { status: 500 }
    );
  }
}
