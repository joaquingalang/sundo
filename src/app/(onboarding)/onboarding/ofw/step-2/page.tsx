"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const OFW_STEPS = ["Profile Info", "Goals", "AI Verification", "Complete"];

const SALARY_OPTIONS = [
  { value: "below_30k", label: "Below ₱30,000 / mo" },
  { value: "30k_60k", label: "₱30,000 – ₱60,000 / mo" },
  { value: "60k_100k", label: "₱60,000 – ₱100,000 / mo" },
  { value: "above_100k", label: "Above ₱100,000 / mo" },
];

const GOAL_OPTIONS = [
  { value: "Business", label: "Start a Local Business" },
  { value: "Redeployment", label: "Find a New Job (Local/Abroad)" },
  { value: "General", label: "General Legal/Financial Advice" },
  { value: "Benefits", label: "Claim Government Benefits" },
  { value: "Retirement", label: "Retirement Planning" },
  { value: "Education", label: "Education / Upskilling" },
];

export default function OfwStep2Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [salaryRange, setSalaryRange] = useState("");
  const [goal, setGoal] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.ofw?.step2;
      if (draft) {
        if (draft.salaryRange) setSalaryRange(draft.salaryRange);
        if (draft.goal) setGoal(draft.goal);
      }
    });
    return unsub;
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!salaryRange) errs.salaryRange = "Please select your monthly salary range.";
    if (!goal) errs.goal = "Please select your primary goal.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "ofw", 2, { salaryRange, goal });
      router.push("/onboarding/ofw/step-3");
    } catch {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      steps={OFW_STEPS}
      title="Financials & Goals"
      subtitle="Define your objective to find the best expert matches."
    >
      <div className="flex flex-col gap-8">
        <Select
          label="Monthly Salary"
          placeholder="What is your current monthly salary?"
          options={SALARY_OPTIONS}
          value={salaryRange}
          onChange={(e) => { setSalaryRange(e.target.value); setErrors((p) => ({ ...p, salaryRange: "" })); }}
          error={errors.salaryRange}
          required
        />

        <div className="space-y-4">
          <p className="text-sm font-bold text-rhino uppercase tracking-widest text-left">What is your primary goal?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setGoal(opt.value); setErrors((p) => ({ ...p, goal: "" })); }}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all group",
                  goal === opt.value 
                    ? "border-desert bg-desert/5 ring-1 ring-desert/20" 
                    : "border-akaroa/20 bg-white hover:border-desert/30"
                )}
              >
                <p className={cn(
                  "font-heading font-bold mb-1",
                  goal === opt.value ? "text-desert" : "text-rhino"
                )}>
                  {opt.label}
                </p>
                <p className="text-xs text-rhino/40 font-body">Expert guidance for your {opt.value.toLowerCase()} journey.</p>
              </button>
            ))}
          </div>
          {errors.goal && <p className="text-xs text-red-500 mt-2">{errors.goal}</p>}
        </div>

        <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/ofw/step-1")} type="button">
            ← Back
          </Button>
          <Button variant="primary" size="md" isLoading={saving} onClick={handleNext} type="button">
            Continue →
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
