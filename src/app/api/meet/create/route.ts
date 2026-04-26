import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAuth } from "@/lib/firebase/admin";
import { createMeetEvent } from "@/lib/google/calendar";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyAuth(req);
    const { engagementId, messageId } = await req.json();

    if (!engagementId || !messageId) {
      return NextResponse.json({ error: "engagementId and messageId are required" }, { status: 400 });
    }

    // Fetch engagement and verify the caller is a participant
    const engagementRef = adminDb.collection("engagements").doc(engagementId);
    const engagementSnap = await engagementRef.get();

    if (!engagementSnap.exists) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    const engagement = engagementSnap.data()!;

    if (decoded.uid !== engagement.ofwId && decoded.uid !== engagement.consultantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the appointment_request message
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

    // Only the non-proposer can accept
    if (messageData.metadata?.proposedBy === decoded.uid) {
      return NextResponse.json({ error: "You cannot accept your own appointment request" }, { status: 403 });
    }

    // Fetch both parties' emails for the calendar attendees list
    const [ofwSnap, consultantSnap] = await Promise.all([
      adminDb.collection("users").doc(engagement.ofwId).get(),
      adminDb.collection("users").doc(engagement.consultantId).get(),
    ]);

    const ofwEmail = (ofwSnap.data()?.email as string) ?? "";
    const consultantEmail = (consultantSnap.data()?.email as string) ?? "";

    // Create a real Google Meet link via Calendar API
    const { meetLink, eventId } = await createMeetEvent({
      engagementId,
      title: engagement.title ?? "Consultation",
      proposedAt: messageData.metadata.proposedAt as string,
      durationMinutes: (messageData.metadata.durationMinutes as number) ?? 60,
      ofwEmail,
      consultantEmail,
    });

    const now = FieldValue.serverTimestamp();

    // Approve the appointment message
    await messageRef.update({
      "metadata.status": "approved",
      "metadata.meetLink": meetLink,
      "metadata.meetEventId": eventId,
    });

    // Store the meet link on the engagement document
    await engagementRef.update({
      meetLink,
      meetEventId: eventId,
      updatedAt: now,
    });

    // Post a meet_link system message in chat
    await adminDb
      .collection("engagements")
      .doc(engagementId)
      .collection("messages")
      .add({
        engagementId,
        senderId: "system",
        senderRole: "system",
        type: "meet_link",
        content: meetLink,
        metadata: {
          scheduledAt: messageData.metadata.proposedAt,
          durationMinutes: messageData.metadata.durationMinutes ?? 60,
          eventId,
        },
        createdAt: now,
      });

    return NextResponse.json({ meetLink, eventId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[/api/meet/create]", err);
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
