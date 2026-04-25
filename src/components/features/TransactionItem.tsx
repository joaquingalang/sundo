"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { EscrowTransaction } from "@/lib/mock-data";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";

interface TransactionItemProps {
  transaction: EscrowTransaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const router = useRouter();
  const isPositive = transaction.amount > 0;

  const iconConfig = {
    fund: { icon: Plus, bg: "bg-emerald-50", color: "text-emerald-600" },
    lock: { icon: ArrowUpRight, bg: "bg-blue-50", color: "text-blue-600" },
    release: { icon: ArrowDownLeft, bg: "bg-amber-50", color: "text-amber-600" },
  };

  const config = iconConfig[transaction.type];
  const Icon = config.icon;

  return (
    <button
      onClick={() => router.push(`/escrow/${transaction.id}`)}
      className="w-full flex items-center gap-3 py-3.5 hover:bg-surface transition-colors duration-150 text-left cursor-pointer"
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
      >
        <Icon size={18} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">
          {transaction.description}
        </p>
        <p className="text-xs text-text-muted">{transaction.date}</p>
      </div>
      <span
        className={`text-sm font-bold flex-shrink-0 ${
          isPositive ? "text-emerald-600" : "text-text-primary"
        }`}
      >
        {isPositive ? "+" : ""}₱{Math.abs(transaction.amount).toLocaleString()}
      </span>
    </button>
  );
}
