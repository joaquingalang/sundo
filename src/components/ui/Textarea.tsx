"use client";

import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={textareaId}
        className="text-sm font-medium text-foreground font-body"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          "w-full px-4 py-3 rounded-lg border font-body text-foreground bg-white",
          "placeholder:text-sandstone text-sm resize-none",
          "transition-shadow focus:outline-none focus:ring-2 focus:ring-rhino focus:ring-offset-0 focus:border-transparent",
          error ? "border-red-400" : "border-akaroa",
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-sandstone font-body">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-body" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
