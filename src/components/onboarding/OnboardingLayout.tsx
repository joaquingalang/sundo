"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  steps,
  title,
  subtitle,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="h-screen flex bg-[#fdfbf7] overflow-hidden">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 flex-col justify-between p-12 bg-rhino h-full overflow-hidden">
        <Link
          href="/"
          className="font-heading text-2xl font-bold text-white tracking-tight"
        >
          Sundo
        </Link>

        <div className="flex flex-col gap-8">
          <p className="font-heading text-white/70 text-lg leading-snug">
            Step {currentStep} of {totalSteps}
          </p>
          <VerticalStepProgress currentStep={currentStep} steps={steps} />
        </div>

        <p className="text-white/30 text-xs font-body">
          &copy; {new Date().getFullYear()} Sundo. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
          {/* Mobile logo + step count */}
          <div className="lg:hidden w-full max-w-[560px] flex items-center justify-between mb-8">
            <Link
              href="/"
              className="font-heading text-xl font-bold text-rhino tracking-tight"
            >
              Sundo
            </Link>
            <span className="text-sm font-body text-sandstone">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {/* Mobile horizontal step progress */}
          <div className="lg:hidden w-full max-w-[560px] mb-8">
            <HorizontalStepProgress currentStep={currentStep} steps={steps} />
          </div>

          <div className="w-full max-w-[560px]">
            <div className="mb-8">
              <h1 className="font-heading text-[2rem] font-bold text-foreground leading-tight mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="font-body text-[#393939] text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerticalStepProgress({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={step} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium font-body border-2 shrink-0 transition-all",
                  isComplete && "bg-white/20 border-white/40 text-white",
                  isCurrent && "bg-white border-white text-rhino",
                  !isComplete &&
                    !isCurrent &&
                    "bg-transparent border-white/20 text-white/30"
                )}
              >
                {isComplete ? <SmallCheckIcon /> : stepNum}
              </div>
              {stepNum < steps.length && (
                <div
                  className={cn(
                    "w-0.5 my-1.5",
                    "h-8",
                    isComplete ? "bg-white/30" : "bg-white/10"
                  )}
                />
              )}
            </div>
            <div className="pt-0.5 pb-2">
              <span
                className={cn(
                  "text-sm font-body leading-none",
                  isCurrent && "text-white font-semibold",
                  isComplete && "text-white/50",
                  !isComplete && !isCurrent && "text-white/25"
                )}
              >
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalStepProgress({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((_, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full flex-1 transition-all duration-300",
              isComplete && "bg-rhino",
              isCurrent && "bg-rhino/50",
              !isComplete && !isCurrent && "bg-akaroa/40"
            )}
          />
        );
      })}
    </div>
  );
}

function SmallCheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
