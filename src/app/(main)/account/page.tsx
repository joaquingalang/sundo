"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { currentUser } from "@/lib/mock-data";

const settingsItems = [
  { icon: User, label: "Personal Information", href: "#" },
  { icon: Shield, label: "Security", href: "#" },
  { icon: HelpCircle, label: "Help & Support", href: "#" },
];

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 md:pt-8">
        <h1 className="text-2xl font-bold text-text-primary">Account</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-6">
        <Card className="flex flex-col items-center text-center !p-6">
          <Avatar name={currentUser.name} size="xl" />
          <h2 className="text-lg font-bold text-text-primary mt-3">
            {currentUser.name}
          </h2>
          <p className="text-sm text-text-muted mt-0.5">{currentUser.email}</p>
        </Card>
      </div>

      {/* Settings */}
      <div className="px-5 mb-6">
        <Card className="!p-0">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`
                  w-full flex items-center gap-3 px-5 py-4
                  hover:bg-surface transition-colors text-left cursor-pointer
                  ${index < settingsItems.length - 1 ? "border-b border-border-light" : ""}
                `}
              >
                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-text-secondary" />
                </div>
                <span className="flex-1 text-sm font-medium text-text-primary">
                  {item.label}
                </span>
                <ChevronRight size={16} className="text-text-muted" />
              </button>
            );
          })}
        </Card>
      </div>

      {/* Logout */}
      <div className="px-5 mb-8">
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 py-3 text-danger font-semibold text-sm hover:bg-danger-light rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
