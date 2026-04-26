"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft, completeOnboarding } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";

const OFW_STEPS = ["Personal Info", "Deployment", "Interests", "Documents"];

export default function OfwStep4Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [govIdUrl, setGovIdUrl] = useState("");
  const [passportUrl, setPassportUrl] = useState("");
  const [ofwCardUrl, setOfwCardUrl] = useState("");
  const [visaUrl, setVisaUrl] = useState("");
  const [addressProofUrl, setAddressProofUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.ofw?.step4;
      if (draft) {
        if (draft.govIdUrl) setGovIdUrl(draft.govIdUrl);
        if (draft.passportUrl) setPassportUrl(draft.passportUrl);
        if (draft.ofwCardUrl) setOfwCardUrl(draft.ofwCardUrl);
        if (draft.visaUrl) setVisaUrl(draft.visaUrl);
        if (draft.addressProofUrl) setAddressProofUrl(draft.addressProofUrl);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [router]);

  if (!authReady) return null;

  function validate() {
    const errs: Record<string, string> = {};
    if (!govIdUrl) errs.govId = "Government ID is required.";
    if (!passportUrl) errs.passport = "Passport is required.";
    if (!ofwCardUrl) errs.ofwCard = "OFW Card is required.";
    if (!visaUrl) errs.visa = "Visa or work permit is required.";
    if (!addressProofUrl) errs.addressProof = "Proof of address is required.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "ofw", 4, {
        govIdUrl,
        passportUrl,
        ofwCardUrl,
        visaUrl,
        addressProofUrl,
      });
      await completeOnboarding(uid);
      router.push("/onboarding/pending");
    } catch {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      steps={OFW_STEPS}
      title="Upload your documents"
      subtitle="All documents are stored securely and reviewed by our team within 3–5 business days."
    >
      <div className="flex flex-col gap-6">
        <div className="bg-rhino/5 border border-rhino/15 rounded-xl px-5 py-4">
          <p className="text-sm font-body text-rhino font-medium">
            Why do we need these?
          </p>
          <p className="text-sm font-body text-sandstone mt-1 leading-relaxed">
            We verify your identity and OFW status to ensure every consultant
            interaction is safe and trustworthy.
          </p>
        </div>

        <FileUpload
          label="Government-Issued ID"
          storagePath={`documents/${uid}/gov_id`}
          onUploadComplete={(url) => { setGovIdUrl(url); setErrors((p) => ({ ...p, govId: "" })); }}
          error={errors.govId}
        />

        <FileUpload
          label="Passport"
          storagePath={`documents/${uid}/passport`}
          onUploadComplete={(url) => { setPassportUrl(url); setErrors((p) => ({ ...p, passport: "" })); }}
          error={errors.passport}
        />

        <FileUpload
          label="OFW Card / e-Card"
          storagePath={`documents/${uid}/ofw_card`}
          onUploadComplete={(url) => { setOfwCardUrl(url); setErrors((p) => ({ ...p, ofwCard: "" })); }}
          error={errors.ofwCard}
        />

        <FileUpload
          label="Visa / Work Permit"
          storagePath={`documents/${uid}/visa`}
          onUploadComplete={(url) => { setVisaUrl(url); setErrors((p) => ({ ...p, visa: "" })); }}
          error={errors.visa}
        />

        <FileUpload
          label="Proof of Philippine Address"
          storagePath={`documents/${uid}/address_proof`}
          onUploadComplete={(url) => { setAddressProofUrl(url); setErrors((p) => ({ ...p, addressProof: "" })); }}
          error={errors.addressProof}
          accept="image/*,.pdf"
        />

        <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/ofw/step-3")} type="button">
            ← Back
          </Button>
          <Button variant="primary" size="md" isLoading={saving} onClick={handleSubmit} type="button">
            Submit Application
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
