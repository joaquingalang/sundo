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

const OFW_STEPS = ["Profile Info", "Goals", "AI Verification", "Complete"];

const PROVINCE_OPTIONS = [
  "Metro Manila", "Cebu", "Davao", "Iloilo", "Pampanga", "Cavite", "Laguna", "Pangasinan", "Bulacan", "Batangas"
].map(p => ({ value: p, label: p }));

export default function OfwStep1Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [province, setProvince] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.ofw?.step1;
      if (draft) {
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.photoUrl) setPhotoUrl(draft.photoUrl);
        if (draft.province) setProvince(draft.province);
        if (draft.jobTitle) setJobTitle(draft.jobTitle);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [router]);

  if (!authReady) return null;

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!photoUrl) errs.photo = "Profile photo is required.";
    if (!province) errs.province = "Please select your home province.";
    if (!jobTitle.trim()) errs.jobTitle = "Current or last job title is required.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "ofw", 1, { fullName: fullName.trim(), photoUrl, province, jobTitle: jobTitle.trim() });
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
      title="Create your OFW Profile"
      subtitle="This data is used to match you with verified experts."
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-center mb-4">
          <FileUpload
            label="Profile Photo"
            storagePath={`photos/${uid}/profile`}
            onUploadComplete={(url) => { setPhotoUrl(url); setErrors((p) => ({ ...p, photo: "" })); }}
            error={errors.photo}
            accept="image/*"
            previewUrl={photoUrl}
          />
        </div>

        <Input
          label="Full Name"
          placeholder="e.g. Maria Santos"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
          error={errors.fullName}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Select
            label="Home Province"
            placeholder="Select province"
            options={PROVINCE_OPTIONS}
            value={province}
            onChange={(e) => { setProvince(e.target.value); setErrors((p) => ({ ...p, province: "" })); }}
            error={errors.province}
            required
          />
          <Input
            label="Job Title"
            placeholder="e.g. Registered Nurse"
            value={jobTitle}
            onChange={(e) => { setJobTitle(e.target.value); setErrors((p) => ({ ...p, jobTitle: "" })); }}
            error={errors.jobTitle}
            required
          />
        </div>

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
