# 09 — Communication System
### SUNDO: Project Context Document

---

## Overview

Sundo's communication system has three components:

| Component | Purpose | When Available |
|---|---|---|
| **In-App Chat** | Ongoing text + file messaging between OFW and Consultant | After escrow is funded |
| **Google Meet (Programmatic)** | Video consultation link generated automatically on booking | After escrow is funded |
| **Document Vault** | Shared file repository per engagement | After escrow is funded |

All three are scoped to a specific Engagement — there is no global inbox or cross-engagement communication.

---

## In-App Chat

### Architecture

Chat is built on Firestore real-time listeners. Messages are stored in the `engagements/{engagementId}/messages` sub-collection and streamed to the client via `onSnapshot`.

```ts
// src/hooks/useEngagementChat.ts

import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';

export function useEngagementChat(engagementId: string) {
  const [messages, setMessages] = useState<MessageDocument[]>([]);

  useEffect(() => {
    const messagesRef = collection(db, 'engagements', engagementId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs as MessageDocument[]);
    });

    return () => unsubscribe();
  }, [engagementId]);

  const sendMessage = async (content: string, type: MessageType = 'text') => {
    const messagesRef = collection(db, 'engagements', engagementId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      senderRole: currentUser.role,
      type,
      content,
      createdAt: serverTimestamp(),
    });
  };

  return { messages, sendMessage };
}
```

### Message Types

| Type | Rendered As | Sent By |
|---|---|---|
| `text` | Standard chat bubble | Both parties |
| `file` | File attachment card with download link | Both parties |
| `meet_link` | Meet Link Card (see Section 06) | System (Cloud Function) |
| `milestone_update` | Milestone Progress Card | System (Cloud Function) |
| `system` | Neutral system announcement | System (Cloud Function) |

### Access Rules

- Chat is **only accessible** after `engagement.status === 'escrow_funded'` or later
- OFWs can only read/write to engagements where `ofwId === currentUser.uid`
- Consultants can only read/write to engagements where `consultantId === currentUser.uid`
- Enforced in both Firestore Security Rules and the chat component's route guard

### UI Location
`/engagements/[engagementId]/chat`

The chat page layout:
```
┌────────────────────────────────────────────┐
│ [← Back]  Engagement with Carlo Reyes      │
│           Business Registration Project    │
├────────────────────────────────────────────┤
│                                            │
│  [System Card: Escrow Funded — ₱21,000]   │
│                                            │
│  [Meet Link Card: Apr 20 at 2:00 PM]      │
│                             [Join Meet ↗] │
│                                            │
│  Carlo: Hello po! Ready na ako.            │
│                                            │
│  You: Salamat! Excited na rin po.          │
│                                            │
│  [Milestone Card: Phase 1 Submitted]       │
│                          [View Details]   │
│                                            │
├────────────────────────────────────────────┤
│ [📎] [Type a message...]        [Send ↑]  │
└────────────────────────────────────────────┘
```

---

## Google Meet Integration

### Why Programmatic Meet Links?

Consultants should not have to manually create Google Meet links and paste them into chat. This introduces friction, inconsistency, and the risk of sharing wrong links. Sundo generates a Meet link automatically the moment escrow is funded.

### Technical Approach: Google Calendar API + Service Account

Sundo uses a **Google Workspace service account** with domain-wide delegation (or a standalone service account with Calendar API access) to create calendar events programmatically. Each event has Google Meet conferencing enabled, which returns a `hangoutLink`.

The meeting is hosted by the Sundo service account. Both the OFW and Consultant join as external guests — they do not need a Google account to join (Meet supports guest join links).

### Cloud Function: `generateMeetLink`

```ts
// functions/src/handlers/generateMeetLink.ts

import { google } from 'googleapis';

async function generateMeetLink(engagement: EngagementDocument): Promise<string> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const scheduledAt = engagement.session?.scheduledAt
    ?? engagement.project?.milestones[0]?.submittedAt
    ?? new Date();

  const endTime = new Date(scheduledAt);
  endTime.setHours(endTime.getHours() + 1); // Default 1-hour block for Meet

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Sundo Consultation — ${engagement.category}`,
      description: `Engagement ID: ${engagement.id}\nOFW: ${engagement.ofwName}\nConsultant: ${engagement.consultantName}`,
      start: {
        dateTime: scheduledAt.toISOString(),
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Manila',
      },
      conferenceData: {
        createRequest: {
          requestId: engagement.id,              // Idempotency key
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      attendees: [
        { email: engagement.ofwEmail },
        { email: engagement.consultantEmail },
      ],
      guestsCanModifyEvent: false,
      guestsCanInviteOthers: false,
    },
  });

  const meetLink = event.data.hangoutLink;
  const eventId = event.data.id;

  // Store in Firestore
  await db.collection('engagements').doc(engagement.id).update({
    meetLink,
    meetEventId: eventId,
  });

  // Post as a system message in chat
  await db.collection('engagements').doc(engagement.id)
    .collection('messages').add({
      senderId: 'system',
      senderRole: 'system',
      type: 'meet_link',
      content: meetLink,
      metadata: {
        scheduledAt: scheduledAt.toISOString(),
        eventId,
      },
      createdAt: new Date(),
    });

  return meetLink;
}
```

### When is the Meet Link Generated?

| Trigger | Timing |
|---|---|
| Session Mode | Immediately after `PaymentIntent` succeeds (escrow funded) |
| Project Mode | After contract signing + escrow funding (triggers kick-off meeting link for Phase 1) |
| Subsequent phases | Consultant can request a new Meet link per milestone via a "Schedule Meeting" button |

### Where Does the Meet Link Appear?

1. **Engagement Overview page** — prominent card at the top
2. **Chat** — as a system message card
3. **Email notification** — sent to both parties on booking confirmation

---

## Document Vault

### Purpose
A shared file repository where both the OFW and Consultant can upload, store, and access files relevant to their engagement. This replaces ad-hoc WhatsApp/email file sharing with a structured, auditable record.

### Use Cases
- Consultant uploads: deliverable documents, templates, government forms, contracts
- OFW uploads: personal documents needed for the project (e.g., proof of income for business registration), feedback forms, signed certificates of acceptance
- Both: any reference materials discussed during sessions

### Architecture

Files are stored in Firebase Storage at:
```
engagements/{engagementId}/vault/{fileId}_{filename}
```

Vault file metadata is stored in the `engagements/{engagementId}/vault` Firestore sub-collection.

```ts
// src/hooks/useVault.ts

export function useVault(engagementId: string) {
  const [files, setFiles] = useState<VaultFileDocument[]>([]);

  // Real-time listener for vault files
  useEffect(() => {
    const vaultRef = collection(db, 'engagements', engagementId, 'vault');
    const q = query(vaultRef, orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })) as VaultFileDocument[]);
    });
    return () => unsubscribe();
  }, [engagementId]);

  const uploadFile = async (file: File, description?: string) => {
    const fileId = crypto.randomUUID();
    const storagePath = `engagements/${engagementId}/vault/${fileId}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'engagements', engagementId, 'vault'), {
      uploadedBy: currentUser.uid,
      uploaderRole: currentUser.role,
      fileName: file.name,
      fileUrl,
      storagePath,
      fileSize: file.size,
      mimeType: file.type,
      description: description ?? '',
      uploadedAt: serverTimestamp(),
    });
  };

  return { files, uploadFile };
}
```

### UI Location
`/engagements/[engagementId]/vault`

```
┌────────────────────────────────────────────┐
│ Engagement Vault                           │
│ Business Registration — Carlo Reyes        │
├────────────────────────────────────────────┤
│ [+ Upload File]                            │
│                                            │
│ 📄 DTI_Registration_Certificate.pdf        │
│    Uploaded by Carlo · Apr 18 · 1.2 MB    │
│    "Official DTI cert for your store"     │
│    [Download ↓]                           │
│                                            │
│ 📷 Barangay_Clearance.jpg                 │
│    Uploaded by You · Apr 16 · 890 KB      │
│    [Download ↓]                           │
│                                            │
│ 📄 Business_Permit_Application_Form.pdf   │
│    Uploaded by Carlo · Apr 15 · 450 KB    │
│    "Fill this out before our next call"   │
│    [Download ↓]                           │
└────────────────────────────────────────────┘
```

### File Constraints

| Parameter | Limit |
|---|---|
| Max file size | 25 MB per file |
| Accepted types | PDF, JPEG, PNG, DOCX, XLSX, MP4 (for training recordings) |
| Max files per vault | 50 (enforced in Firestore Security Rules) |
| Retention | Files persist for the lifetime of the engagement + 90 days after completion |

---

## Notification System

In-app and email notifications are sent at key engagement events. Notifications are stored in a `users/{uid}/notifications` sub-collection and read in real-time.

| Event | OFW Notified | Consultant Notified |
|---|---|---|
| Booking request received | ❌ | ✅ |
| Consultant accepts booking | ✅ | ❌ |
| Escrow funded | ✅ | ✅ |
| Meet link generated | ✅ | ✅ |
| Milestone submitted | ✅ | ❌ |
| AI: Milestone approved | ✅ | ✅ |
| AI: Milestone rejected | ✅ | ✅ |
| AI: Manual review triggered | ❌ (just "under review") | ❌ |
| Dispute raised | ❌ | ✅ |
| Dispute resolved | ✅ | ✅ |
| Payout released | ❌ | ✅ |
| Project completed | ✅ | ✅ |
| Review received | ❌ | ✅ |
| Verification approved | ✅ | ✅ |

---

*← [08 — AI Integration](./08-ai-integration.md) | Next: [10 — Admin Panel →](./10-admin-panel.md)*
