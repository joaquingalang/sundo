"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";

const CONSULTANT_STEPS = ["Profile Info", "Expertise", "Pricing", "AI Verification"];

const PROVINCE_OPTIONS = [
  "Metro Manila", "Cebu", "Davao", "Iloilo", "Pampanga", "Cavite", "Laguna", "Pangasinan", "Bulacan", "Batangas"
].map(p => ({ value: p, label: p }));

export default function ConsultantStep1Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [areaOfOperation, setAreaOfOperation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step1;
      if (draft) {
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.photoUrl) setPhotoUrl(draft.photoUrl);
        if (draft.professionalTitle) setProfessionalTitle(draft.professionalTitle);
        if (draft.areaOfOperation) setAreaOfOperation(draft.areaOfOperation);
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
    if (!professionalTitle.trim()) errs.professionalTitle = "Professional title is required.";
    if (!areaOfOperation) errs.areaOfOperation = "Please select your primary area of operation.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "consultant", 1, {
        fullName: fullName.trim(),
        photoUrl,
        professionalTitle: professionalTitle.trim(),
        areaOfOperation
      });
      router.push("/onboarding/consultant/step-2");
    } catch {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      steps={CONSULTANT_STEPS}
      title="Professional Profile"
      subtitle="Define your reach and expertise to help OFWs reintegrate successfully."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <Input
            label="Full Name"
            placeholder="e.g. Juan dela Cruz"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
            error={errors.fullName}
            required
          />
          <Input
            label="Professional Title"
            placeholder="e.g. Business Consultant"
            value={professionalTitle}
            onChange={(e) => { setProfessionalTitle(e.target.value); setErrors((p) => ({ ...p, professionalTitle: "" })); }}
            error={errors.professionalTitle}
            required
          />
        </div>

        <Select
          label="Area of Operation"
          placeholder="Select primary province"
          options={PROVINCE_OPTIONS}
          value={areaOfOperation}
          onChange={(e) => { setAreaOfOperation(e.target.value); setErrors((p) => ({ ...p, areaOfOperation: "" })); }}
          error={errors.areaOfOperation}
          required
        />

        <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/role")} type="button">
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
