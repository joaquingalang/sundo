import React from "react";

interface ChatBubbleProps {
  text: string;
  timestamp: string;
  isUser: boolean;
}

export default function ChatBubble({
  text,
  timestamp,
  isUser,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`
          max-w-[80%] px-4 py-2.5 rounded-2xl
          ${
            isUser
              ? "bg-primary text-white rounded-br-md"
              : "bg-white border border-border-light text-text-primary rounded-bl-md"
          }
        `}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser ? "text-white/60" : "text-text-muted"
          }`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}
