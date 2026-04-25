"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Layers,
  ShieldCheck,
  Calendar,
  Video,
  Clock,
  ChevronRight,
  FileText,
  Handshake,
  Upload,
  CheckCircle2,
  FileSearch,
  AlertCircle,
  User
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEngagement } from "@/hooks/useEngagement";
import { useAuthStore } from "@/store/useAuthStore";
import { updateDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RatingModal } from "@/components/engagements/RatingModal";

export default function EngagementDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const engagementId = params.engagementId as string;
  const { engagement, milestones, isLoading } = useEngagement(engagementId);
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!engagement) return <div className="text-center py-20 font-heading text-2xl">Engagement not found</div>;

  const tabs = [
    { label: "Overview", href: `/engagements/${engagementId}`, icon: Layers },
    { label: "Chat", href: `/engagements/${engagementId}/chat`, icon: MessageSquare },
    { label: user?.role === "consultant" ? "Project Manager" : "Task Tracker", href: `/engagements/${engagementId}/milestones`, icon: ShieldCheck },
    { label: "Vault", href: `/engagements/${engagementId}/vault`, icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  async function handleProposalAction(newStatus: string, message: string) {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "engagements", engagementId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: message,
        type: "system",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRatingSubmit(rating: number, review: string) {
    setIsProcessing(true);
    try {
      // 1. Update engagement with rating
      await updateDoc(doc(db, "engagements", engagementId), {
        rating,
        review,
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      // 2. Add system message
      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: `Project marked as complete. OFW left a ${rating}-star review.`,
        type: "system",
        createdAt: serverTimestamp(),
      });

      setShowRatingModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  const progress = engagement.mode === "session" 
    ? (engagement.status === "completed" ? 100 : 0) 
    : (milestones.filter(m => m.status === 'released').length / milestones.length * 100 || 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/engagements" className="p-3 rounded-2xl bg-white border border-akaroa/10 text-rhino hover:bg-rhino hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-rhino">{engagement.title}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                engagement.status === "REQUESTED" ? "bg-desert/10 text-desert border-desert/20" :
                engagement.status === "PROPOSAL" ? "bg-blue-50 text-blue-600 border-blue-100" :
                engagement.status === "WAITING_FOR_DEPOSIT" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                engagement.status === "ESCROW_LOCKED" ? "bg-green-50 text-green-600 border-green-100" :
                "bg-rhino/5 text-rhino/40 border-akaroa/10"
              )}>
                {engagement.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-body text-sm text-rhino/50">
              <span className="flex items-center gap-1.5 font-bold text-desert">
                <User className="w-4 h-4" />
                {user?.role === 'ofw' ? (engagement.consultantName || 'Expert Partner') : (engagement.ofwName || 'OFW Client')}
              </span>
              <span>•</span>
              <span className="capitalize">{engagement.mode || "Project"} Mode</span>
              <span>•</span>
              <span className="capitalize">{engagement.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-3xl border border-akaroa/10 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="pr-4 text-left">
            <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Escrow Vault</p>
            <p className="text-sm font-bold text-rhino">₱{(engagement.totalAmount || 0).toLocaleString()} {engagement.status === 'ESCROW_LOCKED' ? 'Locked 🔒' : 'Pending'}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-rhino/5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <Link 
            key={tab.label} 
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-body transition-all",
              isActive(tab.href) 
                ? "bg-white text-rhino shadow-md" 
                : "text-rhino/40 hover:text-rhino/60"
            )}
          >
            <tab.icon className={cn("w-4 h-4", isActive(tab.href) ? "text-desert" : "text-rhino/20")} />
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Phase 3: REQUESTED -> PROPOSAL (Consultant View) */}
      {engagement.status === "REQUESTED" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-akaroa/10 text-left space-y-6 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-rhino">OFW Profile Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-rhino/5 border border-akaroa/10">
                <div className="w-14 h-14 rounded-2xl bg-rhino text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-rhino/20">
                  {(engagement.metadata?.ofwName || "?")[0]}
                </div>
                <div>
                  <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">Client Name</p>
                  <p className="text-lg font-bold text-rhino">{engagement.metadata?.ofwName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-desert/5 border border-desert/10">
                  <p className="text-[10px] text-desert/60 font-bold uppercase tracking-widest">Primary Goal</p>
                  <p className="text-md font-bold text-rhino">{engagement.metadata?.ofwGoal}</p>
                </div>
                <div className="p-5 rounded-3xl bg-green-50 border border-green-100">
                  <p className="text-[10px] text-green-600/60 font-bold uppercase tracking-widest">Province</p>
                  <p className="text-md font-bold text-rhino">{engagement.metadata?.ofwProvince}</p>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] text-blue-600/60 font-bold uppercase tracking-widest">Investment Capacity</p>
                <p className="text-md font-bold text-rhino">{engagement.metadata?.ofwSalaryRange?.replace('_', ' - ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-rhino p-10 rounded-[3rem] text-white text-left space-y-6 relative overflow-hidden shadow-2xl shadow-rhino/30">
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold">Submit Roadmap Proposal</h2>
                <p className="text-xs text-akaroa/60 font-body leading-relaxed">
                  Based on this client&apos;s goal of <strong>{engagement.metadata?.ofwGoal}</strong>, upload a feasibility study and roadmap (PDF). The client must accept this before you can start.
                </p>
              </div>
              
              {user?.role === "consultant" ? (
                <div className="space-y-4 pt-4">
                  <div className="p-8 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-desert/50 transition-all cursor-pointer bg-white/5 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-akaroa" />
                    </div>
                    <p className="text-xs font-bold text-akaroa/60">Drop Roadmap PDF here</p>
                  </div>
                  <Button 
                    fullWidth
                    onClick={() => handleProposalAction("PROPOSAL", "Consultant has submitted a formal project proposal.")}
                    isLoading={isProcessing}
                    size="md" 
                    className="bg-desert hover:bg-walnut border-none h-16 rounded-2xl shadow-xl shadow-desert/20 font-bold"
                  >
                    Submit Proposal for Review
                  </Button>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <FileSearch className="w-6 h-6 text-akaroa" />
                  </div>
                  <span className="text-xs font-bold text-akaroa">Expert is crafting your roadmap...</span>
                </div>
              )}
            </div>
            <FileText className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
          </div>
        </div>
      )}

      {/* Phase 3: PROPOSAL Acceptance (OFW View) */}
      {engagement.status === "PROPOSAL" && (
        <div className="bg-white p-12 rounded-[3rem] border-4 border-desert/20 shadow-2xl shadow-desert/5 space-y-10 text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-desert text-white flex items-center justify-center shadow-2xl shadow-desert/20">
                <Handshake className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading text-3xl font-bold text-rhino">Roadmap Proposal</h2>
                <p className="text-sm font-body text-rhino/50">Review the expert&apos;s proposed strategy and deliverables.</p>
              </div>
            </div>
            <div className="flex gap-4">
              {user?.role === "ofw" ? (
                <>
                  <Button variant="ghost" className="h-16 px-8 rounded-2xl border-rhino/10 hover:bg-rhino/5 font-bold">Request Changes</Button>
                  <Button 
                    onClick={() => handleProposalAction("WAITING_FOR_DEPOSIT", "OFW accepted proposal. Awaiting deposit to escrow.")}
                    isLoading={isProcessing}
                    className="bg-rhino border-none text-white h-16 px-12 rounded-2xl shadow-2xl shadow-rhino/20 font-bold"
                  >
                    Accept Roadmap & Proceed
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </>
              ) : (
                <div className="px-10 py-5 rounded-2xl bg-rhino/5 border border-akaroa/10 text-sm font-bold text-rhino/40 flex items-center gap-3">
                  <Clock className="w-5 h-5 animate-spin-slow" />
                  Awaiting OFW Decision...
                </div>
              )}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-desert/5 border border-desert/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-desert/20 flex items-center justify-center text-desert">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-rhino">Sundo_Project_Feasibility_Study.pdf</p>
                <p className="text-[10px] text-rhino/40 font-body">Uploaded by {engagement.metadata?.consultantName || "Expert"} • 2.4 MB</p>
              </div>
            </div>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-desert/20 text-desert hover:bg-desert hover:text-white font-bold transition-all">
              Preview Full Document
            </Button>
          </div>
        </div>
      )}

      {/* Phase 4: Escrow Gate (OFW View) */}
      {engagement.status === "WAITING_FOR_DEPOSIT" && (
        <div className="bg-rhino p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 text-left relative overflow-hidden shadow-2xl shadow-rhino/40">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-akaroa">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-4xl font-bold">Secure Escrow Deposit</h2>
            </div>
            <p className="font-body text-akaroa/60 max-w-md leading-relaxed">
              Your roadmap is ready. To activate the project workspace, deposit the total amount into the <strong>Sundo Secure Vault</strong>.
            </p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-akaroa/40 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Milestone Payouts
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-akaroa/40 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> AI-Verified Releases
              </div>
            </div>
          </div>
          
          <div className="relative z-10 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full md:w-auto min-w-[320px] space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-akaroa/40 uppercase tracking-widest text-center">Total Project Cost</p>
              <p className="text-4xl font-bold text-white text-center">₱{(engagement.totalAmount || 0).toLocaleString()}</p>
            </div>
            {user?.role === "ofw" ? (
              <Button 
                onClick={() => handleProposalAction("ESCROW_LOCKED", "Escrow funded. Project is now active.")}
                isLoading={isProcessing}
                fullWidth
                className="bg-desert hover:bg-walnut border-none text-white h-16 rounded-2xl shadow-xl shadow-desert/20 font-bold text-lg"
              >
                Fund Escrow Vault
              </Button>
            ) : (
              <div className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-akaroa text-center">
                Awaiting OFW Deposit...
              </div>
            )}
            <p className="text-[9px] text-center text-akaroa/30 uppercase tracking-widest font-bold">Encrypted by Sundo Vault v2.0</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-desert/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
      )}

      {/* Phase 5: Completion */}
      {engagement.status === "in_progress" && progress === 100 && user?.role === "ofw" && (
        <div className="bg-green-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Project Finalized</h2>
            </div>
            <p className="font-body text-white/70 max-w-md">
              All milestones have been verified by AI and funds released. Mark the project as complete to close the engagement.
            </p>
          </div>
          <Button 
            onClick={() => setShowRatingModal(true)}
            isLoading={isProcessing}
            className="bg-rhino border-none text-white h-16 px-12 rounded-2xl shadow-xl"
          >
            Mark as Complete
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-akaroa/10 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-rhino">Engagement Progress</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-rhino/40 uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Updated {new Date(engagement.updatedAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="space-y-6 text-left">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-rhino font-heading">{Math.round(progress)}%</p>
                  <p className="text-sm text-rhino/50 font-body">
                    {engagement.mode === "session" ? "1-hour session engagement" : `${milestones.filter(m => m.status === 'released').length} of ${milestones.length} milestones released`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-desert font-body uppercase tracking-widest">Escrow Balance</p>
                  <p className="text-xl font-bold text-rhino font-heading">
                    ₱{(engagement.totalAmount - milestones.filter(m => m.status === 'released').reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-4 w-full bg-rhino/5 rounded-full overflow-hidden border border-rhino/5">
                <div className="h-full bg-rhino transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-akaroa/10 shadow-sm space-y-8">
            <h2 className="font-heading text-2xl font-bold text-rhino text-left">Project Overview</h2>
            <div className="font-body text-rhino/70 text-left leading-relaxed space-y-4">
              <p>{engagement.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-akaroa/10">
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Category</p>
                <p className="text-sm font-bold text-rhino capitalize">{engagement.category}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Status</p>
                <p className="text-sm font-bold text-rhino capitalize">{engagement.status.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Mode</p>
                <p className="text-sm font-bold text-rhino capitalize">{engagement.mode}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Vault</p>
                <p className="text-sm font-bold text-desert capitalize">{engagement.escrowStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-rhino rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden group">
            <div className="relative z-10 space-y-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-akaroa">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Workroom</h3>
                  <p className="text-xs text-akaroa/60 font-body">Digital Workspace active</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href={`/engagements/${engagementId}/chat`}>
                  <Button fullWidth className="h-12 rounded-xl bg-desert hover:bg-walnut border-none text-[10px]">
                    Open Chat
                    <MessageSquare className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
                <Link href={`/engagements/${engagementId}/milestones`}>
                  <Button fullWidth variant="ghost" className="h-12 rounded-xl text-[10px] bg-white/10 border-none text-white hover:bg-white/20">
                    Track Tasks
                    <Layers className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <Calendar className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-akaroa/10 shadow-sm space-y-6 text-left">
            <h3 className="font-heading text-xl font-bold text-rhino">Vault Checklist</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md border-2 border-green-500 flex items-center justify-center text-green-500">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-xs font-body text-rhino/60">Profile ID Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", engagement.status !== 'proposal_pending' ? "border-green-500 text-green-500" : "border-akaroa/20")}>
                  {engagement.status !== 'proposal_pending' && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className="text-xs font-body text-rhino/60">Roadmap Submitted</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", engagement.escrowStatus === 'funded' ? "border-green-500 text-green-500" : "border-akaroa/20")}>
                  {engagement.escrowStatus === 'funded' && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className="text-xs font-body text-rhino/60">Escrow Funded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RatingModal 
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        isSubmitting={isProcessing}
        consultantName={engagement.consultantName || "Your Expert"}
      />
    </div>
  );
}
