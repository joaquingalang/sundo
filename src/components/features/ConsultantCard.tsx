import React from "react";
import Avatar from "@/components/ui/Avatar";
import { Star } from "lucide-react";
import type { Consultant } from "@/lib/mock-data";

interface ConsultantCardProps {
  consultant: Consultant;
}

export default function ConsultantCard({ consultant }: ConsultantCardProps) {
  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-2xl border border-border-light p-4 flex flex-col items-center gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <Avatar name={consultant.name} size="lg" online={consultant.isOnline} />
      <div className="text-center w-full">
        <p className="text-sm font-semibold text-text-primary truncate">
          {consultant.name}
        </p>
        <p className="text-xs text-text-muted truncate mt-0.5">
          {consultant.specialty}
        </p>
      </div>
      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
        <Star size={12} className="text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold text-amber-700">
          {consultant.rating}
        </span>
      </div>
    </div>
  );
}
