"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const OFW_STEPS = ["Personal Info", "Deployment", "Interests", "Documents"];

const CATEGORIES = [
  { value: "business", label: "Business" },
  { value: "work_local", label: "Work (Local)" },
  { value: "general", label: "General Consultation" },
  { value: "benefits", label: "Benefits" },
  { value: "retirement", label: "Retirement" },
  { value: "reintegration", label: "Reintegration" },
  { value: "education", label: "Education" },
];

const SUGGEST_MAP: Record<string, string[]> = {
  abroad: ["general", "benefits"],
  recently_repatriated: ["benefits", "reintegration"],
  home_1_6mo: ["reintegration", "business"],
  home_6mo_plus: ["business", "work_local"],
};

export default function OfwStep3Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [primaryInterests, setPrimaryInterests] = useState<string[]>([]);
  const [secondaryInterests, setSecondaryInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);

      const step3Draft = doc?.ofw?.step3;
      if (step3Draft?.primaryInterests) {
        setPrimaryInterests(step3Draft.primaryInterests);
        setSecondaryInterests(step3Draft.secondaryInterests ?? []);
      } else {
        const situation = doc?.ofw?.step2?.situationStatus ?? "";
        const suggested = SUGGEST_MAP[situation] ?? [];
        setSecondaryInterests(suggested);
      }
    });
    return unsub;
  }, [router]);

  function removeSecondary(val: string) {
    setSecondaryInterests((prev) => prev.filter((v) => v !== val));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (primaryInterests.length === 0) errs.primary = "Please select at least one area of interest.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "ofw", 3, { primaryInterests, secondaryInterests });
      router.push("/onboarding/ofw/step-4");
    } catch {
      setSaving(false);
    }
  }

  const uniqueSecondary = secondaryInterests.filter((v) => !primaryInterests.includes(v));

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      steps={OFW_STEPS}
      title="Your interests"
      subtitle="We'll use these to match you with the most relevant consultants on Sundo."
    >
      <div className="flex flex-col gap-8">
        <MultiSelect
          label="Primary Interests"
          options={CATEGORIES}
          value={primaryInterests}
          onChange={(v) => { setPrimaryInterests(v); setErrors((p) => ({ ...p, primary: "" })); }}
          error={errors.primary}
          hint="Select all that apply."
        />

        {uniqueSecondary.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground font-body">
              Also suggested for you
            </p>
            <p className="text-xs text-sandstone font-body -mt-0.5">
              Based on your situation. You can remove any that don&apos;t apply.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {uniqueSecondary.map((val) => {
                const opt = CATEGORIES.find((c) => c.value === val);
                if (!opt) return null;
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full text-sm font-body font-medium bg-akaroa/30 text-foreground border border-akaroa"
                  >
                    {opt.label}
                    <button
                      type="button"
                      onClick={() => removeSecondary(val)}
                      aria-label={`Remove ${opt.label}`}
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        "text-sandstone hover:text-foreground hover:bg-akaroa/60 transition-colors"
                      )}
                    >
                      <XIcon />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-8 mt-2 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/ofw/step-2")} type="button">
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

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
