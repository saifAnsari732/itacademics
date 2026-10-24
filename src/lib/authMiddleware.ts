import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "./firebaseAdmin";

export interface AuthenticatedAdmin {
  uid: string;
  email?: string;
  isAdmin: boolean;
}

/**
 * Verifies if the incoming request contains a valid Firebase ID token
 * belonging to an authorized administrator.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<{
  authorized: boolean;
  user?: AuthenticatedAdmin;
  error?: string;
}> {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "Missing or invalid Authorization header." };
    }

    const token = authHeader.split("Bearer ")[1].trim();
    if (!token) {
      return { authorized: false, error: "Token not found." };
    }

    // Verify ID token with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check custom claim `admin: true` or check admins collection
    let isAdmin = decodedToken.admin === true || decodedToken.role === "admin";

    if (!isAdmin && decodedToken.email) {
      // Fallback: Check if user document exists in admins collection or matches configured admin email
      const adminEmailConfig = process.env.COMPLAINT_RECEIVER_EMAIL;
      if (adminEmailConfig && decodedToken.email.toLowerCase() === adminEmailConfig.toLowerCase()) {
        isAdmin = true;
        // Automatically sync the custom claim for future requests
        try {
          await adminAuth.setCustomUserClaims(decodedToken.uid, { admin: true });
        } catch (claimErr) {
          console.warn("Could not set custom claim on admin user:", claimErr);
        }
      } else {
        // Also check if exists in /admins collection
        try {
          const adminDoc = await adminDb.collection("admins").doc(decodedToken.uid).get();
          if (adminDoc.exists && adminDoc.data()?.active !== false) {
            isAdmin = true;
          }
        } catch (dbErr) {
          console.warn("Error checking admin collection:", dbErr);
        }
      }
    }

    if (!isAdmin) {
      return { authorized: false, error: "User is not authorized as an administrator." };
    }

    return {
      authorized: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        isAdmin: true,
      },
    };
  } catch (err: any) {
    console.error("[verifyAdminRequest Error]", err);
    return {
      authorized: false,
      error: err?.message || "Invalid or expired authentication token.",
    };
  }
}
