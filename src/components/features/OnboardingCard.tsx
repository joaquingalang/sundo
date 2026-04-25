"use client";

import React from "react";

interface OnboardingCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function OnboardingCard({
  emoji,
  label,
  selected,
  onClick,
}: OnboardingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center
        gap-2.5 p-5 rounded-2xl
        border-2 transition-all duration-200 ease-out
        cursor-pointer select-none
        active:scale-[0.97]
        ${
          selected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border-light bg-white hover:border-text-muted hover:shadow-xs"
        }
      `}
    >
      <span className="text-3xl" role="img">
        {emoji}
      </span>
      <span
        className={`text-sm font-medium text-center leading-snug ${
          selected ? "text-primary" : "text-text-secondary"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
