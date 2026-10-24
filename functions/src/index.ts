import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { sendEmail } from "./emailService";
import {
  generateAdminNotificationHtml,
  generateComplainantAcknowledgementHtml,
  generateStatusUpdateHtml,
  ComplaintData
} from "./templates";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Triggered automatically whenever a new complaint document is created.
 * Sends notification to Admin and an acknowledgement to the complainant.
 */
export const onComplaintCreated = onDocumentCreated(
  {
    document: "complaints/{docId}",
    region: "us-central1",
    retry: true,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const docRef = snapshot.ref;
    const data = snapshot.data() as ComplaintData & {
      notificationStatus?: {
        adminNotified?: boolean;
        complainantNotified?: boolean;
      };
    };

    const complaintId = data.complaintId || snapshot.id;
    const adminEmail = process.env.COMPLAINT_RECEIVER_EMAIL || "admin@complaints.example.com";
    const notificationStatus = data.notificationStatus || {};

    console.log(`[onComplaintCreated] Processing notifications for Complaint ID: ${complaintId}`);

    // 1. Send Admin Notification (Idempotent check)
    if (!notificationStatus.adminNotified) {
      const adminHtml = generateAdminNotificationHtml({
        ...data,
        complaintId,
      });

      const res = await sendEmail({
        to: adminEmail,
        subject: `[New Complaint] [${complaintId}] ${data.subject}`,
        html: adminHtml,
      });

      if (res.success) {
        notificationStatus.adminNotified = true;
      }
    }

    // 2. Send Complainant Acknowledgement (Idempotent check)
    if (data.email && !notificationStatus.complainantNotified) {
      const complainantHtml = generateComplainantAcknowledgementHtml({
        ...data,
        complaintId,
      });

      const res = await sendEmail({
        to: data.email,
        subject: `Complaint Registered Successfully - Ref: ${complaintId}`,
        html: complainantHtml,
      });

      if (res.success) {
        notificationStatus.complainantNotified = true;
      }
    }

    // Update document with notification audit trail
    await docRef.update({
      notificationStatus: {
        ...notificationStatus,
        lastProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    console.log(`[onComplaintCreated] Notification processing completed for ${complaintId}`);
  }
);

/**
 * Triggered automatically when a complaint document is updated.
 * Detects status changes and notifies the complainant.
 */
export const onComplaintStatusUpdated = onDocumentUpdated(
  {
    document: "complaints/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) return;

    const oldStatus = beforeData.status;
    const newStatus = afterData.status;

    // Check if status changed and complainant provided an email
    if (oldStatus && newStatus && oldStatus !== newStatus && afterData.email) {
      const complaintId = afterData.complaintId || event.data?.after.id;
      console.log(`[onComplaintStatusUpdated] Status change from ${oldStatus} -> ${newStatus} for ${complaintId}`);

      const html = generateStatusUpdateHtml(
        {
          complaintId,
          fullName: afterData.fullName,
          mobile: afterData.mobile,
          category: afterData.category,
          subject: afterData.subject,
          description: afterData.description,
          status: newStatus,
          adminNote: afterData.adminNote,
        },
        oldStatus,
        newStatus
      );

      await sendEmail({
        to: afterData.email,
        subject: `Update on your Complaint [${complaintId}]: Status is now ${newStatus}`,
        html,
      });
    }
  }
);
