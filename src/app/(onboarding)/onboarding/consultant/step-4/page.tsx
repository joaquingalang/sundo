"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft, completeOnboarding } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";

const CONSULTANT_STEPS = ["Personal Info", "Expertise", "Rates", "Documents"];

export default function ConsultantStep4Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [govIdUrl, setGovIdUrl] = useState("");
  const [professionalLicenseUrl, setProfessionalLicenseUrl] = useState("");
  const [taxCertUrl, setTaxCertUrl] = useState("");
  const [bankVerifUrl, setBankVerifUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step4;
      if (draft) {
        if (draft.govIdUrl) setGovIdUrl(draft.govIdUrl);
        if (draft.professionalLicenseUrl) setProfessionalLicenseUrl(draft.professionalLicenseUrl);
        if (draft.taxCertUrl) setTaxCertUrl(draft.taxCertUrl);
        if (draft.bankVerifUrl) setBankVerifUrl(draft.bankVerifUrl);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [router]);

  if (!authReady) return null;

  function validate() {
    const errs: Record<string, string> = {};
    if (!govIdUrl) errs.govId = "Government ID is required.";
    if (!taxCertUrl) errs.taxCert = "Tax certificate is required.";
    if (!bankVerifUrl) errs.bankVerif = "Bank verification is required.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!uid) return;
    setSaving(true);
    try {
      await saveStepDraft(uid, "consultant", 4, {
        govIdUrl,
        professionalLicenseUrl: professionalLicenseUrl || null,
        taxCertUrl,
        bankVerifUrl,
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
      steps={CONSULTANT_STEPS}
      title="Verification documents"
      subtitle="Upload your credentials so our team can verify your profile. Review takes 3–5 business days."
    >
      <div className="flex flex-col gap-6">
        <div className="bg-rhino/5 border border-rhino/15 rounded-xl px-5 py-4">
          <p className="text-sm font-body text-rhino font-medium">
            Your documents are kept private
          </p>
          <p className="text-sm font-body text-sandstone mt-1 leading-relaxed">
            Only Sundo admins can view your verification documents. They are
            never shared with OFWs or third parties.
          </p>
        </div>

        <FileUpload
          label="Government-Issued ID"
          storagePath={`documents/${uid}/gov_id`}
          onUploadComplete={(url) => { setGovIdUrl(url); setErrors((p) => ({ ...p, govId: "" })); }}
          error={errors.govId}
        />

        <FileUpload
          label="Professional License (PRC or equivalent)"
          storagePath={`documents/${uid}/professional_license`}
          onUploadComplete={(url) => setProfessionalLicenseUrl(url)}
          optional
        />

        <FileUpload
          label="Tax Certificate (BIR Form 2307)"
          storagePath={`documents/${uid}/tax_cert`}
          onUploadComplete={(url) => { setTaxCertUrl(url); setErrors((p) => ({ ...p, taxCert: "" })); }}
          error={errors.taxCert}
        />

        <FileUpload
          label="Bank Verification (voided cheque or statement)"
          storagePath={`documents/${uid}/bank_verif`}
          onUploadComplete={(url) => { setBankVerifUrl(url); setErrors((p) => ({ ...p, bankVerif: "" })); }}
          error={errors.bankVerif}
        />

        {/* Stripe Connect placeholder */}
        <div className="border border-akaroa/60 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#635bff]/10 flex items-center justify-center shrink-0">
              <StripeIcon />
            </div>
            <div>
              <p className="text-sm font-body font-semibold text-foreground">
                Stripe Connect
              </p>
              <p className="text-xs text-sandstone font-body">
                Required to receive payments from OFWs.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled
            title="Stripe Connect will be available after verification"
            type="button"
          >
            Connect Stripe Account
            <span className="ml-1 text-[10px] bg-sandstone/20 text-sandstone px-1.5 py-0.5 rounded font-body font-medium uppercase tracking-wide">
              Coming soon
            </span>
          </Button>
          <p className="text-[11px] text-sandstone/70 font-body">
            You&apos;ll be prompted to connect Stripe after your profile is verified.
          </p>
        </div>

        <div className="flex items-center justify-between pt-8 mt-4 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/consultant/step-3")} type="button">
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

function StripeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11.9 7.1c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 4.9 1.2V3.3C17.1 2.5 15.5 2 13.7 2c-3.9 0-6.5 2-6.5 5.4 0 5.3 7.3 4.4 7.3 6.7 0 .9-.8 1.2-2 1.2-1.7 0-3.9-.7-5.6-1.7v3.9C8.6 18.4 10.8 19 13 19c4 0 6.7-2 6.7-5.4C19.7 8.1 11.9 9.2 11.9 7.1z" fill="#635bff"/>
    </svg>
  );
}
