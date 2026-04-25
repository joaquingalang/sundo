export type UserRole = "ofw" | "consultant" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isOnboarded: boolean;
  status: "pending" | "verified" | "rejected";
  createdAt: any;
  updatedAt: any;
  
  // OFW specific
  barangay?: string;
  city?: string;
  province?: string;
  lastPosition?: string;
  countryDeployed?: string;
  currentSituation?: string;
  interests?: string[];
  
  // Consultant specific
  professionalTitle?: string;
  yearsExperience?: number;
  bio?: string;
  categories?: string[];
  sessionRate?: number;
  projectRateRange?: { min: number; max: number };
}

export interface Engagement {
  id: string;
  ofwId: string;
  consultantId: string;
  title: string;
  description: string;
  category: string;
  mode: "session" | "project";
  status: "pending_acceptance" | "in_progress" | "completed" | "cancelled" | "disputed";
  totalAmount: number;
  escrowStatus: "unfunded" | "funded" | "released" | "refunded";
  createdAt: any;
  updatedAt: any;
  lastActivityAt: any;
  currentMilestoneIndex?: number;
}

export interface Milestone {
  id: string;
  engagementId: string;
  title: string;
  amount: number;
  status: "locked" | "in_progress" | "submitted" | "released" | "disputed";
  deliverables: string[];
  proofOfWorkURL?: string;
  aiValidationResult?: {
    isVerified: boolean;
    confidence: number;
    reasoning: string;
    auditedAt: any;
  };
}

export interface Message {
  id: string;
  engagementId: string;
  senderId: string;
  content: string;
  type: "text" | "system" | "meet_card" | "milestone_card";
  metadata?: any;
  createdAt: any;
}
