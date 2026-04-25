"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import type { Conversation } from "@/lib/mock-data";

interface ChatPreviewProps {
  conversation: Conversation;
}

export default function ChatPreview({ conversation }: ChatPreviewProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/messages/${conversation.id}`)}
      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface transition-colors duration-150 text-left cursor-pointer"
    >
      <Avatar
        name={conversation.name}
        size="lg"
        online={conversation.isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary truncate">
            {conversation.name}
          </p>
          <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">
            {conversation.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-text-muted truncate">
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {conversation.unreadCount}
              </span>
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-muted/70 mt-0.5">
          {conversation.status}
        </p>
      </div>
    </button>
  );
}
