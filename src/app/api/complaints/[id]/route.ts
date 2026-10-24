import { NextRequest, NextResponse } from "next/server";
import {
  getStoredComplaintById,
  updateStoredComplaint,
  deleteStoredComplaint
} from "@/lib/complaintsStore";
import { sendEmailNotification } from "@/lib/emailService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaint = getStoredComplaintById(id);

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      complaint,
    });
  } catch (error: any) {
    console.error("[Complaint Get Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch complaint." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNote } = body;

    const existing = getStoredComplaintById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Complaint not found." }, { status: 404 });
    }

    const oldStatus = existing.status;
    const updated = updateStoredComplaint(id, {
      ...(status ? { status } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    });

    // If status changed and complainant has an email, dispatch status update notification
    if (status && status !== oldStatus && existing.email) {
      try {
        await sendEmailNotification({
          to: existing.email,
          subject: `[IT Academics] Complaint Status Update: [${existing.complaintId}] is now ${status}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0A1128;">IT Academics Grievance Status Updated</h2>
              <p>Dear ${existing.fullName},</p>
              <p>Your complaint reference <strong>${existing.complaintId}</strong> has been updated.</p>
              <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
                <p style="margin: 6px 0 0 0;"><strong>New Status:</strong> <span style="color: #2563eb; font-weight: bold;">${status}</span></p>
              </div>
              ${adminNote ? `<p><strong>Administrator Note:</strong><br/>${adminNote}</p>` : ""}
              <p>Subject: <em>${existing.subject}</em></p>
              <p>Thank you for your patience as our technical team investigates your concern.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Status email error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully.",
      complaint: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteStoredComplaint(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Complaint not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Complaint deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete." }, { status: 500 });
  }
}
