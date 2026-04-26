import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyAuth(req);
    const { engagementId, messageId } = await req.json();

    if (!engagementId || !messageId) {
      return NextResponse.json({ error: "engagementId and messageId are required" }, { status: 400 });
    }

    const engagementSnap = await adminDb.collection("engagements").doc(engagementId).get();

    if (!engagementSnap.exists) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    const engagement = engagementSnap.data()!;

    if (decoded.uid !== engagement.ofwId && decoded.uid !== engagement.consultantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messageRef = adminDb
      .collection("engagements")
      .doc(engagementId)
      .collection("messages")
      .doc(messageId);

    const messageSnap = await messageRef.get();

    if (!messageSnap.exists) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const messageData = messageSnap.data()!;

    if (messageData.type !== "appointment_request") {
      return NextResponse.json({ error: "Message is not an appointment request" }, { status: 400 });
    }

    if (messageData.metadata?.status !== "pending") {
      return NextResponse.json({ error: "Appointment is no longer pending" }, { status: 409 });
    }

    // Only the non-proposer can decline
    if (messageData.metadata?.proposedBy === decoded.uid) {
      return NextResponse.json({ error: "You cannot decline your own appointment request" }, { status: 403 });
    }

    await messageRef.update({ "metadata.status": "declined" });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
