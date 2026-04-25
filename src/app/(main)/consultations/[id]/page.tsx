"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Timeline from "@/components/ui/Timeline";
import { consultations } from "@/lib/mock-data";

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const consultation = consultations.find((c) => c.id === params.id);

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Consultation not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative h-44 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors cursor-pointer z-10"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 -mt-10 relative z-10">
        {/* Header card */}
        <Card className="!p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={consultation.consultantName} size="lg" />
            <div>
              <h1 className="text-lg font-bold text-text-primary">
                {consultation.consultantName}
              </h1>
              <p className="text-sm text-text-muted">{consultation.title}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Order ID: <span className="font-mono font-medium">{consultation.orderId}</span>
          </p>
        </Card>

        {/* Transaction Details */}
        <Card className="!p-5 mb-4">
          <h2 className="text-sm font-bold text-text-primary mb-3">
            Transaction Details
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={14} />
                <span className="text-xs">Start Date</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {consultation.startDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <DollarSign size={14} />
                <span className="text-xs">Total Cost</span>
              </div>
              <span className="text-sm font-bold text-text-primary">
                ₱{consultation.totalCost.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Status</span>
              <Badge status={consultation.status} />
            </div>
          </div>
        </Card>

        {/* Milestone Journey */}
        <Card className="!p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-4">
            Milestone Journey
          </h2>
          <Timeline steps={consultation.milestones} />
        </Card>
      </div>
    </div>
  );
}
