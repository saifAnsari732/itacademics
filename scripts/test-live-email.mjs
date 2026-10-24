import nodemailer from "nodemailer";

async function testGmail() {
  const host = "smtp.gmail.com";
  const port = 465;
  const user = "ansarisaifuddin732@gmail.com";
  const pass = "ambrwhkxszxfnuhp"; // App password without spaces

  console.log(`Connecting to ${host}:${port} as ${user}...`);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
    });

    // Verify SMTP connection
    console.log("Verifying credentials with Gmail SMTP server...");
    await transporter.verify();
    console.log("✓ Gmail SMTP Authentication Successful!");

    const complaintDetails = {
      complaintId: "CMP-20261023-A7K92",
      fullName: "Saif Ansari",
      mobile: "+91 9876543210",
      email: "ansarisaifuddin732@gmail.com",
      category: "Software & Bug Reports",
      subject: "IT Academics Platform Sandbox Timeout Error",
      description: "During assignment evaluation, the Python runtime environment returns a 504 Gateway Timeout when executing complex pandas data queries.",
      address: "IT Academics Main Campus, Lab 3, Workstation 14",
      status: "Open",
      submittedOn: new Date().toLocaleString(),
    };

    console.log(`Sending live test complaint email to: ${user}...`);

    const info = await transporter.sendMail({
      from: `"IT Academics Grievance Portal" <${user}>`,
      to: user,
      subject: `[IT Academics] [${complaintDetails.complaintId}] New Complaint: ${complaintDetails.subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0A1128; color: #ffffff; padding: 18px 24px; border-radius: 8px; margin: -24px -24px 24px -24px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">IT Academics - New Complaint Registered</h2>
            <span style="font-family: monospace; font-size: 13px; color: #60a5fa; font-weight: 600;">Reference ID: ${complaintDetails.complaintId}</span>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            A new grievance has been officially registered in the IT Academics portal. Here are the full submission details:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 35%;">Complainant Name:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${complaintDetails.fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Contact Mobile:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${complaintDetails.mobile}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Email Address:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${complaintDetails.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Location / Address:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${complaintDetails.address}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Grievance Category:</td>
              <td style="padding: 10px 0; color: #2563eb; font-weight: 700;">${complaintDetails.category}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Subject:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${complaintDetails.subject}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Initial Status:</td>
              <td style="padding: 10px 0;">
                <span style="background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px;">
                  ${complaintDetails.status}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Submission Timestamp:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${complaintDetails.submittedOn}</td>
            </tr>
          </table>

          <div style="margin-top: 16px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">
              Detailed Description:
            </div>
            <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #334155;">
              ${complaintDetails.description}
            </div>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              This is an automated notification from IT Academics Grievance Portal. Please sign in to the Admin Panel to update the status.
            </p>
          </div>
        </div>
      `,
    });

    console.log("✓ SUCCESS: Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("✗ ERROR Sending Email:", err);
  }
}

testGmail();
