"use client";

import { cn } from "@/lib/cn";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  hint?: string;
  readOnly?: boolean;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  readOnly = false,
}: MultiSelectProps) {
  function toggle(optValue: string) {
    if (readOnly) return;
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground font-body">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={readOnly}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-body font-medium transition-all",
                "border focus:outline-none focus-visible:ring-2 focus-visible:ring-rhino focus-visible:ring-offset-1",
                selected
                  ? "bg-rhino border-rhino text-white shadow-sm"
                  : "bg-white border-akaroa text-foreground hover:border-rhino/50 hover:bg-rhino/5",
                readOnly && "cursor-default opacity-80"
              )}
            >
              {selected && !readOnly && (
                <span className="mr-1 opacity-75">✓</span>
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
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
