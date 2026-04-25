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
  const [sessionRate, setSessionRate] = useState("");
  const [projectRateMin, setProjectRateMin] = useState("");
  const [projectRateMax, setProjectRateMax] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step3;
      if (draft) {
        if (draft.sessionRate !== undefined) setSessionRate(String(draft.sessionRate));
        if (draft.projectRateMin !== undefined) setProjectRateMin(String(draft.projectRateMin));
        if (draft.projectRateMax !== undefined) setProjectRateMax(String(draft.projectRateMax));
      }
    });
    return unsub;
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    const rate = parseFloat(sessionRate);
    const min = parseFloat(projectRateMin);
    const max = parseFloat(projectRateMax);

    if (!sessionRate) errs.sessionRate = "Session rate is required.";
    else if (isNaN(rate) || rate <= 0) errs.sessionRate = "Enter a valid rate greater than 0.";

    if (!projectRateMin) errs.projectRateMin = "Minimum project rate is required.";
    else if (isNaN(min) || min <= 0) errs.projectRateMin = "Enter a valid amount greater than 0.";

    if (!projectRateMax) errs.projectRateMax = "Maximum project rate is required.";
    else if (isNaN(max) || max <= 0) errs.projectRateMax = "Enter a valid amount greater than 0.";
    else if (!isNaN(min) && max <= min) errs.projectRateMax = "Maximum must be greater than minimum.";

    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "consultant", 3, {
        sessionRate: parseFloat(sessionRate),
        projectRateMin: parseFloat(projectRateMin),
        projectRateMax: parseFloat(projectRateMax),
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
      title="Your rates"
      subtitle="Set your pricing in Philippine Peso (PHP). You can update these after your profile is verified."
    >
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="font-body text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Per-Session Rate
          </h2>
          <Input
            label="Session Rate (PHP / hr)"
            type="number"
            placeholder="e.g. 1500"
            min="1"
            value={sessionRate}
            onChange={(e) => { setSessionRate(e.target.value); setErrors((p) => ({ ...p, sessionRate: "" })); }}
            error={errors.sessionRate}
            required
          />
        </div>

        <div>
          <h2 className="font-body text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Project Rate Range
          </h2>
          <p className="text-xs text-sandstone font-body mb-4">
            The estimated total cost for a project engagement, in PHP.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Minimum (PHP)"
              type="number"
              placeholder="e.g. 5000"
              min="1"
              value={projectRateMin}
              onChange={(e) => { setProjectRateMin(e.target.value); setErrors((p) => ({ ...p, projectRateMin: "" })); }}
              error={errors.projectRateMin}
              required
            />
            <Input
              label="Maximum (PHP)"
              type="number"
              placeholder="e.g. 25000"
              min="1"
              value={projectRateMax}
              onChange={(e) => { setProjectRateMax(e.target.value); setErrors((p) => ({ ...p, projectRateMax: "" })); }}
              error={errors.projectRateMax}
              required
            />
          </div>
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
