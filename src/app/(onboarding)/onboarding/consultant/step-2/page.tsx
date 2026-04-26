"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const CONSULTANT_STEPS = ["Profile Info", "Expertise", "Pricing", "AI Verification"];

const EXPERTISE_OPTIONS = [
  { value: "Business", label: "Business Reintegration" },
  { value: "Redeployment", label: "Local/Abroad Redeployment" },
  { value: "General", label: "General Consultation" },
  { value: "Benefits", label: "Government Benefits & Claims" },
  { value: "Retirement", label: "Retirement Planning" },
  { value: "Education", label: "Education & Skills Training" },
];

export default function ConsultantStep2Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step2;
      if (draft) {
        if (draft.expertise) setExpertise(draft.expertise);
      }
    });
    return unsub;
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (expertise.length === 0) errs.expertise = "Please select at least one area of expertise.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "consultant", 2, { expertise });
      router.push("/onboarding/consultant/step-3");
    } catch {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      steps={CONSULTANT_STEPS}
      title="Define your Expertise"
      subtitle="Select the areas where you can provide high-impact guidance to OFWs."
    >
      <div className="flex flex-col gap-8">
        <MultiSelect
          label="Areas of Expertise"
          options={EXPERTISE_OPTIONS}
          value={expertise}
          onChange={(v) => { setExpertise(v); setErrors((p) => ({ ...p, expertise: "" })); }}
          error={errors.expertise}
          hint="These categories directly match OFW goals for precise matchmaking."
        />

        <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/consultant/step-1")} type="button">
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
