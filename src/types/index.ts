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
  | "COMPLETED"
  | "CANCELLED";

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
  proposalUrl?: string;
  mode?: string;
  ofwName?: string;
  consultantName?: string;
  rating?: number;
  review?: string;
  metadata?: {
    ofwName?: string;
    ofwGoal?: string;
    ofwProvince?: string;
    ofwSalaryRange?: string;
    consultantName?: string;
    [key: string]: any;
  };
  createdAt: any;
  updatedAt: any;
  lastActivityAt: any;
  currentMilestoneIndex?: number;
  meetLink?: string;
  meetEventId?: string;
}

export interface Milestone {
  id: string;
  engagementId: string;
  title: string;
  amount: number;
  status: "locked" | "in_progress" | "submitted" | "released" | "disputed" | "verified" | "AI_AUDITED";
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

export interface AppointmentMetadata {
  proposedAt: string;
  durationMinutes: number;
  note?: string;
  status: "pending" | "approved" | "declined";
  proposedBy: string;
  meetLink?: string;
  meetEventId?: string;
}

export interface Message {
  id: string;
  engagementId: string;
  senderId: string;
  content: string;
  type: "text" | "system" | "meet_card" | "milestone_card" | "milestone_update" | "appointment_request" | "meet_link";
  metadata?: AppointmentMetadata | Record<string, unknown>;
  createdAt: any;
}
