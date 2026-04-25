"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const OFW_STEPS = ["Personal Info", "Deployment", "Interests", "Documents"];

const SITUATION_OPTIONS = [
  { value: "abroad", label: "Currently abroad" },
  { value: "recently_repatriated", label: "Recently repatriated (< 3 months)" },
  { value: "home_1_6mo", label: "Back home 1–6 months" },
  { value: "home_6mo_plus", label: "Back home 6+ months" },
];

const SALARY_OPTIONS = [
  { value: "below_15k", label: "Below ₱15,000 / mo" },
  { value: "15k_30k", label: "₱15,000 – ₱30,000 / mo" },
  { value: "30k_50k", label: "₱30,000 – ₱50,000 / mo" },
  { value: "50k_80k", label: "₱50,000 – ₱80,000 / mo" },
  { value: "80k_120k", label: "₱80,000 – ₱120,000 / mo" },
  { value: "above_120k", label: "Above ₱120,000 / mo" },
  { value: "prefer_not", label: "Prefer not to say" },
];

const REMITTANCE_OPTIONS = [
  { value: "below_10k", label: "Below ₱10,000 / mo" },
  { value: "10k_20k", label: "₱10,000 – ₱20,000 / mo" },
  { value: "20k_40k", label: "₱20,000 – ₱40,000 / mo" },
  { value: "40k_70k", label: "₱40,000 – ₱70,000 / mo" },
  { value: "above_70k", label: "Above ₱70,000 / mo" },
  { value: "prefer_not", label: "Prefer not to say" },
];

const COUNTRY_OPTIONS = [
  "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman",
  "Hong Kong", "Singapore", "Malaysia", "Japan", "South Korea", "Taiwan",
  "United States", "Canada", "United Kingdom", "Australia", "New Zealand",
  "Italy", "Germany", "Spain", "France", "Greece", "Netherlands", "Portugal",
  "Israel", "Jordan", "Lebanon", "Libya", "Cyprus",
  "Brunei", "Indonesia", "Thailand", "Papua New Guinea",
  "Austria", "Belgium", "Denmark", "Norway", "Sweden", "Switzerland",
  "South Africa", "Nigeria", "Kenya",
  "Other",
].map((c) => ({ value: c.toLowerCase().replace(/\s+/g, "_"), label: c }));

export default function OfwStep2Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [employer, setEmployer] = useState("");
  const [situationStatus, setSituationStatus] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [remittanceRange, setRemittanceRange] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.ofw?.step2;
      if (draft) {
        if (draft.jobTitle) setJobTitle(draft.jobTitle);
        if (draft.country) setCountry(draft.country);
        if (draft.employer) setEmployer(draft.employer);
        if (draft.situationStatus) setSituationStatus(draft.situationStatus);
        if (draft.salaryRange) setSalaryRange(draft.salaryRange);
        if (draft.remittanceRange) setRemittanceRange(draft.remittanceRange);
      }
    });
    return unsub;
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!jobTitle.trim()) errs.jobTitle = "Job title is required.";
    if (!country) errs.country = "Please select your country of deployment.";
    if (!employer.trim()) errs.employer = "Employer name is required.";
    if (!situationStatus) errs.situationStatus = "Please select your current situation.";
    if (!salaryRange) errs.salaryRange = "Please select a salary range.";
    if (!remittanceRange) errs.remittanceRange = "Please select a remittance range.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "ofw", 2, {
        jobTitle: jobTitle.trim(),
        country,
        employer: employer.trim(),
        situationStatus,
        salaryRange,
        remittanceRange,
      });
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
      title="Your deployment details"
      subtitle="We use this to match you with consultants relevant to your situation."
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Job Title / Occupation"
            placeholder="e.g. Registered Nurse"
            value={jobTitle}
            onChange={(e) => { setJobTitle(e.target.value); setErrors((p) => ({ ...p, jobTitle: "" })); }}
            error={errors.jobTitle}
            required
          />
          <Select
            label="Country of Deployment"
            placeholder="Select country"
            options={COUNTRY_OPTIONS}
            value={country}
            onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: "" })); }}
            error={errors.country}
            required
          />
        </div>

        <Input
          label="Employer / Agency Name"
          placeholder="e.g. St. Mary's Hospital"
          value={employer}
          onChange={(e) => { setEmployer(e.target.value); setErrors((p) => ({ ...p, employer: "" })); }}
          error={errors.employer}
          required
        />

        <Select
          label="Current Situation"
          placeholder="Select your situation"
          options={SITUATION_OPTIONS}
          value={situationStatus}
          onChange={(e) => { setSituationStatus(e.target.value); setErrors((p) => ({ ...p, situationStatus: "" })); }}
          error={errors.situationStatus}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Select
            label="Monthly Salary Range"
            placeholder="Select range"
            options={SALARY_OPTIONS}
            value={salaryRange}
            onChange={(e) => { setSalaryRange(e.target.value); setErrors((p) => ({ ...p, salaryRange: "" })); }}
            error={errors.salaryRange}
            required
          />
          <Select
            label="Monthly Remittance"
            placeholder="Select range"
            options={REMITTANCE_OPTIONS}
            value={remittanceRange}
            onChange={(e) => { setRemittanceRange(e.target.value); setErrors((p) => ({ ...p, remittanceRange: "" })); }}
            error={errors.remittanceRange}
            required
          />
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
