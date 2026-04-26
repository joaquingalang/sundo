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
        province?: string;
        jobTitle?: string;
      };
      step2?: {
        salaryRange?: string;
        goal?: string;
      };
      step3?: {
        idUrl?: string;
        idType?: string;
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
        professionalTitle?: string;
        areaOfOperation?: string;
      };
      step2?: {
        expertise?: string[];
      };
      step3?: {
        minRate?: number;
        maxRate?: number;
      };
      step4?: {
        idUrl?: string;
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
        state: "ONBOARDING",
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
      if (step === 1) return { 
        displayName: data.fullName, 
        photoURL: data.photoUrl, 
        province: data.province, 
        jobTitle: data.jobTitle 
      };
      if (step === 2) return { 
        salaryRange: data.salaryRange, 
        goal: data.goal 
      };
    }
    if (role === "consultant") {
      if (step === 1) return { 
        displayName: data.fullName, 
        photoURL: data.photoUrl, 
        professionalTitle: data.professionalTitle, 
        areaOfOperation: data.areaOfOperation 
      };
      if (step === 2) return { expertise: data.expertise };
      if (step === 3) return { projectRateRange: { min: data.minRate, max: data.maxRate } };
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
      status: "verified",
      state: "DISCOVERY", // Moving to Discovery phase
    });
  }
