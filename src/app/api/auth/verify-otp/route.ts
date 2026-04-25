import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/adminApp";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json({ error: "Email and PIN are required." }, { status: 400 });
    }

    const otpRef = adminDb.collection("otp_codes").doc(email);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: "OTP not found. Please request a new code." }, { status: 400 });
    }

    const { pin: storedPin, expiresAt } = otpDoc.data() as { pin: string; expiresAt: number };

    if (Date.now() > expiresAt) {
      await otpRef.delete();
      return NextResponse.json({ error: "OTP has expired. Please request a new code." }, { status: 400 });
    }

    if (pin !== storedPin) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    // OTP is valid — find or create the Firebase Auth user
    let uid: string;
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
    } catch {
      // User doesn't exist yet — create them
      const newUser = await adminAuth.createUser({ email });
      uid = newUser.uid;
    }

    const customToken = await adminAuth.createCustomToken(uid);

    // Invalidate the OTP immediately (single-use)
    await otpRef.delete();

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error("[verify-otp] Error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
