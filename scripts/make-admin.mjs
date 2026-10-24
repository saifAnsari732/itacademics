/**
 * Standalone Admin Provisioning Script
 * Usage: node scripts/make-admin.mjs <admin-email>
 */

import admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "whatsapp-saas-7ab44";

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
  } else if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      projectId,
    });
  } else {
    admin.initializeApp({ projectId });
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

async function makeAdmin(targetEmail) {
  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true, role: "admin" });
    await admin.firestore().collection("admins").doc(user.uid).set({
      email: targetEmail,
      role: "admin",
      active: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`[SUCCESS] Admin custom claim successfully set for: ${targetEmail} (UID: ${user.uid})`);
    process.exit(0);
  } catch (err) {
    console.error("[ERROR] Failed to set admin claim:", err.message);
    process.exit(1);
  }
}

makeAdmin(email);
