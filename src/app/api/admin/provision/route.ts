import { NextRequest, NextResponse } from "next/server";
import { admin, adminAuth, adminDb } from "@/lib/firebaseAdmin";

/**
 * Endpoint to provision the initial or subsequent administrator.
 * Protected by an environment secret or allowed during first-time setup.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, secret } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email address is required." }, { status: 400 });
    }

    const expectedSecret = process.env.ADMIN_SETUP_SECRET || "init-admin-secure-2026";
    
    // Check if any admin already exists in the system
    const existingAdmins = await adminDb.collection("admins").get();
    const isFirstAdmin = existingAdmins.empty;

    // If not first admin, require the setup secret
    if (!isFirstAdmin && secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Invalid provisioning secret key." }, { status: 403 });
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch {
      // User doesn't exist, create if password provided
      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, error: "User does not exist. Please provide a password (min 6 characters) to create the account." },
          { status: 400 }
        );
      }
      userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: "System Administrator",
      });
    }

    // Set custom claim { admin: true }
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: "admin",
    });

    // Record in Firestore admins collection
    await adminDb.collection("admins").doc(userRecord.uid).set({
      email: userRecord.email,
      role: "admin",
      active: true,
      provisionedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `Admin privileges successfully granted to ${email}.`,
      uid: userRecord.uid,
    });
  } catch (error: any) {
    console.error("[Admin Provision Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to provision administrator." },
      { status: 500 }
    );
  }
}
