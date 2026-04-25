"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-foreground font-body"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full h-11 px-4 pr-10 rounded-lg border font-body text-foreground bg-white appearance-none",
            "text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-rhino focus:ring-offset-0 focus:border-transparent",
            error ? "border-red-400" : "border-akaroa",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sandstone">
          <ChevronDownIcon />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-body" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
