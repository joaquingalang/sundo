import { google } from "googleapis";

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth env vars: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN"
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export interface CreateMeetEventParams {
  engagementId: string;
  title: string;
  proposedAt: string;
  durationMinutes: number;
  ofwEmail: string;
  consultantEmail: string;
}

export async function createMeetEvent(
  params: CreateMeetEventParams
): Promise<{ meetLink: string; eventId: string }> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const startTime = new Date(params.proposedAt);
  const endTime = new Date(startTime.getTime() + params.durationMinutes * 60_000);

  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: `Sundo Consultation — ${params.title}`,
      description: `Engagement ID: ${params.engagementId}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Asia/Manila",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Asia/Manila",
      },
      conferenceData: {
        createRequest: {
          requestId: `${params.engagementId}-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: [
        { email: params.ofwEmail },
        { email: params.consultantEmail },
      ],
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
    },
  });

  const meetLink = response.data.hangoutLink;
  const eventId = response.data.id;

  if (!meetLink || !eventId) {
    throw new Error("Google Calendar API did not return a Meet link.");
  }

  return { meetLink, eventId };
}
