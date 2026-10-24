import * as nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const from = process.env.SMTP_FROM || `"Complaint Support" <noreply@complaints.example.com>`;

  // If SMTP is not configured or in development mode, log to console safely
  if (!host || !user || !pass) {
    console.log(`[EmailService MOCK] Sending email to: ${options.to}`);
    console.log(`[EmailService MOCK] Subject: ${options.subject}`);
    console.log(`[EmailService MOCK] (Set SMTP_HOST, SMTP_USER, SMTP_PASS in Cloud Functions secrets for live delivery)`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }

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

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[EmailService ERROR]", err);
    return { success: false, error: err?.message || String(err) };
  }
}
