import React from "react";
import { Check, Clock, Circle } from "lucide-react";

export interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "pending";
  date?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export default function Timeline({ steps, className = "" }: TimelineProps) {
  return (
    <div className={`relative ${className}`}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-4">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={`
                  absolute left-[15px] top-[32px] w-0.5 bottom-0
                  ${step.status === "completed" ? "bg-success" : "bg-border"}
                `}
              />
            )}

            {/* Step icon */}
            <div className="relative z-10 flex-shrink-0 mt-0.5">
              {step.status === "completed" ? (
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              ) : step.status === "active" ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse-dot">
                  <Clock size={16} className="text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <Circle size={14} className="text-text-muted" />
                </div>
              )}
            </div>

            {/* Step content */}
            <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-semibold ${
                    step.status === "pending" ? "text-text-muted" : "text-text-primary"
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-xs text-text-muted">{step.date}</span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  step.status === "pending" ? "text-text-muted/70" : "text-text-secondary"
                }`}
              >
                {step.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
