import nodemailer from "nodemailer";
import { Complaint } from "@/types/complaint";

export async function sendEmailNotification(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const from = process.env.SMTP_FROM || (user ? `"Complaint Support Portal" <${user}>` : `"Complaint Support" <noreply@complaints.example.com>`);

  // 1. If SMTP / Gmail credentials are provided, send live email
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`[Email Delivered Successfully] MessageId: ${info.messageId} to ${options.to}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email Dispatch Error via SMTP]", err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  // 2. Check Resend API if configured
  const resendApiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Complaint Portal <onboarding@resend.dev>",
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send email via Resend");
      }
      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.error("[Email Notification Error via Resend]", err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  // 3. Fallback to console logger if no credentials configured yet
  console.log("------------------------------------------");
  console.log(`[EMAIL DISPATCH - LOCAL LOG]`);
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Notice: To send live emails, set SMTP_USER and SMTP_PASS in .env.local`);
  console.log("------------------------------------------");

  return { success: true, messageId: `mock-${Date.now()}` };
}

export function buildAdminNotificationHtml(complaint: Partial<Complaint>): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
      <div style="background: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 6px; margin: -24px -24px 20px -24px;">
        <h2 style="margin: 0; font-size: 18px;">New Grievance Submitted</h2>
        <span style="font-family: monospace; font-size: 13px; color: #60a5fa;">ID: ${complaint.complaintId}</span>
      </div>
      <p><strong>Complainant:</strong> ${complaint.fullName} (${complaint.mobile})</p>
      <p><strong>Email:</strong> ${complaint.email || 'Not provided'}</p>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Subject:</strong> ${complaint.subject}</p>
      <p><strong>Description:</strong></p>
      <div style="background: #f8fafc; padding: 14px; border-left: 4px solid #2563eb; border-radius: 4px; font-size: 14px; line-height: 1.6;">
        ${complaint.description?.replace(/\n/g, '<br/>')}
      </div>
      ${complaint.address ? `<p style="margin-top: 12px;"><strong>Location / Address:</strong> ${complaint.address}</p>` : ''}
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">Official Grievance Redressal Portal</p>
    </div>
  `;
}

export function buildComplainantAcknowledgementHtml(complaint: Partial<Complaint>): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
      <div style="background: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 6px; margin: -24px -24px 20px -24px;">
        <h2 style="margin: 0; font-size: 18px;">Grievance Registration Confirmation</h2>
      </div>
      <p>Dear ${complaint.fullName},</p>
      <p>Your complaint has been successfully registered in our records. Please retain the unique reference ID below for tracking:</p>
      <div style="background: #eff6ff; border: 2px dashed #3b82f6; padding: 16px; text-align: center; font-size: 24px; font-weight: 800; color: #1d4ed8; font-family: monospace; border-radius: 8px; margin: 18px 0;">
        ${complaint.complaintId}
      </div>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Subject:</strong> ${complaint.subject}</p>
      <p><strong>Status:</strong> ${complaint.status || 'Open'}</p>
      <p>Our administration is reviewing the submission. You can track real-time progress on our website using your reference ID.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">Support &amp; Grievance Redressal Department</p>
    </div>
  `;
}
