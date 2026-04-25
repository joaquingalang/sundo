// ─── Mock Data for Sundo PWA ───

export const currentUser = {
  id: "usr_001",
  name: "Juan Dela Cruz",
  email: "juan.delacruz@email.com",
  avatar: "",
  escrowBalance: 45000,
  currency: "₱",
};

export interface Consultant {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  isOnline: boolean;
}

export const consultants: Consultant[] = [
  { id: "con_001", name: "Maria Santos", avatar: "", specialty: "Business Setup", rating: 4.9, reviewCount: 128, responseTime: "1 hr", isOnline: true },
  { id: "con_002", name: "Roberto Garcia", avatar: "", specialty: "Financial Literacy", rating: 4.8, reviewCount: 95, responseTime: "2 hrs", isOnline: false },
  { id: "con_003", name: "Ana Reyes", avatar: "", specialty: "Real Estate", rating: 4.7, reviewCount: 76, responseTime: "30 min", isOnline: true },
  { id: "con_004", name: "Carlos Bautista", avatar: "", specialty: "Legal Advisory", rating: 4.9, reviewCount: 142, responseTime: "1 hr", isOnline: false },
  { id: "con_005", name: "Elena Cruz", avatar: "", specialty: "Import/Export", rating: 4.6, reviewCount: 63, responseTime: "45 min", isOnline: true },
];

export interface Consultation {
  id: string;
  title: string;
  consultantName: string;
  consultantAvatar: string;
  orderId: string;
  status: "active" | "pending" | "completed" | "on-hold";
  startDate: string;
  totalCost: number;
  progress: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "pending";
  date?: string;
}

export const consultations: Consultation[] = [
  {
    id: "proj_001",
    title: "Sari-Sari Store Setup",
    consultantName: "Maria Santos",
    consultantAvatar: "",
    orderId: "ORD-2025-0847",
    status: "active",
    startDate: "Mar 15, 2025",
    totalCost: 25000,
    progress: 60,
    milestones: [
      { id: "m1", title: "Consultation Initiated", subtitle: "Initial meeting and requirements gathered", status: "completed", date: "Mar 15" },
      { id: "m2", title: "Documents Verified", subtitle: "Business permits and DTI registration submitted", status: "completed", date: "Mar 22" },
      { id: "m3", title: "Business Plan Approved", subtitle: "Financial projections and location analysis", status: "active", date: "Apr 01" },
      { id: "m4", title: "Store Deployment", subtitle: "Physical setup and inventory procurement", status: "pending" },
      { id: "m5", title: "Launch & Handover", subtitle: "Grand opening and operations handover", status: "pending" },
    ],
  },
  {
    id: "proj_002",
    title: "Financial Literacy Program",
    consultantName: "Roberto Garcia",
    consultantAvatar: "",
    orderId: "ORD-2025-0912",
    status: "active",
    startDate: "Apr 02, 2025",
    totalCost: 8000,
    progress: 30,
    milestones: [
      { id: "m1", title: "Enrollment Confirmed", subtitle: "Program schedule and materials prepared", status: "completed", date: "Apr 02" },
      { id: "m2", title: "Module 1: Budgeting", subtitle: "Income allocation and savings strategies", status: "active", date: "Apr 10" },
      { id: "m3", title: "Module 2: Investing", subtitle: "Stock market basics and mutual funds", status: "pending" },
      { id: "m4", title: "Module 3: Insurance", subtitle: "Life and health insurance essentials", status: "pending" },
    ],
  },
  {
    id: "proj_003",
    title: "Real Estate Consultation",
    consultantName: "Ana Reyes",
    consultantAvatar: "",
    orderId: "ORD-2025-0763",
    status: "completed",
    startDate: "Jan 10, 2025",
    totalCost: 15000,
    progress: 100,
    milestones: [
      { id: "m1", title: "Property Search", subtitle: "Identified 5 potential properties", status: "completed", date: "Jan 10" },
      { id: "m2", title: "Site Inspection", subtitle: "Virtual tour and documentation", status: "completed", date: "Jan 25" },
      { id: "m3", title: "Purchase Finalized", subtitle: "Title transfer and notarization complete", status: "completed", date: "Feb 15" },
    ],
  },
];

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  status: string;
}

export const conversations: Conversation[] = [
  { id: "chat_001", name: "Maria Santos", avatar: "", lastMessage: "I've uploaded the revised business plan for your review. Please check the financial projections.", timestamp: "2:30 PM", isOnline: true, unreadCount: 3, status: "Active now" },
  { id: "chat_002", name: "Roberto Garcia", avatar: "", lastMessage: "Your next module session is scheduled for Thursday at 3 PM.", timestamp: "11:15 AM", isOnline: false, unreadCount: 0, status: "Active 2 hrs ago" },
  { id: "chat_003", name: "Ana Reyes", avatar: "", lastMessage: "Congratulations on the property purchase! 🎉", timestamp: "Yesterday", isOnline: true, unreadCount: 0, status: "Active 5 mins ago" },
  { id: "chat_004", name: "Carlos Bautista", avatar: "", lastMessage: "The legal documents are ready for your signature.", timestamp: "Yesterday", isOnline: false, unreadCount: 1, status: "Active 1 day ago" },
  { id: "chat_005", name: "Sundo Support", avatar: "", lastMessage: "How can we help you today?", timestamp: "Apr 18", isOnline: true, unreadCount: 0, status: "Active now" },
];

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isUser: boolean;
}

export const chatMessages: Message[] = [
  { id: "msg_001", senderId: "con_001", text: "Good morning, Juan! I've completed the market analysis for your sari-sari store location.", timestamp: "9:00 AM", isUser: false },
  { id: "msg_002", senderId: "usr_001", text: "That's great, Maria! What did you find?", timestamp: "9:05 AM", isUser: true },
  { id: "msg_003", senderId: "con_001", text: "The area near Brgy. San Jose has excellent foot traffic and low competition. I'll send the full report shortly.", timestamp: "9:08 AM", isUser: false },
  { id: "msg_004", senderId: "usr_001", text: "Perfect! How about the estimated startup costs?", timestamp: "9:12 AM", isUser: true },
  { id: "msg_005", senderId: "con_001", text: "Based on my analysis, you'll need approximately ₱25,000 for initial inventory, permits, and the first month's rent. I've broken it down in the business plan.", timestamp: "9:15 AM", isUser: false },
  { id: "msg_006", senderId: "usr_001", text: "That's within my budget. Can you proceed with the DTI registration?", timestamp: "9:20 AM", isUser: true },
  { id: "msg_007", senderId: "con_001", text: "Absolutely! I'll need your valid ID and a copy of your barangay clearance. You can upload them here in the chat.", timestamp: "9:22 AM", isUser: false },
  { id: "msg_008", senderId: "con_001", text: "I've uploaded the revised business plan for your review. Please check the financial projections.", timestamp: "2:30 PM", isUser: false },
];

export interface EscrowTransaction {
  id: string;
  description: string;
  amount: number;
  type: "lock" | "release" | "fund";
  date: string;
  status: "completed" | "processing" | "on-hold";
  method?: string;
  processingTime?: string;
  releaseMilestones?: Milestone[];
}

export const escrowTransactions: EscrowTransaction[] = [
  {
    id: "txn_001",
    description: "Sari-Sari Store — Milestone 1",
    amount: -5000,
    type: "lock",
    date: "Mar 15, 2025",
    status: "completed",
    method: "GCash",
    processingTime: "Instant",
    releaseMilestones: [
      { id: "r1", title: "Funds Locked in Escrow", subtitle: "Payment received and secured", status: "completed", date: "Mar 15" },
      { id: "r2", title: "Milestone Verified", subtitle: "Consultant deliverable approved", status: "completed", date: "Mar 22" },
      { id: "r3", title: "Released to Consultant", subtitle: "Funds transferred to Maria Santos", status: "completed", date: "Mar 23" },
    ],
  },
  {
    id: "txn_002",
    description: "Sari-Sari Store — Milestone 2",
    amount: -8000,
    type: "lock",
    date: "Mar 22, 2025",
    status: "on-hold",
    method: "Bank Transfer (BDO)",
    processingTime: "1-2 business days",
    releaseMilestones: [
      { id: "r1", title: "Funds Locked in Escrow", subtitle: "Payment received and secured", status: "completed", date: "Mar 22" },
      { id: "r2", title: "Awaiting Milestone Completion", subtitle: "Pending consultant deliverable", status: "active" },
      { id: "r3", title: "Release to Consultant", subtitle: "Will be transferred upon approval", status: "pending" },
    ],
  },
  {
    id: "txn_003",
    description: "Wallet Top-Up",
    amount: 20000,
    type: "fund",
    date: "Mar 10, 2025",
    status: "completed",
    method: "GCash",
    processingTime: "Instant",
  },
  {
    id: "txn_004",
    description: "Financial Literacy — Full Payment",
    amount: -8000,
    type: "lock",
    date: "Apr 02, 2025",
    status: "processing",
    method: "PayMaya",
    processingTime: "1-3 business days",
    releaseMilestones: [
      { id: "r1", title: "Funds Locked in Escrow", subtitle: "Payment received and secured", status: "completed", date: "Apr 02" },
      { id: "r2", title: "Processing Release", subtitle: "Verifying milestone completion", status: "active" },
      { id: "r3", title: "Transfer to Consultant", subtitle: "Pending verification", status: "pending" },
    ],
  },
  {
    id: "txn_005",
    description: "Wallet Top-Up",
    amount: 50000,
    type: "fund",
    date: "Jan 05, 2025",
    status: "completed",
    method: "Bank Transfer (BPI)",
    processingTime: "Instant",
  },
  {
    id: "txn_006",
    description: "Real Estate — Final Payment",
    amount: -15000,
    type: "release",
    date: "Feb 15, 2025",
    status: "completed",
    method: "Bank Transfer (BDO)",
    processingTime: "2 business days",
    releaseMilestones: [
      { id: "r1", title: "Funds Locked in Escrow", subtitle: "Payment secured", status: "completed", date: "Jan 10" },
      { id: "r2", title: "Milestone Verified", subtitle: "Property purchase finalized", status: "completed", date: "Feb 15" },
      { id: "r3", title: "Released to Consultant", subtitle: "Funds transferred to Ana Reyes", status: "completed", date: "Feb 17" },
    ],
  },
];

export const activityFeed = [
  { id: "act_001", type: "escrow" as const, title: "Escrow Funded", subtitle: "₱8,000 locked for Financial Literacy", time: "2 hours ago" },
  { id: "act_002", type: "milestone" as const, title: "Milestone Completed", subtitle: "Documents Verified — Sari-Sari Store", time: "Yesterday" },
  { id: "act_003", type: "message" as const, title: "New Message", subtitle: "Maria Santos sent a document", time: "Yesterday" },
  { id: "act_004", type: "payment" as const, title: "Payment Released", subtitle: "₱5,000 released to Maria Santos", time: "3 days ago" },
  { id: "act_005", type: "consultation" as const, title: "Consultation Started", subtitle: "Financial Literacy with Roberto Garcia", time: "1 week ago" },
];

export const onboardingQuestions = [
  {
    id: "q1",
    question: "What is your main goal?",
    subtitle: "Choose the options that best describe what you're looking for.",
    options: [
      { id: "o1", emoji: "💼", label: "Start a Business" },
      { id: "o2", emoji: "🎓", label: "Learn Financial Literacy" },
      { id: "o3", emoji: "🏠", label: "Buy Property" },
      { id: "o4", emoji: "📈", label: "Invest Savings" },
      { id: "o5", emoji: "⚖️", label: "Legal Assistance" },
      { id: "o6", emoji: "🚢", label: "Import/Export" },
    ],
  },
  {
    id: "q2",
    question: "Where are you currently based?",
    subtitle: "This helps us match you with the right consultants.",
    options: [
      { id: "o1", emoji: "🇸🇦", label: "Saudi Arabia" },
      { id: "o2", emoji: "🇦🇪", label: "UAE" },
      { id: "o3", emoji: "🇶🇦", label: "Qatar" },
      { id: "o4", emoji: "🇸🇬", label: "Singapore" },
      { id: "o5", emoji: "🇭🇰", label: "Hong Kong" },
      { id: "o6", emoji: "🇯🇵", label: "Japan" },
      { id: "o7", emoji: "🇰🇷", label: "South Korea" },
      { id: "o8", emoji: "🌍", label: "Other" },
    ],
  },
  {
    id: "q3",
    question: "What's your budget range?",
    subtitle: "Select your comfortable investment range.",
    options: [
      { id: "o1", emoji: "💵", label: "Below ₱10,000" },
      { id: "o2", emoji: "💰", label: "₱10,000 — ₱50,000" },
      { id: "o3", emoji: "🏦", label: "₱50,000 — ₱200,000" },
      { id: "o4", emoji: "💎", label: "Above ₱200,000" },
    ],
  },
  {
    id: "q4",
    question: "How soon do you want to start?",
    subtitle: "We'll prioritize consultants with matching availability.",
    options: [
      { id: "o1", emoji: "⚡", label: "Immediately" },
      { id: "o2", emoji: "📅", label: "Within 1 Month" },
      { id: "o3", emoji: "🗓️", label: "Within 3 Months" },
      { id: "o4", emoji: "🔍", label: "Just Exploring" },
    ],
  },
];
