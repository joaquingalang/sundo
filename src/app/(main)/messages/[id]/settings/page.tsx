"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MailOpen,
  Star,
  Archive,
  BellOff,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { conversations } from "@/lib/mock-data";

const actions = [
  { icon: MailOpen, label: "Mark as unread", color: "text-text-secondary" },
  { icon: Star, label: "Star", color: "text-text-secondary" },
  { icon: Archive, label: "Archive", color: "text-text-secondary" },
  { icon: BellOff, label: "Mute this conversation", color: "text-text-secondary" },
];

export default function ConversationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const conversation = conversations.find((c) => c.id === params.id);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface animate-fade-in">
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
            Conversation Settings
          </h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto">
        {/* Profile Card */}
        <Card className="flex flex-col items-center text-center !p-6 mb-4">
          <Avatar name={conversation.name} size="xl" online={conversation.isOnline} />
          <h2 className="text-lg font-bold text-text-primary mt-3">
            {conversation.name}
          </h2>
          <p className="text-sm text-text-muted mt-0.5">{conversation.status}</p>
        </Card>

        {/* Actions */}
        <Card className="!p-0 mb-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className={`
                  w-full flex items-center gap-3 px-5 py-3.5
                  hover:bg-surface transition-colors text-left cursor-pointer
                  ${index < actions.length - 1 ? "border-b border-border-light" : ""}
                `}
              >
                <Icon size={18} className={action.color} />
                <span className="text-sm font-medium text-text-primary">
                  {action.label}
                </span>
              </button>
            );
          })}
        </Card>

        {/* Support & safety */}
        <div className="border-t border-border pt-4 mt-2">
          <button className="flex items-center gap-3 px-1 py-2 hover:opacity-70 transition-opacity cursor-pointer">
            <HelpCircle size={18} className="text-primary" />
            <span className="text-sm font-medium text-primary">Support</span>
          </button>

          <div className="flex items-start gap-3 mt-4 p-4 bg-blue-50/50 rounded-xl">
            <ShieldCheck size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                Things to keep in mind
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                All payments are secured through Sundo Escrow. Never share
                personal financial information directly in chat. Verify
                milestones before approving fund releases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
