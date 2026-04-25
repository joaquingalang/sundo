import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await adminDb.collection("otp_codes").doc(email).set({ pin, expiresAt });

    // Hackathon mock — log the PIN to the server console for easy testing
    console.log(`[OTP] Code for ${email}: ${pin}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[request-otp] Error:", error);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}
