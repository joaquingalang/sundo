"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Calendar, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ReceiptPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Title */}
        <h1 className="text-lg font-bold text-text-primary text-center mb-8">
          Payment
        </h1>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 size={56} className="text-success" />
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary">
            Payment Successful
          </h2>
          <p className="text-sm text-text-muted mt-2 font-mono">
            TXN-2025-0847-A3F2
          </p>
        </div>

        {/* Summary Card */}
        <Card className="!p-5 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Wallet size={16} />
                <span className="text-sm">Payment Amount</span>
              </div>
              <span className="text-sm font-bold text-text-primary">
                ₱5,000.00
              </span>
            </div>
            <div className="h-px bg-border-light" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={16} />
                <span className="text-sm">Payment Date</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                Apr 25, 2025
              </span>
            </div>
            <div className="h-px bg-border-light" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <CreditCard size={16} />
                <span className="text-sm">Payment Method</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                GCash
              </span>
            </div>
          </div>
        </Card>

        {/* Back button */}
        <Button
          fullWidth
          size="lg"
          onClick={() => router.push("/dashboard")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
