"use client";

import { useState } from "react";
import { CalendarPlus, X, ChevronDown } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { cn } from "@/lib/cn";

interface ScheduleMeetingButtonProps {
  engagementId: string;
}

const DURATION_OPTIONS = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
];

export function ScheduleMeetingButton({ engagementId }: ScheduleMeetingButtonProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Build a local datetime minimum of "now"
  const nowLocal = new Date();
  const minDate = nowLocal.toISOString().split("T")[0];

  async function handleSubmit() {
    if (!date || !time || !auth.currentUser) return;

    setLoading(true);
    try {
      const proposedAt = new Date(`${date}T${time}:00`).toISOString();

      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        engagementId,
        senderId: auth.currentUser.uid,
        type: "appointment_request",
        content: "",
        metadata: {
          proposedAt,
          durationMinutes,
          note: note.trim() || null,
          status: "pending",
          proposedBy: auth.currentUser.uid,
        },
        createdAt: serverTimestamp(),
      });

      setOpen(false);
      setDate("");
      setTime("");
      setDurationMinutes(60);
      setNote("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-3 rounded-xl hover:bg-white text-rhino/40 hover:text-rhino transition-all"
        title="Schedule a meeting"
      >
        <CalendarPlus className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-14 left-0 w-80 bg-white rounded-3xl border border-akaroa/20 shadow-xl p-6 space-y-4 z-50">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-rhino text-sm">Schedule a Meeting</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-rhino/30 hover:text-rhino transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Intentionally NOT a <form> — this panel lives inside the chat's <form> */}
          <div className="space-y-3">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-rhino/40 font-body">
                Date
              </label>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-akaroa/20 bg-rhino/5 text-sm font-body text-rhino outline-none focus:ring-2 focus:ring-rhino/10"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-rhino/40 font-body">
                Time (PHT)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-akaroa/20 bg-rhino/5 text-sm font-body text-rhino outline-none focus:ring-2 focus:ring-rhino/10"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-rhino/40 font-body">
                Duration
              </label>
              <div className="relative">
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-akaroa/20 bg-rhino/5 text-sm font-body text-rhino outline-none focus:ring-2 focus:ring-rhino/10 appearance-none"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rhino/30 pointer-events-none" />
              </div>
            </div>

            {/* Optional note */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-rhino/40 font-body">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Let's discuss Phase 1 documents"
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-xl border border-akaroa/20 bg-rhino/5 text-sm font-body text-rhino outline-none focus:ring-2 focus:ring-rhino/10 placeholder:text-rhino/20"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !date || !time}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-bold font-body transition-all",
                loading || !date || !time
                  ? "bg-rhino/10 text-rhino/30 cursor-not-allowed"
                  : "bg-rhino text-white hover:bg-rhino/90"
              )}
            >
              {loading ? "Sending…" : "Send Appointment Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
