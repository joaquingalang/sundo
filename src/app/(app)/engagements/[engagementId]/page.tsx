"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
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
  AlertCircle
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
    { label: "Milestones", href: `/engagements/${engagementId}/milestones`, icon: ShieldCheck },
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
                engagement.status === "in_progress" ? "bg-blue-50 text-blue-600 border-blue-100" :
                engagement.status === "proposal_pending" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                engagement.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                "bg-rhino/5 text-rhino/40 border-akaroa/10"
              )}>
                {engagement.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-body text-sm text-rhino/50">
              <span className="capitalize">{engagement.mode} Mode</span>
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
            <p className="text-sm font-bold text-rhino">₱{engagement.totalAmount.toLocaleString()} {engagement.escrowStatus === 'funded' ? 'Locked 🔒' : 'Pending Funding'}</p>
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

      {/* Phase 3: The Handshake UI */}
      {engagement.status === "proposal_pending" && (
        <div className="bg-rhino p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-akaroa">
                <FileSearch className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Phase 3: The Roadmap</h2>
            </div>
            <p className="font-body text-akaroa/60 max-w-md">
              {user?.role === "consultant" 
                ? "Define the project timeline and deliverables. Upload your proposal roadmap to proceed." 
                : "Waiting for the expert to upload a project roadmap/proposal."}
            </p>
          </div>
          {user?.role === "consultant" ? (
            <Button 
              onClick={() => handleProposalAction("awaiting_acceptance", "Consultant uploaded project roadmap/proposal.")}
              isLoading={isProcessing}
              size="lg" 
              className="bg-desert hover:bg-walnut border-none px-10 h-16 rounded-2xl shadow-xl shadow-desert/20"
            >
              Upload Proposal PDF
              <Upload className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
              <Clock className="w-5 h-5 text-akaroa" />
              <span className="text-xs font-bold font-body">Consultant is preparing proposal...</span>
            </div>
          )}
        </div>
      )}

      {engagement.status === "awaiting_acceptance" && user?.role === "ofw" && (
        <div className="bg-desert p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Handshake className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Review Handshake</h2>
            </div>
            <p className="font-body text-white/70 max-w-md">
              Expert has submitted the project roadmap. Review and accept the proposal to activate the escrow.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="bg-white/10 border-white/20 text-white h-16 px-10 rounded-2xl">Reject</Button>
            <Button 
              onClick={() => handleProposalAction("awaiting_escrow", "OFW accepted proposal. Awaiting escrow funding.")}
              isLoading={isProcessing}
              className="bg-rhino border-none text-white h-16 px-12 rounded-2xl shadow-xl"
            >
              Accept Proposal
              <CheckCircle2 className="ml-2 w-5 h-5" />
            </Button>
          </div>
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
        consultantName="Your Expert"
      />
    </div>
  );
}
