"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
  Layers, 
  ShieldCheck, 
  FileText,
  MessageSquare,
  CheckCircle2,
  Lock,
  Clock,
  Upload,
  AlertCircle,
  CreditCard,
  Plus,
  ArrowRight,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/cn";
import { processDocumentUpload } from "@/app/actions/validation";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEngagement } from "@/hooks/useEngagement";
import { useAuthStore } from "@/store/useAuthStore";
import { updateDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RatingModal } from "@/components/engagements/RatingModal";

export default function ProjectManagerPage() {
  const params = useParams();
  const pathname = usePathname();
  const engagementId = params.engagementId as string;
  const { user } = useAuthStore();
  const { engagement, milestones, isLoading } = useEngagement(engagementId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [uploadingTaskId, setUploadingTaskId] = useState<{ mId: string, tIdx: number } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!engagement) return <div className="text-center py-20 font-heading text-2xl">Engagement not found</div>;

  async function handleRatingSubmit(rating: number, review: string) {
    setIsProcessing(true);
    try {
      // 1. Update engagement with rating and release funds
      await updateDoc(doc(db, "engagements", engagementId), {
        rating,
        review,
        status: "completed",
        escrowStatus: "released",
        updatedAt: serverTimestamp(),
      });

      // 2. Add system message
      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: `Project marked as complete. OFW released ₱${(engagement.totalAmount || 0).toLocaleString()} to consultant.`,
        type: "system",
        createdAt: serverTimestamp(),
      });

      setShowRatingModal(false);
      alert("Project completed successfully! Funds have been released to the expert.");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  const tabs = [
    { label: "Overview", href: `/engagements/${engagementId}`, icon: Layers },
    { label: "Chat", href: `/engagements/${engagementId}/chat`, icon: MessageSquare },
    { label: user?.role === "consultant" ? "Project Manager" : "Task Tracker", href: `/engagements/${engagementId}/milestones`, icon: ShieldCheck },
    { label: "Vault", href: `/engagements/${engagementId}/vault`, icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  async function handleFundEscrow() {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "engagements", engagementId), {
        escrowStatus: "funded",
        status: "ESCROW_LOCKED",
        updatedAt: serverTimestamp()
      });
      
      // Initialize first milestone if locked
      if (milestones.length > 0) {
        await updateDoc(doc(db, "engagements", engagementId, "milestones", milestones[0].id), {
          status: "in_progress"
        });
      }

      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: "Escrow funds locked. Project execution phase is now active.",
        type: "system",
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAddTask(milestoneId: string, currentTasks: any[] = []) {
    if (engagement.status === "REQUESTED" || engagement.status === "PROPOSAL") {
      alert("Consultant can only add tasks after the roadmap is accepted.");
      return;
    }
    if (!newTask.trim()) return;
    setIsProcessing(true);
    try {
      const taskObj = Array.isArray(currentTasks) 
        ? currentTasks.map(t => typeof t === 'string' ? { title: t, completed: false } : t)
        : [];

      await updateDoc(doc(db, "engagements", engagementId, "milestones", milestoneId), {
        tasks: [...taskObj, { title: newTask.trim(), completed: false, isVerified: false }]
      });
      setNewTask("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleTask(milestoneId: string, currentTasks: any[], taskIndex: number) {
    if (user?.role !== "consultant") return;
    if (engagement.status === "REQUESTED" || engagement.status === "PROPOSAL") return;
    
    const taskObj = currentTasks.map(t => typeof t === 'string' ? { title: t, completed: false } : { ...t });
    taskObj[taskIndex].completed = !taskObj[taskIndex].completed;

    try {
      await updateDoc(doc(db, "engagements", engagementId, "milestones", milestoneId), {
        tasks: taskObj
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleVerifyWithAI(e: React.ChangeEvent<HTMLInputElement>, mId: string, tIdx: number, tasks: any[], isFinal: boolean = false) {
    if (engagement.status === "REQUESTED" || engagement.status === "PROPOSAL") return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTaskId({ mId, tIdx });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("engagementId", engagementId);
    formData.append("milestoneId", mId);
    formData.append("expectedType", isFinal ? "Final Milestone Deliverable" : tasks[tIdx].title);

    try {
      const result = await processDocumentUpload(formData);
      
      if (result.status === "passed") {
        if (isFinal) {
          // Update final deliverable status
          await updateDoc(doc(db, "engagements", engagementId, "milestones", mId), {
            status: "AI_AUDITED",
            finalDeliverable: {
              isVerified: true,
              proofUrl: "mock_url",
              verifiedAt: serverTimestamp()
            }
          });
          
          await addDoc(collection(db, "engagements", engagementId, "messages"), {
            senderId: "system",
            content: `Final Deliverable for milestone passed AI Audit. OFW: Please review and approve for payout.`,
            type: "system",
            createdAt: serverTimestamp()
          });
        } else {
          const updatedTasks = [...tasks];
          updatedTasks[tIdx] = { 
            ...updatedTasks[tIdx], 
            completed: true, 
            isVerified: true, 
            proofUrl: "mock_url",
            verifiedAt: serverTimestamp()
          };
          
          await updateDoc(doc(db, "engagements", engagementId, "milestones", mId), {
            tasks: updatedTasks
          });
        }
      } else {
        alert(`AI Audit Failed: ${result.analysis}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingTaskId(null);
    }
  }

  async function handleApproveMilestone(milestoneId: string) {
    if (user?.role !== "ofw") return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "engagements", engagementId, "milestones", milestoneId), {
        status: "verified",
        verifiedAt: serverTimestamp()
      });

      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: `OFW approved milestone deliverables. Progress confirmed.`,
        type: "system",
        createdAt: serverTimestamp()
      });

      alert("Progress confirmed! The roadmap has been updated.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCreateMilestone() {
    if (user?.role !== "consultant" || milestones.length > 0) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "engagements", engagementId, "milestones"), {
        title: "Initial Phase: Strategy & Foundation",
        status: "in_progress",
        tasks: [
          { title: "Detailed Feasibility Audit", completed: false, isVerified: false },
          { title: "On-ground Resource Allocation", completed: false, isVerified: false }
        ],
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: "Expert has initialized the project roadmap with the first milestone.",
        type: "system",
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/engagements" className="p-3 rounded-2xl bg-white border border-akaroa/10 text-rhino hover:bg-rhino hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-rhino">
                {user?.role === "consultant" ? "Project Manager" : "Task Tracker"}
              </h1>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border capitalize",
                engagement.status === "ESCROW_LOCKED" ? "bg-green-50 text-green-600 border-green-100" : "bg-rhino/5 text-rhino/40 border-akaroa/10"
              )}>
                {engagement.status.replace('_', ' ')}
              </span>
            </div>
            <p className="font-body text-xs text-rhino/40">Real-time local project coordination</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-rhino/5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <Link 
              key={tab.label} 
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-body transition-all",
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {/* Workspace Intelligence Banner */}
          {(engagement.status === "ESCROW_LOCKED" || engagement.status === "EXECUTION") && (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-desert/10 shadow-xl shadow-desert/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-desert/10 flex items-center justify-center text-desert group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="text-left space-y-1">
                  <h3 className="font-heading font-bold text-rhino text-xl">Workspace Intelligence</h3>
                  <p className="text-xs text-rhino/50 font-body">AI is auditing your shared milestones in real-time.</p>
                </div>
              </div>
              <div className="relative z-10 flex gap-4">
                <div className="px-4 py-2 bg-rhino/5 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-rhino/30 uppercase tracking-widest">Health</p>
                  <p className="text-sm font-bold text-green-600">Optimal</p>
                </div>
                <div className="px-4 py-2 bg-rhino/5 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-rhino/30 uppercase tracking-widest">Velocity</p>
                  <p className="text-sm font-bold text-rhino">3.2 tasks/wk</p>
                </div>
              </div>
            </div>
          )}

          {/* Final Completion Banner */}
          {(engagement.status === "ESCROW_LOCKED" || engagement.status === "EXECUTION") && 
           milestones.length > 0 && 
           milestones.every(m => m.status === 'verified') && 
           user?.role === "ofw" && (
            <div className="bg-green-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl shadow-green-600/20">
              <div className="space-y-4 text-left relative z-10">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-4xl font-bold">Project Success!</h3>
                  <span className="px-3 py-1 rounded-full bg-white text-green-600 text-[10px] font-bold uppercase tracking-widest">Deliverables Verified</span>
                </div>
                <p className="font-body text-white/80 max-w-lg text-lg leading-relaxed">
                  All milestones have been verified and approved. You can now finalize the project to release the ₱{(engagement.totalAmount || 0).toLocaleString()} payout to the expert.
                </p>
              </div>
              <Button 
                onClick={() => setShowRatingModal(true)}
                size="md" 
                className="relative z-10 bg-white text-green-600 hover:bg-green-50 border-none px-12 h-20 rounded-[2rem] shadow-2xl shadow-black/10 font-bold text-xl group"
              >
                Mark as Complete & Payout
                <ArrowRight className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform" />
              </Button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            </div>
          )}

          {engagement.status === "WAITING_FOR_DEPOSIT" && user?.role === "ofw" && (
            <div className="bg-rhino p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
              <div className="space-y-4 text-left relative z-10">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-4xl font-bold">Secure the Roadmap</h3>
                  <span className="px-3 py-1 rounded-full bg-desert text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">Action Required</span>
                </div>
                <p className="font-body text-akaroa/60 max-w-lg text-lg leading-relaxed">
                  To activate this digital workspace, please deposit the project budget into the Sundo Vault. Funds are protected and only released upon AI deliverable verification.
                </p>
              </div>
              <Button 
                onClick={handleFundEscrow} 
                isLoading={isProcessing}
                size="md" 
                className="relative z-10 bg-desert hover:bg-walnut border-none px-12 h-20 rounded-[2rem] shadow-2xl shadow-desert/20 font-bold text-xl group"
              >
                Deposit ₱{(engagement.totalAmount || 0).toLocaleString()}
                <CreditCard className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform" />
              </Button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            </div>
          )}

          {engagement.status !== "ESCROW_LOCKED" && engagement.status !== "EXECUTION" && engagement.status !== "completed" && engagement.status !== "WAITING_FOR_DEPOSIT" && (
            <div className="bg-white p-20 rounded-[3rem] border border-dashed border-akaroa/20 text-center space-y-6">
              <div className="w-24 h-24 bg-rhino/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                <Lock className="w-12 h-12 text-rhino/20" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-rhino text-2xl">Digital Workspace Initializing</h3>
                <p className="text-sm text-rhino/40 font-body max-w-xs mx-auto">This collaborative ecosystem will unlock once the initial roadmap proposal is accepted and funded.</p>
              </div>
            </div>
          )}

          {(engagement.status === "ESCROW_LOCKED" || engagement.status === "EXECUTION" || engagement.status === "completed") && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-rhino text-2xl">Active Ecosystem Milestones</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-rhino/40">
                  <Clock className="w-4 h-4" /> Last update: 2m ago
                </div>
              </div>
              
              <div className="space-y-6">
                {milestones.length === 0 ? (
                  <div className="bg-white p-20 rounded-[3rem] border border-akaroa/10 text-center space-y-8 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-rhino/5 rounded-full flex items-center justify-center">
                      <Plus className="w-10 h-10 text-rhino/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-heading font-bold text-rhino text-xl">No roadmap defined yet</p>
                      <p className="font-body text-rhino/40 text-sm max-w-xs mx-auto">
                        {user?.role === "consultant" 
                          ? "Initialize your first milestone to start tracking tasks and deliverables."
                          : "Your expert hasn't defined the project milestones yet."}
                      </p>
                    </div>
                    {user?.role === "consultant" && (
                      <Button 
                        onClick={handleCreateMilestone}
                        isLoading={isProcessing}
                        className="bg-rhino border-none text-white h-14 px-10 rounded-2xl shadow-xl shadow-rhino/10"
                      >
                        Define Initial Milestone
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  milestones.map((m, i) => (
                    <div key={m.id} className={cn(
                      "bg-white rounded-[3rem] border transition-all overflow-hidden",
                      m.status === "in_progress" ? "border-desert ring-1 ring-desert/10 shadow-2xl shadow-desert/5" : 
                      m.status === "AI_AUDITED" ? "border-blue-500 ring-1 ring-blue-500/10 shadow-2xl shadow-blue-500/5" :
                      m.status === "verified" ? "border-green-500 ring-1 ring-green-500/10 shadow-2xl shadow-green-500/5" :
                      "border-akaroa/10 shadow-sm opacity-90"
                    )}>
                      <div className="p-10 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex items-center gap-8">
                            <div className={cn(
                              "w-20 h-20 rounded-[2rem] flex items-center justify-center font-bold text-3xl shadow-xl",
                              m.status === "verified" || m.status === "released" ? "bg-green-500 text-white shadow-green-500/20" :
                              m.status === "AI_AUDITED" ? "bg-blue-600 text-white shadow-blue-600/20" :
                              m.status === "in_progress" ? "bg-desert text-white shadow-desert/20" : "bg-rhino/5 text-rhino/20"
                            )}>
                              {m.status === "verified" || m.status === "released" ? <CheckCircle2 className="w-10 h-10" /> : 
                               m.status === "AI_AUDITED" ? <ShieldCheck className="w-10 h-10" /> :
                               m.status === "locked" ? <Lock className="w-8 h-8" /> : i + 1}
                            </div>
                            <div className="space-y-2 text-left">
                              <h3 className="font-heading text-3xl font-bold text-rhino">{m.title}</h3>
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-rhino/5 text-rhino/40 text-[10px] font-bold uppercase tracking-widest">
                                  {m.tasks?.length || 0} Assets
                                </span>
                                {m.status === 'in_progress' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-desert uppercase animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-desert" /> Active Execution
                                  </span>
                                )}
                                {m.status === 'AI_AUDITED' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" /> AI Verified • Awaiting Review
                                  </span>
                                )}
                                {m.status === 'verified' && (
                                   <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                     <CheckCircle2 className="w-4 h-4" /> Progress Confirmed
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>

                           <div className="flex items-center gap-4">
                             {m.status === "AI_AUDITED" && user?.role === "ofw" && (
                               <Button 
                                 onClick={() => handleApproveMilestone(m.id)}
                                 isLoading={isProcessing}
                                 className="bg-rhino hover:bg-rhino/90 h-16 px-8 rounded-2xl shadow-xl shadow-rhino/20 font-bold"
                               >
                                 Review & Approve
                                 <ArrowRight className="ml-2 w-4 h-4" />
                               </Button>
                             )}
                           </div>
                         </div>

                        {/* Streamlining / Coordination Tasks */}
                        <div className="space-y-4 pt-10 border-t border-akaroa/5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-rhino/30 uppercase tracking-widest">Execution Streamlining</h4>
                            <span className="text-[10px] text-rhino/20 font-body">Internal tracking only</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {m.tasks?.map((task: any, tIdx: number) => {
                              const title = typeof task === 'string' ? task : task.title;
                              const completed = typeof task === 'string' ? (m.status !== 'in_progress' && m.status !== 'locked') : task.completed;

                              return (
                                <div key={tIdx} className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                  completed ? "bg-green-50/20 border-green-100" : "bg-rhino/5 border-transparent"
                                )}>
                                  <button 
                                    onClick={() => handleToggleTask(m.id, m.tasks ?? [], tIdx)}
                                    className={cn(
                                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                      completed ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" : "border-akaroa/20 text-rhino/20 bg-white"
                                    )}
                                  >
                                    {completed && <CheckCircle2 className="w-4 h-4" />}
                                  </button>
                                  <p className={cn(
                                    "text-sm font-bold font-body truncate",
                                    completed ? "text-rhino/20 line-through" : "text-rhino/60"
                                  )}>{title}</p>
                                </div>
                              );
                            })}
                          </div>

                          {user?.role === "consultant" && (m.status === "in_progress" || m.status === "locked") && (
                            <div className="flex items-center gap-3 pt-4">
                              <input 
                                type="text" 
                                placeholder="Add streamlining task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask(m.id, m.tasks)}
                                className="flex-1 h-12 px-6 rounded-xl bg-rhino/5 border-transparent outline-none font-body text-xs focus:bg-white focus:border-akaroa/20 transition-all"
                              />
                              <Button 
                                onClick={() => handleAddTask(m.id, m.tasks)}
                                size="sm"
                                className="h-12 w-12 p-0 rounded-xl bg-rhino/10 hover:bg-rhino text-rhino hover:text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Final Phase Deliverable Goal */}
                        <div className="mt-10 p-8 rounded-[2rem] bg-desert/5 border-2 border-desert/20 space-y-6 relative overflow-hidden group">
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 rounded-2xl bg-desert text-white flex items-center justify-center shadow-lg shadow-desert/20">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-heading font-bold text-rhino text-xl">Final Milestone Deliverable</h4>
                                <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest">Required for Milestone Completion & Payout</p>
                              </div>
                            </div>
                            
                            {m.status === "verified" && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-500/10">
                                <ShieldCheck className="w-4 h-4" /> Final Deliverable Verified
                              </div>
                            )}
                          </div>

                          <div className="p-6 rounded-2xl bg-white border border-desert/10 text-left relative z-10">
                            <p className="font-body text-sm text-rhino/70 leading-relaxed italic">
                              &ldquo;The successful submission of the <strong>{m.title}</strong> deliverable document marks the completion of this phase. Once uploaded, Sundo's AI will verify the contents against project requirements before OFW satisfaction review.&rdquo;
                            </p>
                          </div>

                          {m.status === "in_progress" && user?.role === "consultant" && (
                            <div className="flex justify-center pt-4 relative z-10">
                              <input 
                                type="file" 
                                id={`final-deliverable-${m.id}`} 
                                className="hidden" 
                                onChange={(e) => handleVerifyWithAI(e, m.id, 0, m.tasks || [], true)}
                                accept="image/*,application/pdf"
                              />
                              <label 
                                htmlFor={`final-deliverable-${m.id}`}
                                className={cn(
                                  "inline-flex items-center justify-center h-16 px-10 rounded-2xl font-heading font-bold text-sm cursor-pointer transition-all shadow-xl",
                                  isProcessing ? "bg-desert/50 text-white animate-pulse" : "bg-desert text-white hover:bg-walnut shadow-desert/20"
                                )}
                              >
                                <Upload className="w-5 h-5 mr-3" />
                                {isProcessing ? "AI Auditing Final Deliverable..." : "Upload Final Deliverable for Review"}
                              </label>
                            </div>
                          )}

                          {m.status === "AI_AUDITED" && (
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between gap-6 relative z-10">
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                  <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-blue-900">AI Audit Passed Successfully</p>
                                  <p className="text-[10px] text-blue-700 font-body">Waiting for OFW Satisfaction Approval</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="bg-white border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-bold uppercase">
                                View Proof
                              </Button>
                            </div>
                          )}

                          <div className="absolute top-0 right-0 w-32 h-32 bg-desert/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8 text-left">
          <div className="bg-rhino rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-rhino/30 group">
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-bold">Trust Matrix</h3>
                <p className="text-xs text-akaroa/50 font-body leading-relaxed">
                  Every asset is cryptographically linked to the Sundo Vault. AI verification triggers immediate fund release.
                </p>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 space-y-6 border border-white/10">
                <div className="space-y-1">
                  <p className="text-[10px] text-akaroa/40 font-body uppercase tracking-widest font-bold">Verified Assets</p>
                  <p className="text-4xl font-bold font-heading">
                    {milestones.reduce((acc, m) => acc + (m.tasks?.filter((t: any) => typeof t === 'string' ? m.status === 'released' : t.isVerified).length || 0), 0)}
                  </p>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-desert w-[40%]" />
                </div>
              </div>
            </div>
            <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-desert rounded-[3rem] p-10 text-white space-y-6 shadow-2xl shadow-desert/20">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6" />
              <h3 className="font-heading font-bold text-xl">AI Validator</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-bold">Active Auditing</p>
                </div>
              </div>
              <p className="text-[11px] text-white/70 font-body leading-relaxed">
                Gemini is currently monitoring the <strong>{engagement.title}</strong> ecosystem for deliverable compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
      {showRatingModal && (
        <RatingModal 
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
