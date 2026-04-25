"use client";

import React from "react";
import { Bell, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConsultantCard from "@/components/features/ConsultantCard";
import ActivityItem from "@/components/features/ActivityItem";
import { currentUser, consultants, activityFeed } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 md:pt-8">
        <div>
          <p className="text-sm text-text-muted">Welcome back,</p>
          <h1 className="text-2xl font-bold text-text-primary">
            Hello, {currentUser.name.split(" ")[0]} 👋
          </h1>
        </div>
        <button className="relative w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors cursor-pointer">
          <Bell size={20} className="text-text-secondary" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface" />
        </button>
      </div>

      {/* Escrow Balance Card */}
      <div className="px-5 mb-6">
        <Card variant="gradient" className="relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <p className="text-sm text-white/70 font-medium">Total Escrow Balance</p>
            <p className="text-3xl font-bold text-white mt-1">
              {currentUser.currency}
              {currentUser.escrowBalance.toLocaleString()}.00
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="!border-white/30 !text-white hover:!bg-white/10"
              >
                <Plus size={16} />
                Fund Wallet
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommended Consultants */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-base font-bold text-text-primary">
            Recommended Consultants
          </h2>
          <button className="text-xs text-primary font-semibold cursor-pointer">
            See All
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 scrollbar-hide">
          {consultants.map((consultant) => (
            <ConsultantCard key={consultant.id} consultant={consultant} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">
            Recent Activity
          </h2>
          <button className="text-xs text-primary font-semibold cursor-pointer">
            View All
          </button>
        </div>
        <Card className="!p-0 divide-y divide-border-light">
          <div className="px-4">
            {activityFeed.map((activity) => (
              <ActivityItem
                key={activity.id}
                type={activity.type}
                title={activity.title}
                subtitle={activity.subtitle}
                time={activity.time}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
