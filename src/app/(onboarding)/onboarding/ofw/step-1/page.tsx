"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";

const OFW_STEPS = ["Personal Info", "Deployment", "Interests", "Documents"];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fil", label: "Filipino (Tagalog)" },
];

export default function OfwStep1Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.ofw?.step1;
      if (draft) {
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.photoUrl) setPhotoUrl(draft.photoUrl);
        if (draft.address) setAddress(draft.address);
        if (draft.language) setLanguage(draft.language);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [router]);

  if (!authReady) return null;
  console.log("[OFW Step1] Rendering. uid:", uid, "storagePath:", `photos/${uid}/profile`);

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!photoUrl) errs.photo = "Profile photo is required.";
    if (!address.trim()) errs.address = "Philippine address is required.";
    if (!language) errs.language = "Please select a language.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "ofw", 1, { fullName: fullName.trim(), photoUrl, address: address.trim(), language });
      router.push("/onboarding/ofw/step-2");
    } catch {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      steps={OFW_STEPS}
      title="Tell us about yourself"
      subtitle="This helps us personalise your experience and show your profile to relevant consultants."
    >
      <div className="flex flex-col gap-6">
        <Input
          label="Full Name"
          placeholder="e.g. Maria Santos"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
          error={errors.fullName}
          required
        />

        <FileUpload
          label="Profile Photo"
          storagePath={`photos/${uid}/profile`}
          onUploadComplete={(url) => { setPhotoUrl(url); setErrors((p) => ({ ...p, photo: "" })); }}
          error={errors.photo}
          accept="image/*"
        />

        <Input
          label="Philippine Home Address"
          placeholder="e.g. 123 Rizal St, Quezon City, Metro Manila"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
          error={errors.address}
          required
        />

        <Select
          label="Language Preference"
          placeholder="Select a language"
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={(e) => { setLanguage(e.target.value); setErrors((p) => ({ ...p, language: "" })); }}
          error={errors.language}
          required
        />

        <StepNav
          onBack={() => router.push("/onboarding/role")}
          onNext={handleNext}
          saving={saving}
          backLabel="← Back"
          nextLabel="Continue →"
        />
      </div>
    </OnboardingLayout>
  );
}

function StepNav({
  onBack,
  onNext,
  saving,
  backLabel = "← Back",
  nextLabel = "Continue →",
}: {
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  backLabel?: string;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
      <Button variant="ghost" size="md" onClick={onBack} type="button">
        {backLabel}
      </Button>
      <Button variant="primary" size="md" isLoading={saving} onClick={onNext} type="button">
        {nextLabel}
      </Button>
    </div>
  );
}
