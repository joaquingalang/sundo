"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import ChatPreview from "@/components/features/ChatPreview";
import { conversations } from "@/lib/mock-data";

const filters = ["All", "Unread", "Archived"];

export default function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredConversations =
    activeFilter === "Unread"
      ? conversations.filter((c) => c.unreadCount > 0)
      : conversations;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2 md:pt-8">
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <button className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors cursor-pointer">
          <Search size={20} className="text-text-secondary" />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-4 py-1.5 rounded-full text-xs font-semibold
              whitespace-nowrap transition-all duration-200 cursor-pointer
              ${
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="divide-y divide-border-light">
        {filteredConversations.map((conversation) => (
          <ChatPreview key={conversation.id} conversation={conversation} />
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-5">
          <p className="text-text-muted text-sm">No messages found</p>
        </div>
      )}
    </div>
  );
}
