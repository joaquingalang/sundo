"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";

const CONSULTANT_STEPS = ["Personal Info", "Expertise", "Rates", "Documents"];

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "filipino", label: "Filipino (Tagalog)" },
  { value: "ilocano", label: "Ilocano" },
  { value: "cebuano", label: "Cebuano" },
  { value: "hiligaynon", label: "Hiligaynon / Ilonggo" },
  { value: "kapampangan", label: "Kapampangan" },
  { value: "bicolano", label: "Bicolano" },
  { value: "waray", label: "Waray" },
  { value: "arabic", label: "Arabic" },
  { value: "mandarin", label: "Mandarin" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
];

const BIO_MAX = 500;

export default function ConsultantStep1Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step1;
      if (draft) {
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.photoUrl) setPhotoUrl(draft.photoUrl);
        if (draft.jobTitle) setJobTitle(draft.jobTitle);
        if (draft.address) setAddress(draft.address);
        if (draft.bio) setBio(draft.bio);
        if (draft.yearsExperience !== undefined) setYearsExperience(String(draft.yearsExperience));
        if (draft.languages) setLanguages(draft.languages);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [router]);

  if (!authReady) return null;
  console.log("[Consultant Step1] Rendering. uid:", uid, "storagePath:", `photos/${uid}/profile`);

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!photoUrl) errs.photo = "Profile photo is required.";
    if (!jobTitle.trim()) errs.jobTitle = "Job title is required.";
    if (!address.trim()) errs.address = "Address is required.";
    if (!bio.trim()) errs.bio = "Professional bio is required.";
    else if (bio.length < 10) errs.bio = "Bio must be at least 10 characters.";
    else if (bio.length > BIO_MAX) errs.bio = `Bio must be ${BIO_MAX} characters or fewer.`;
    const yrs = parseInt(yearsExperience);
    if (!yearsExperience) errs.yearsExperience = "Years of experience is required.";
    else if (isNaN(yrs) || yrs < 0) errs.yearsExperience = "Enter a valid number.";
    if (languages.length === 0) errs.languages = "Please select at least one language.";
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
        jobTitle: jobTitle.trim(),
        address: address.trim(),
        bio: bio.trim(),
        yearsExperience: parseInt(yearsExperience),
        languages,
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
      title="Your professional profile"
      subtitle="OFWs will see this information when browsing consultants. Make it count."
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            placeholder="e.g. Certified Financial Planner"
            value={jobTitle}
            onChange={(e) => { setJobTitle(e.target.value); setErrors((p) => ({ ...p, jobTitle: "" })); }}
            error={errors.jobTitle}
            required
          />
        </div>

        <FileUpload
          label="Profile Photo"
          storagePath={`photos/${uid}/profile`}
          onUploadComplete={(url) => { setPhotoUrl(url); setErrors((p) => ({ ...p, photo: "" })); }}
          error={errors.photo}
          accept="image/*"
        />

        <Input
          label="Address"
          placeholder="e.g. BGC, Taguig City, Metro Manila"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
          error={errors.address}
          required
        />

        <Textarea
          label="Professional Bio"
          placeholder="Describe your expertise, experience, and how you help OFWs..."
          value={bio}
          onChange={(e) => { setBio(e.target.value); setErrors((p) => ({ ...p, bio: "" })); }}
          error={errors.bio}
          hint={`${bio.length} / ${BIO_MAX} characters`}
          rows={5}
        />

        <Input
          label="Years of Experience"
          type="number"
          placeholder="e.g. 8"
          min="0"
          max="60"
          value={yearsExperience}
          onChange={(e) => { setYearsExperience(e.target.value); setErrors((p) => ({ ...p, yearsExperience: "" })); }}
          error={errors.yearsExperience}
          required
        />

        <MultiSelect
          label="Languages Spoken"
          options={LANGUAGE_OPTIONS}
          value={languages}
          onChange={(v) => { setLanguages(v); setErrors((p) => ({ ...p, languages: "" })); }}
          error={errors.languages}
          hint="Select all languages you can consult in."
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
