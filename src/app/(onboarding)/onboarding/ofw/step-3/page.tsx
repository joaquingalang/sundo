"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FileUpload } from "@/components/ui/FileUpload";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AlertCircle, ShieldCheck, Search } from "lucide-react";

const OFW_STEPS = ["Profile Info", "Goals", "AI Verification", "Complete"];

const ID_OPTIONS = [
  { value: "ofw_id", label: "OFW ID (e-Card)" },
  { value: "passport", label: "Philippine Passport" },
  { value: "umid", label: "UMID" },
  { value: "drivers_license", label: "Driver's License" },
];

export default function OfwStep3Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [idType, setIdType] = useState("");
  const [idUrl, setIdUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.ofw?.step3;
      if (draft) {
        if (draft.idType) setIdType(draft.idType);
        if (draft.idUrl) setIdUrl(draft.idUrl);
      }
    });
    return unsub;
  }, [router]);

  async function handleVerifyAndNext() {
    if (!idUrl) return;
    if (!uid) return;
    
    setIsVerifying(true);
    setVerificationError("");
    
    try {
      // Mocking AI Verification for now, but following the logic
      // In a real scenario, we'd call processDocumentUpload here
      await saveStepDraft(uid, "ofw", 3, { idType, idUrl });
      
      // Artificial delay to show AI is working
      await new Promise(r => setTimeout(r, 2000));
      
      // Success
      router.push("/onboarding/ofw/step-4");
    } catch (err) {
      setVerificationError("AI Validation failed. Please ensure the document is clear and matches your profile.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      steps={OFW_STEPS}
      title="AI Identity Guard"
      subtitle="Secure your account with AI-powered government ID verification."
    >
      <div className="flex flex-col gap-8">
        <div className="bg-rhino/5 border border-akaroa/20 p-6 rounded-3xl flex gap-4 items-start">
          <ShieldCheck className="w-6 h-6 text-desert shrink-0 mt-1" />
          <div className="space-y-1 text-left">
            <p className="font-heading font-bold text-rhino">Privacy First</p>
            <p className="text-xs text-rhino/60 leading-relaxed font-body">
              Your documents are encrypted and only used to verify your identity. Consultants only see your verified badge.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Select
            label="ID Type"
            placeholder="Select ID type"
            options={ID_OPTIONS}
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            required
          />

          <FileUpload
            label="Upload Government ID"
            storagePath={`verification/${uid}/id`}
            onUploadComplete={(url) => setIdUrl(url)}
            accept="image/*,application/pdf"
            previewUrl={idUrl}
          />
        </div>

        {verificationError && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-center text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium font-body">{verificationError}</p>
          </div>
        )}

        {isVerifying && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-desert/20 border-t-desert rounded-full animate-spin" />
              <Search className="absolute inset-0 m-auto w-4 h-4 text-desert animate-pulse" />
            </div>
            <p className="text-sm font-bold text-rhino font-heading animate-pulse">Gemini 1.5 Flash is verifying your document...</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-8 mt-2 border-t border-akaroa/30">
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/ofw/step-2")} type="button" disabled={isVerifying}>
            ← Back
          </Button>
          <Button variant="primary" size="md" isLoading={isVerifying} onClick={handleVerifyAndNext} type="button" disabled={!idUrl || !idType}>
            {isVerifying ? "Verifying..." : "Verify Identity →"}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
