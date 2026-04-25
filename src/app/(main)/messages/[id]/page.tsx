"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Info, Plus, Send } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ChatBubble from "@/components/features/ChatBubble";
import { conversations, chatMessages } from "@/lib/mock-data";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chatMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === params.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-muted">Conversation not found</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        senderId: "usr_001",
        text: message.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        isUser: true,
      },
    ]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-dvh md:h-[calc(100dvh)] bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-border-light px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface transition-colors cursor-pointer md:hidden"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <Avatar name={conversation.name} size="md" online={conversation.isOnline} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary">
              {conversation.name}
            </p>
            <p className="text-[11px] text-text-muted">
              Avg response time: 1 hr
            </p>
          </div>
          <button
            onClick={() => router.push(`/messages/${params.id}/settings`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface transition-colors cursor-pointer"
          >
            <Info size={20} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            text={msg.text}
            timestamp={msg.timestamp}
            isUser={msg.isUser}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom input */}
      <div className="sticky bottom-0 glass border-t border-border-light px-4 py-3 pb-safe">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center hover:bg-border-light transition-colors cursor-pointer flex-shrink-0">
            <Plus size={20} className="text-text-secondary" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write a message..."
            className="flex-1 h-10 px-4 bg-white border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary-light disabled:opacity-40 transition-all cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
