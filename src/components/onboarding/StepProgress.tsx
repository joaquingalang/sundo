"use client";

import { cn } from "@/lib/cn";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function StepProgress({ currentStep, totalSteps, steps }: StepProgressProps) {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={step} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium font-body border-2 transition-all duration-200",
                  isComplete && "bg-rhino border-rhino text-white",
                  isCurrent && "bg-white border-rhino text-rhino ring-4 ring-rhino/10",
                  !isComplete && !isCurrent && "bg-white border-akaroa text-sandstone"
                )}
              >
                {isComplete ? <CheckIcon /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-[11px] font-body whitespace-nowrap leading-tight text-center",
                  isCurrent && "text-rhino font-semibold",
                  isComplete && "text-sandstone",
                  !isComplete && !isCurrent && "text-sandstone/60"
                )}
              >
                {step}
              </span>
            </div>

            {stepNum < totalSteps && (
              <div
                className={cn(
                  "flex-1 h-0.5 mt-4 mx-2 transition-colors duration-300",
                  isComplete ? "bg-rhino" : "bg-akaroa/40"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
