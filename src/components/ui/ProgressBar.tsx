import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
}

export default function ProgressBar({ value, className = "" }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
