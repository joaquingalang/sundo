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
  
  // Shared optional fields
  phoneNumber?: string;
  country?: string;
  totalYearsAbroad?: string;

  // OFW specific
  barangay?: string;
  city?: string;
  province?: string;
  goal?: "Business" | "Redeployment" | "General" | "Benefits" | "Retirement" | "Education";
  salaryRange?: string;
  jobTitle?: string;
  lastPosition?: string;
  countryDeployed?: string;
  currentSituation?: string;
  interests?: string[];
  
  // Consultant specific
  professionalTitle?: string;
  yearsExperience?: number;
  bio?: string;
  areaOfOperation?: string; // Matches OFW province
  expertise?: string[]; // Matches OFW goal
  sessionRate?: number;
  projectRateRange?: { min: number; max: number };
}

export type ProjectStatus = 
  | "REQUESTED" 
  | "PROPOSAL" 
  | "WAITING_FOR_DEPOSIT" 
  | "ESCROW_LOCKED" 
  | "EXECUTION" 
  | "AI_AUDIT" 
  | "COMPLETED";

export interface Engagement {
  id: string;
  ofwId: string;
  consultantId: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  totalAmount: number;
  escrowStatus: "unfunded" | "funded" | "released" | "refunded";
  proposalUrl?: string; // PDF Roadmap
  createdAt: any;
  updatedAt: any;
  lastActivityAt: any;
}

export interface Milestone {
  id: string;
  engagementId: string;
  title: string;
  amount: number;
  status: "locked" | "in_progress" | "submitted" | "released" | "disputed";
  deliverables: string[];
  tasks?: Array<string | { title: string; completed: boolean }>;
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
  type: "text" | "system" | "meet_card" | "milestone_card" | "milestone_update";
  metadata?: any;
  createdAt: any;
}
