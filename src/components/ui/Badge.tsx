import React from "react";

type BadgeStatus = "active" | "pending" | "completed" | "on-hold" | "processing";

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig: Record<BadgeStatus, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Active" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
  "on-hold": { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: "On Hold" },
  processing: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", label: "Processing" },
};

export default function Badge({ status, className = "" }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-xs font-medium
        ${config.bg} ${config.text}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
