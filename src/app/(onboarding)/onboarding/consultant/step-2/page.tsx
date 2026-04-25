"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const CONSULTANT_STEPS = ["Personal Info", "Expertise", "Rates", "Documents"];

const EXPERTISE_OPTIONS = [
  { value: "business", label: "Business" },
  { value: "work_local", label: "Work (Local)" },
  { value: "general", label: "General Consultation" },
  { value: "benefits", label: "Benefits" },
  { value: "retirement", label: "Retirement" },
  { value: "reintegration", label: "Reintegration" },
  { value: "education", label: "Education" },
];

const ENGAGEMENT_OPTIONS = [
  { value: "async", label: "Async only (text-based, email)" },
  { value: "live", label: "Live sessions only (video calls)" },
  { value: "both", label: "Both async and live" },
];

export default function ConsultantStep2Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  const [engagementMode, setEngagementMode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step2;
      if (draft) {
        if (draft.expertiseAreas) setExpertiseAreas(draft.expertiseAreas);
        if (draft.engagementMode) setEngagementMode(draft.engagementMode);
      }
    });
    return unsub;
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (expertiseAreas.length === 0) errs.expertise = "Please select at least one area of expertise.";
    if (!engagementMode) errs.engagement = "Please select your engagement mode.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "consultant", 2, { expertiseAreas, engagementMode });
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
      title="Your expertise"
      subtitle="Let us know what topics you specialise in and how you prefer to work with clients."
    >
      <div className="flex flex-col gap-8">
        <MultiSelect
          label="Areas of Expertise"
          options={EXPERTISE_OPTIONS}
          value={expertiseAreas}
          onChange={(v) => { setExpertiseAreas(v); setErrors((p) => ({ ...p, expertise: "" })); }}
          error={errors.expertise}
          hint="Select all that apply. OFWs will filter consultants by these."
        />

        <Select
          label="Preferred Engagement Mode"
          placeholder="Select how you work with clients"
          options={ENGAGEMENT_OPTIONS}
          value={engagementMode}
          onChange={(e) => { setEngagementMode(e.target.value); setErrors((p) => ({ ...p, engagement: "" })); }}
          error={errors.engagement}
          required
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
