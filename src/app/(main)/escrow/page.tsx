"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import TransactionItem from "@/components/features/TransactionItem";
import { currentUser, escrowTransactions } from "@/lib/mock-data";

export default function EscrowPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 md:pt-8">
        <h1 className="text-2xl font-bold text-text-primary">Escrow Wallet</h1>
        <p className="text-sm text-text-muted mt-1">
          Your funds are protected by Sundo Escrow
        </p>
      </div>

      {/* Balance Card */}
      <div className="px-5 py-4">
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70 font-medium">
                Total Protected Funds
              </p>
              <p className="text-3xl font-bold text-white mt-1">
                {currentUser.currency}
                {currentUser.escrowBalance.toLocaleString()}.00
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="px-5">
        <h2 className="text-base font-bold text-text-primary mb-2">
          Transaction History
        </h2>
        <Card className="!p-0 !px-4 divide-y divide-border-light">
          {escrowTransactions.map((txn) => (
            <TransactionItem key={txn.id} transaction={txn} />
          ))}
        </Card>
      </div>
    </div>
  );
}
