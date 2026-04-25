"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Calendar, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Timeline from "@/components/ui/Timeline";
import { escrowTransactions } from "@/lib/mock-data";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transaction = escrowTransactions.find((t) => t.id === params.id);

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Transaction not found</p>
      </div>
    );
  }

  const isPositive = transaction.amount > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-border-light px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary">
            Transaction Details
          </h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto">
        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-sm text-text-muted mb-1">
            {transaction.description}
          </p>
          <p
            className={`text-3xl font-bold ${
              isPositive ? "text-success" : "text-text-primary"
            }`}
          >
            {isPositive ? "+" : "-"}₱
            {Math.abs(transaction.amount).toLocaleString()}
          </p>
          <div className="flex justify-center mt-3">
            <Badge status={transaction.status} />
          </div>
        </div>

        {/* Details */}
        <Card className="!p-5 mb-4">
          <h2 className="text-sm font-bold text-text-primary mb-3">
            Payment Details
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <CreditCard size={14} />
                <span className="text-xs">Payment Method</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {transaction.method || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={14} />
                <span className="text-xs">Date</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {transaction.date}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Clock size={14} />
                <span className="text-xs">Processing Time</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {transaction.processingTime || "N/A"}
              </span>
            </div>
          </div>
        </Card>

        {/* Release Timeline */}
        {transaction.releaseMilestones && (
          <Card className="!p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">
              Fund Release Status
            </h2>
            <Timeline steps={transaction.releaseMilestones} />
          </Card>
        )}
      </div>
    </div>
  );
}
