"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const CONSULTANT_STEPS = ["Personal Info", "Expertise", "Rates", "Documents"];

export default function ConsultantStep3Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step3;
      if (draft) {
        if (draft.minRate !== undefined) setMinRate(String(draft.minRate));
        if (draft.maxRate !== undefined) setMaxRate(String(draft.maxRate));
      }
    });
    return unsub;
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    const min = parseFloat(minRate);
    const max = parseFloat(maxRate);

    if (!minRate) errs.minRate = "Minimum project rate is required.";
    else if (isNaN(min) || min <= 0) errs.minRate = "Enter a valid amount greater than 0.";

    if (!maxRate) errs.maxRate = "Maximum project rate is required.";
    else if (isNaN(max) || max <= 0) errs.maxRate = "Enter a valid amount greater than 0.";
    else if (!isNaN(min) && max <= min) errs.maxRate = "Maximum must be greater than minimum.";

    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "consultant", 3, {
        minRate: parseFloat(minRate),
        maxRate: parseFloat(maxRate),
      });
      router.push("/onboarding/consultant/step-4");
    } catch {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      steps={CONSULTANT_STEPS}
      title="Set your Pricing"
      subtitle="Set your project cost range in Philippine Peso (PHP). This helps OFWs understand your capacity."
    >
      <div className="flex flex-col gap-8">
        <div className="bg-desert/5 border border-desert/20 p-6 rounded-3xl text-left">
          <p className="font-heading font-bold text-rhino mb-1">Project-Based Pricing</p>
          <p className="text-xs text-rhino/60 leading-relaxed font-body">
            Sundo uses an escrow model for projects. You will define a final proposal cost later, but set your typical range here.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <Input
            label="Minimum Project Rate (PHP)"
            type="number"
            placeholder="e.g. 10000"
            min="1"
            value={minRate}
            onChange={(e) => { setMinRate(e.target.value); setErrors((p) => ({ ...p, minRate: "" })); }}
            error={errors.minRate}
            required
          />
          <Input
            label="Maximum Project Rate (PHP)"
            type="number"
            placeholder="e.g. 50000"
            min="1"
            value={maxRate}
            onChange={(e) => { setMaxRate(e.target.value); setErrors((p) => ({ ...p, maxRate: "" })); }}
            error={errors.maxRate}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/consultant/step-2")} type="button">
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
