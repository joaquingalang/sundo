"use client";

import { useState } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { AppointmentMetadata } from "@/types";
import { cn } from "@/lib/cn";

interface AppointmentRequestCardProps {
  messageId: string;
  engagementId: string;
  metadata: AppointmentMetadata;
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

const STATUS_STYLES = {
  pending: "border-desert/30 bg-desert/5",
  approved: "border-green-200 bg-green-50",
  declined: "border-rhino/10 bg-rhino/5 opacity-70",
};

const STATUS_BADGE = {
  pending: "text-desert bg-desert/10",
  approved: "text-green-600 bg-green-100",
  declined: "text-rhino/40 bg-rhino/10",
};

export function AppointmentRequestCard({
  messageId,
  engagementId,
  metadata,
}: AppointmentRequestCardProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [localStatus, setLocalStatus] = useState(metadata.status);

  const currentUid = auth.currentUser?.uid;
  const isProposer = metadata.proposedBy === currentUid;
  const canRespond = !isProposer && localStatus === "pending";

  async function getToken() {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    return user.getIdToken();
  }

  async function handleAccept() {
    setLoading("accept");
    try {
      const token = await getToken();
      const res = await fetch("/api/meet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ engagementId, messageId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create meeting");
      }

      setLocalStatus("approved");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleDecline() {
    setLoading("decline");
    try {
      const token = await getToken();
      const res = await fetch("/api/meet/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ engagementId, messageId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to decline");
      }

      setLocalStatus("declined");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={cn(
        "max-w-sm w-full rounded-3xl p-6 border shadow-md space-y-4",
        STATUS_STYLES[localStatus]
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-akaroa/10 flex items-center justify-center text-desert shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-heading font-bold text-rhino text-sm">Appointment Request</p>
            <p className="text-[10px] text-rhino/40 font-body">
              {isProposer ? "Waiting for response" : "Respond to request"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
            STATUS_BADGE[localStatus]
          )}
        >
          {localStatus}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm font-body text-rhino/70">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rhino/30 shrink-0" />
          <span>{formatDateTime(metadata.proposedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rhino/30 shrink-0" />
          <span>{formatDuration(metadata.durationMinutes)}</span>
        </div>
        {metadata.note && (
          <p className="italic text-rhino/50 pl-6">&ldquo;{metadata.note}&rdquo;</p>
        )}
      </div>

      {/* Actions — only visible to non-proposer when pending */}
      {canRespond && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleAccept}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rhino text-white text-xs font-bold font-body hover:bg-rhino/90 disabled:opacity-50 transition-all"
          >
            {loading === "accept" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rhino/20 text-rhino text-xs font-bold font-body hover:bg-rhino/5 disabled:opacity-50 transition-all"
          >
            {loading === "decline" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
