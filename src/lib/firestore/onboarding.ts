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
      status: "pending",
      isOnboarded: false,
      roleSelected: true,
      onboardingStep: 1,
      onboardingComplete: false,
      documentsSubmitted: false,
    },
    { merge: true }
  );
}

function toFlatProfileFields(
  role: UserRole,
  step: number,
  data: Record<string, unknown>
): Record<string, unknown> {
  if (role === "ofw") {
    if (step === 1) return { displayName: data.fullName, photoURL: data.photoUrl, address: data.address };
    if (step === 2) return { lastPosition: data.jobTitle, countryDeployed: data.country, currentSituation: data.situationStatus };
    if (step === 3) {
      const primary = (data.primaryInterests as string[]) ?? [];
      const secondary = (data.secondaryInterests as string[]) ?? [];
      return { interests: [...primary, ...secondary] };
    }
  }
  if (role === "consultant") {
    if (step === 1) return { displayName: data.fullName, photoURL: data.photoUrl, professionalTitle: data.jobTitle, bio: data.bio, yearsExperience: data.yearsExperience };
    if (step === 2) return { categories: data.expertiseAreas };
    if (step === 3) return { sessionRate: data.sessionRate, projectRateRange: { min: data.projectRateMin, max: data.projectRateMax } };
  }
  return {};
}

export async function saveStepDraft(
  uid: string,
  role: UserRole,
  step: number,
  data: Record<string, unknown>
): Promise<void> {
  const flatFields = toFlatProfileFields(role, step, data);
  await updateDoc(doc(db, "users", uid), {
    [`${role}.step${step}`]: data,
    onboardingStep: step,
    ...flatFields,
  });
}

export async function completeOnboarding(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    documentsSubmitted: true,
    onboardingComplete: true,
    isOnboarded: true,
    status: "pending",
  });
}
