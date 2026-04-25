import React from "react";
import {
  Wallet,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  Briefcase,
} from "lucide-react";

interface ActivityItemProps {
  type: "escrow" | "milestone" | "message" | "payment" | "consultation";
  title: string;
  subtitle: string;
  time: string;
}

const typeConfig: Record<
  ActivityItemProps["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  escrow: { icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
  milestone: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  message: { icon: MessageCircle, color: "text-violet-600", bg: "bg-violet-50" },
  payment: { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
  consultation: { icon: Briefcase, color: "text-rose-600", bg: "bg-rose-50" },
};

export default function ActivityItem({
  type,
  title,
  subtitle,
  time,
}: ActivityItemProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
      >
        <Icon size={18} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-muted truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
        {time}
      </span>
    </div>
  );
}
