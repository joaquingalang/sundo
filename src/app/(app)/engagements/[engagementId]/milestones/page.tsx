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

export default function ProjectManagerPage() {
  const params = useParams();
  const pathname = usePathname();
  const engagementId = params.engagementId as string;
  const { user } = useAuthStore();
  const { engagement, milestones, isLoading } = useEngagement(engagementId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [uploadingTaskId, setUploadingTaskId] = useState<{ mId: string, tIdx: number } | null>(null);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!engagement) return <div className="text-center py-20 font-heading text-2xl">Engagement not found</div>;

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
    if (engagement.status !== "ESCROW_LOCKED") {
      alert("Consultant cannot add tasks until Escrow is LOCKED.");
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
    if (engagement.status !== "ESCROW_LOCKED") return;
    
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

  async function handleVerifyWithAI(e: React.ChangeEvent<HTMLInputElement>, mId: string, tIdx: number, tasks: any[]) {
    if (engagement.status !== "ESCROW_LOCKED") return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTaskId({ mId, tIdx });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("engagementId", engagementId);
    formData.append("milestoneId", mId);
    formData.append("expectedType", tasks[tIdx].title);

    try {
      const result = await processDocumentUpload(formData);
      
      if (result.status === "passed") {
        const updatedTasks = [...tasks];
        updatedTasks[tIdx] = { 
          ...updatedTasks[tIdx], 
          completed: true, 
          isVerified: true, 
          proofUrl: "mock_url",
          verifiedAt: new Date()
        };
        
        await updateDoc(doc(db, "engagements", engagementId, "milestones", mId), {
          tasks: updatedTasks
        });

        // Phase 5: Payout Check
        const allVerified = updatedTasks.every(t => t.isVerified);
        if (allVerified) {
          await updateDoc(doc(db, "engagements", engagementId, "milestones", mId), {
            status: "released"
          });
          
          // Trigger system message for payout
          await addDoc(collection(db, "engagements", engagementId, "messages"), {
            senderId: "system",
            content: `Deliverables verified for milestone. Funds released to expert.`,
            type: "system",
            createdAt: serverTimestamp()
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
                  <div className="bg-white p-20 rounded-[3rem] border border-akaroa/10 text-center space-y-4">
                    <Plus className="w-12 h-12 text-rhino/20 mx-auto" />
                    <p className="font-heading font-bold text-rhino">Waiting for Expert to define first milestone.</p>
                  </div>
                ) : (
                  milestones.map((m, i) => (
                    <div key={m.id} className={cn(
                      "bg-white rounded-[3rem] border transition-all overflow-hidden",
                      m.status === "in_progress" ? "border-desert ring-1 ring-desert/10 shadow-2xl shadow-desert/5" : "border-akaroa/10 shadow-sm opacity-90"
                    )}>
                      <div className="p-10 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex items-center gap-8">
                            <div className={cn(
                              "w-20 h-20 rounded-[2rem] flex items-center justify-center font-bold text-3xl shadow-xl",
                              m.status === "released" ? "bg-green-500 text-white shadow-green-500/20" :
                              m.status === "in_progress" ? "bg-desert text-white shadow-desert/20" : "bg-rhino/5 text-rhino/20"
                            )}>
                              {m.status === "released" ? <CheckCircle2 className="w-10 h-10" /> : 
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
                              </div>
                            </div>
                          </div>

                          <div className="bg-rhino/5 p-6 rounded-3xl text-right min-w-[200px]">
                            <p className="text-[10px] text-rhino/30 font-body uppercase tracking-widest font-bold">Milestone Value</p>
                            <p className="text-3xl font-bold text-rhino font-heading">₱{m.amount.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-rhino/20 uppercase mt-1">Escrow Protected</p>
                          </div>
                        </div>

                        {/* Task ecosystem */}
                        {(m.status === "in_progress" || m.status === "released") && (
                          <div className="space-y-4 pt-10 border-t border-akaroa/5">
                            {m.tasks?.map((task: any, tIdx: number) => {
                              const title = typeof task === 'string' ? task : task.title;
                              const completed = typeof task === 'string' ? (m.status === 'released') : task.completed;
                              const isVerified = typeof task === 'string' ? (m.status === 'released') : task.isVerified;
                              const isThisUploading = uploadingTaskId?.mId === m.id && uploadingTaskId?.tIdx === tIdx;

                              return (
                                <div key={tIdx} className={cn(
                                  "flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border transition-all gap-4",
                                  isVerified ? "bg-green-50/30 border-green-100" : "bg-rhino/5 border-transparent hover:border-desert/20"
                                )}>
                                  <div className="flex items-center gap-6 flex-1">
                                    <button 
                                      onClick={() => handleToggleTask(m.id, m.tasks ?? [], tIdx)}
                                      disabled={isVerified}
                                      className={cn(
                                        "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                                        completed ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" : "border-akaroa/20 text-rhino/20 bg-white"
                                      )}
                                    >
                                      {completed && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                    <div className="text-left">
                                      <p className={cn(
                                        "text-lg font-bold font-body",
                                        completed ? "text-rhino/40 line-through" : "text-rhino"
                                      )}>{title}</p>
                                      {isVerified ? (
                                        <div className="flex items-center gap-2 mt-1">
                                          <ShieldCheck className="w-4 h-4 text-green-600" />
                                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">AI Verified Deliverable</span>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] text-rhino/30 font-body uppercase tracking-wider mt-1">Status: Pending Verification</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {isVerified && (
                                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl bg-white border-akaroa/10 text-rhino/60 hover:bg-rhino hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest">
                                        View Asset
                                      </Button>
                                    )}
                                    {user?.role === "consultant" && !isVerified && m.status === "in_progress" && (
                                      <div className="relative">
                                        <input 
                                          type="file" 
                                          id={`verify-${m.id}-${tIdx}`} 
                                          className="hidden" 
                                          onChange={(e) => handleVerifyWithAI(e, m.id, tIdx, m.tasks)}
                                          accept="image/*,application/pdf"
                                        />
                                        <label 
                                          htmlFor={`verify-${m.id}-${tIdx}`}
                                          className={cn(
                                            "flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-md",
                                            isThisUploading ? "bg-desert text-white animate-pulse" : "bg-white text-rhino hover:bg-rhino hover:text-white border border-akaroa/10"
                                          )}
                                        >
                                          {isThisUploading ? (
                                            <>
                                              <BrainCircuit className="w-4 h-4 animate-spin" />
                                              AI Auditing...
                                            </>
                                          ) : (
                                            <>
                                              <Upload className="w-4 h-4" />
                                              Submit Proof
                                            </>
                                          )}
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {user?.role === "consultant" && m.status === "in_progress" && (
                              <div className="flex items-center gap-4 pt-6">
                                <div className="flex-1 relative">
                                  <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rhino/20" />
                                  <input 
                                    type="text" 
                                    placeholder="Add specialized task to roadmap..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(m.id, m.tasks)}
                                    className="w-full h-16 pl-14 pr-6 rounded-[1.5rem] bg-rhino/5 border-transparent outline-none font-body text-sm focus:bg-white focus:border-akaroa/20 transition-all shadow-inner"
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleAddTask(m.id, m.tasks)}
                                  className="h-16 w-16 p-0 rounded-[1.5rem] bg-desert hover:bg-walnut shadow-xl shadow-desert/20"
                                >
                                  <ArrowRight className="w-6 h-6" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
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
    </div>
  );
}
