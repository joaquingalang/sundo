"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import OnboardingCard from "@/components/features/OnboardingCard";
import { onboardingQuestions } from "@/lib/mock-data";

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const totalSteps = onboardingQuestions.length;
  const question = onboardingQuestions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentSelections = selections[question.id] || [];
  const isLastStep = currentStep === totalSteps - 1;

  const toggleSelection = (optionId: string) => {
    setSelections((prev) => {
      const current = prev[question.id] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [question.id]: updated };
    });
  };

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Last step — persist to Firestore and navigate
    setSaving(true);
    try {
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          onboardingAnswers: selections,
          onboardingCompleted: true,
        });
      }
      router.push("/app/dashboard");
    } catch (err) {
      console.error("Failed to save onboarding:", err);
      // Navigate anyway so the user isn't stuck
      router.push("/app/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-5 pt-4 pb-3 border-b border-border-light">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 px-5 pt-8 pb-28 max-w-lg mx-auto w-full">
        <div key={question.id} className="animate-fade-in">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {question.question}
          </h1>
          <p className="text-sm text-text-secondary mb-8">{question.subtitle}</p>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => (
              <OnboardingCard
                key={option.id}
                emoji={option.emoji}
                label={option.label}
                selected={currentSelections.includes(option.id)}
                onClick={() => toggleSelection(option.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border-light px-5 py-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button
            fullWidth
            size="lg"
            onClick={handleNext}
            disabled={currentSelections.length === 0 || saving}
            loading={saving}
          >
            {isLastStep ? "Get Started" : "Next"}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
