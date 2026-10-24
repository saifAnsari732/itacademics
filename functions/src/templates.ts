export interface ComplaintData {
  complaintId: string;
  fullName: string;
  mobile: string;
  email?: string;
  category: string;
  subject: string;
  description: string;
  address?: string;
  status: string;
  createdAtFormatted?: string;
  adminNote?: string;
}

export function generateAdminNotificationHtml(complaint: ComplaintData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #2563eb; color: #fff; margin-top: 8px; }
    .content { padding: 24px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .data-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 14px; }
    .data-table td.label { width: 35%; color: #64748b; font-weight: 500; }
    .data-table td.value { width: 65%; color: #0f172a; font-weight: 600; }
    .description-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px; margin-top: 8px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #334155; }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Complaint Received</h1>
      <span class="badge">${complaint.complaintId}</span>
    </div>
    <div class="content">
      <div class="section-title">Complainant Details</div>
      <table class="data-table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value">${complaint.fullName}</td>
        </tr>
        <tr>
          <td class="label">Mobile Number</td>
          <td class="value">${complaint.mobile}</td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value">${complaint.email || 'Not provided'}</td>
        </tr>
        <tr>
          <td class="label">Address / Location</td>
          <td class="value">${complaint.address || 'Not provided'}</td>
        </tr>
      </table>

      <div class="section-title">Complaint Overview</div>
      <table class="data-table">
        <tr>
          <td class="label">Category</td>
          <td class="value">${complaint.category}</td>
        </tr>
        <tr>
          <td class="label">Subject</td>
          <td class="value">${complaint.subject}</td>
        </tr>
        <tr>
          <td class="label">Status</td>
          <td class="value">${complaint.status}</td>
        </tr>
      </table>

      <div class="section-title">Description</div>
      <div class="description-box">
        ${complaint.description.replace(/\n/g, '<br/>')}
      </div>
    </div>
    <div class="footer">
      This is an automated notification from Complaint Management System. Please log in to the admin panel to update or take action.
    </div>
  </div>
</body>
</html>
  `;
}

export function generateComplainantAcknowledgementHtml(complaint: ComplaintData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; }
    .id-box { background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 6px; padding: 16px; margin: 16px 0; text-align: center; }
    .id-label { font-size: 12px; color: #1e40af; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .id-value { font-size: 22px; font-weight: 800; color: #1d4ed8; margin-top: 4px; font-family: monospace; }
    .details { background: #f8fafc; border-radius: 6px; padding: 14px; margin: 16px 0; }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Complaint Registration Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${complaint.fullName}</strong>,</p>
      <p>Thank you for reaching out. We have successfully registered your complaint. Our dedicated team is reviewing the submission and will address it promptly.</p>
      
      <div class="id-box">
        <div class="id-label">Your Unique Reference ID</div>
        <div class="id-value">${complaint.complaintId}</div>
      </div>

      <p>Please keep this reference ID for tracking and future inquiries.</p>

      <div class="details">
        <p style="margin: 4px 0;"><strong>Category:</strong> ${complaint.category}</p>
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${complaint.subject}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${complaint.status}</p>
      </div>

      <p>You can track the progress of your grievance at any time on our website using your Complaint ID.</p>
      <p>Sincerely,<br/><strong>Support & Grievance Department</strong></p>
    </div>
    <div class="footer">
      This is an automated acknowledgment. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
  `;
}

export function generateStatusUpdateHtml(complaint: ComplaintData, oldStatus: string, newStatus: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 15px; margin: 12px 0; background: #dbeafe; color: #1e40af; }
    .note-box { background: #f1f5f9; border-left: 4px solid #64748b; padding: 12px; margin: 12px 0; border-radius: 4px; }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Complaint Status Updated</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${complaint.fullName}</strong>,</p>
      <p>The status of your complaint (Reference: <strong>${complaint.complaintId}</strong>) has been updated.</p>
      
      <div>
        Status changed from <strong>${oldStatus}</strong> to:
        <br/>
        <div class="status-badge">${newStatus}</div>
      </div>

      ${complaint.adminNote ? `
      <p><strong>Administrator Note:</strong></p>
      <div class="note-box">
        ${complaint.adminNote.replace(/\n/g, '<br/>')}
      </div>
      ` : ''}

      <p>Subject: <em>${complaint.subject}</em></p>
      <p>Thank you for your patience as we work on resolving your concern.</p>
      <p>Sincerely,<br/><strong>Support & Grievance Department</strong></p>
    </div>
    <div class="footer">
      This is an automated notification.
    </div>
  </div>
</body>
</html>
  `;
}
