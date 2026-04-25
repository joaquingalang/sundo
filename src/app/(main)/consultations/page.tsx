"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { consultations } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";

export default function ConsultationsPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 md:pt-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Active Consultations
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Track your ongoing projects and milestones
        </p>
      </div>

      {/* Consultation Cards */}
      <div className="px-5 flex flex-col gap-3">
        {consultations.map((consultation) => (
          <Card
            key={consultation.id}
            hoverable
            onClick={() => router.push(`/consultations/${consultation.id}`)}
            className="!p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={consultation.consultantName} size="md" />
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {consultation.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {consultation.consultantName}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-muted flex-shrink-0 mt-1" />
            </div>

            <div className="flex items-center justify-between mt-4">
              <Badge status={consultation.status} />
              <span className="text-xs text-text-muted">
                ₱{consultation.totalCost.toLocaleString()}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-muted font-medium">
                  Progress
                </span>
                <span className="text-[10px] text-text-muted font-medium">
                  {consultation.progress}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    consultation.status === "completed"
                      ? "bg-success"
                      : "bg-primary"
                  }`}
                  style={{ width: `${consultation.progress}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
