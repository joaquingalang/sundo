"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadOnboardingDoc, saveStepDraft, completeOnboarding } from "@/lib/firestore/onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";

import { AlertCircle, ShieldCheck, Search } from "lucide-react";

const CONSULTANT_STEPS = ["Profile Info", "Expertise", "Pricing", "AI Verification"];

export default function ConsultantStep4Page() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [idUrl, setIdUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const doc = await loadOnboardingDoc(user.uid);
      const draft = doc?.consultant?.step4;
      if (draft) {
        if (draft.idUrl) setIdUrl(draft.idUrl);
      }
    });
    return unsub;
  }, [router]);

  async function handleVerifyAndSubmit() {
    if (!idUrl) return;
    if (!uid) return;
    
    setIsVerifying(true);
    setVerificationError("");
    
    try {
      // Mocking AI Verification for now, but following the logic
      await saveStepDraft(uid, "consultant", 4, { idUrl });
      
      // Artificial delay to show AI is working
      await new Promise(r => setTimeout(r, 2000));
      
      // Success - Move to Discovery State
      await completeOnboarding(uid);
      router.push("/dashboard"); // Redirect to Command Center
    } catch (err) {
      setVerificationError("AI Validation failed. Please ensure your ID is clear and matches your profile.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      steps={CONSULTANT_STEPS}
      title="AI Identity Guard"
      subtitle="Final step: Secure your professional account with ID verification."
    >
      <div className="flex flex-col gap-8">
        <div className="bg-rhino/5 border border-akaroa/20 p-6 rounded-3xl flex gap-4 items-start">
          <ShieldCheck className="w-6 h-6 text-desert shrink-0 mt-1" />
          <div className="space-y-1 text-left">
            <p className="font-heading font-bold text-rhino">Verified Expert Badge</p>
            <p className="text-xs text-rhino/60 leading-relaxed font-body">
              A verified profile increases trust and engagement. Your ID is only used for internal security audits.
            </p>
          </div>
        </div>

        <FileUpload
          label="Government-Issued ID"
          storagePath={`verification/${uid}/id`}
          onUploadComplete={(url) => setIdUrl(url)}
          accept="image/*,application/pdf"
          previewUrl={idUrl}
        />

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
          <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/consultant/step-3")} type="button" disabled={isVerifying}>
            ← Back
          </Button>
          <Button variant="primary" size="md" isLoading={isVerifying} onClick={handleVerifyAndSubmit} type="button" disabled={!idUrl}>
            {isVerifying ? "Verifying..." : "Complete Verification →"}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

function StripeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35.156 18.066c0-6.19-3.23-9.014-8.835-9.014-5.61 0-9.352 2.825-9.352 9.014 0 5.158 3.511 7.23 7.824 8.528l1.458.423c2.476.717 3.69 1.474 3.69 2.87 0 1.255-1.116 2.052-3.031 2.052-2.392 0-4.402-1.076-5.836-1.893l-1.096 4.302c1.774.957 4.283 1.774 6.912 1.774 5.928 0 9.472-2.81 9.472-8.875 0-5.357-3.411-7.46-8.223-8.855l-1.27-.37c-2.292-.665-3.158-1.355-3.158-2.511 0-1.036.877-1.754 2.53-1.754 1.833 0 3.61.717 4.866 1.454l1.049-4.167z" fill="#635BFF"/>
    </svg>
  );
}
