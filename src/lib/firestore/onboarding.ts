import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserRole = "ofw" | "consultant";

export interface OnboardingDoc {
  role?: UserRole;
  status?: string;
  roleSelected?: boolean;
  onboardingStep?: number;
  onboardingComplete?: boolean;
  documentsSubmitted?: boolean;
  verificationStatus?: "pending" | "verified" | "rejected";
  ofw?: {
    step1?: {
      fullName?: string;
      photoUrl?: string;
      address?: string;
      language?: string;
    };
    step2?: {
      jobTitle?: string;
      country?: string;
      employer?: string;
      situationStatus?: string;
      salaryRange?: string;
      remittanceRange?: string;
    };
    step3?: {
      primaryInterests?: string[];
      secondaryInterests?: string[];
    };
    step4?: {
      govIdUrl?: string;
      passportUrl?: string;
      ofwCardUrl?: string;
      visaUrl?: string;
      addressProofUrl?: string;
    };
  };
  consultant?: {
    step1?: {
      fullName?: string;
      photoUrl?: string;
      jobTitle?: string;
      address?: string;
      bio?: string;
      yearsExperience?: number;
      languages?: string[];
    };
    step2?: {
      expertiseAreas?: string[];
      engagementMode?: string;
    };
    step3?: {
      sessionRate?: number;
      projectRateMin?: number;
      projectRateMax?: number;
    };
    step4?: {
      govIdUrl?: string;
      professionalLicenseUrl?: string;
      taxCertUrl?: string;
      bankVerifUrl?: string;
    };
  };
}

export async function loadOnboardingDoc(uid: string): Promise<OnboardingDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as OnboardingDoc) : null;
}

export async function setRole(uid: string, role: UserRole): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      role,
      status: "pending_submission",
      roleSelected: true,
      onboardingStep: 1,
      onboardingComplete: false,
      documentsSubmitted: false,
      verificationStatus: "pending",
    },
    { merge: true }
  );
}

export async function saveStepDraft(
  uid: string,
  role: UserRole,
  step: number,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    [`${role}.step${step}`]: data,
    onboardingStep: step,
  });
}

export async function completeOnboarding(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    documentsSubmitted: true,
    onboardingComplete: true,
    status: "pending_review",
  });
}
