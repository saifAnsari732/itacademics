import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "whatsapp-saas-7ab44";

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // 1. Full JSON service account string
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
        storageBucket: `${projectId}.firebasestorage.app`,
      });
    } catch (e) {
      console.error("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    }
  }

  // 2. Individual Environment Variables
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
    });
  }

  // 3. Fallback / Default Application Credentials (e.g. Firebase App Hosting, GCP, or emulator)
  try {
    return admin.initializeApp({
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
    });
  } catch (err) {
    console.warn("[FirebaseAdmin] Initialized without explicit service account credentials:", err);
    return admin.app();
  }
}

const adminApp = getAdminApp();
const adminDb = admin.firestore(adminApp);
const adminAuth = admin.auth(adminApp);
const adminStorage = admin.storage(adminApp);

export { admin, adminApp, adminDb, adminAuth, adminStorage };
