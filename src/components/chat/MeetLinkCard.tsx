"use client";

import { Video, Calendar, Clock, ExternalLink } from "lucide-react";

interface MeetLinkCardProps {
  meetLink: string;
  scheduledAt?: string;
  durationMinutes?: number;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-PH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function MeetLinkCard({ meetLink, scheduledAt, durationMinutes }: MeetLinkCardProps) {
  return (
    <div className="max-w-sm w-full rounded-3xl p-6 border border-green-200 bg-green-50 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-green-200 flex items-center justify-center text-green-600 shadow-sm">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <p className="font-heading font-bold text-rhino text-sm">Meeting Confirmed</p>
          <p className="text-[10px] text-rhino/40 font-body">Google Meet link is ready</p>
        </div>
      </div>

      {/* Details */}
      {(scheduledAt || durationMinutes) && (
        <div className="space-y-2 text-sm font-body text-rhino/70">
          {scheduledAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rhino/30 shrink-0" />
              <span>{formatDateTime(scheduledAt)}</span>
            </div>
          )}
          {durationMinutes && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rhino/30 shrink-0" />
              <span>{formatDuration(durationMinutes)}</span>
            </div>
          )}
        </div>
      )}

      {/* Join button */}
      <a
        href={meetLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rhino text-white text-sm font-bold font-body hover:bg-rhino/90 transition-all"
      >
        <Video className="w-4 h-4" />
        Join Google Meet
        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
      </a>
    </div>
  );
}
