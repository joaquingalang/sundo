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
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEngagement } from "@/hooks/useEngagement";
import { useAuthStore } from "@/store/useAuthStore";
import { updateDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MilestoneTrackerPage() {
  const params = useParams();
  const pathname = usePathname();
  const engagementId = params.engagementId as string;
  const { user } = useAuthStore();
  const { engagement, milestones, isLoading } = useEngagement(engagementId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newTask, setNewTask] = useState("");

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!engagement) return <div className="text-center py-20 font-heading text-2xl">Engagement not found</div>;

  const tabs = [
    { label: "Overview", href: `/engagements/${engagementId}`, icon: Layers },
    { label: "Chat", href: `/engagements/${engagementId}/chat`, icon: MessageSquare },
    { label: "Milestones", href: `/engagements/${engagementId}/milestones`, icon: ShieldCheck },
    { label: "Vault", href: `/engagements/${engagementId}/vault`, icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  async function handleFundEscrow() {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "engagements", engagementId), {
        escrowStatus: "funded",
        status: "in_progress",
        updatedAt: serverTimestamp()
      });
      
      if (milestones.length > 0) {
        await updateDoc(doc(db, "engagements", engagementId, "milestones", milestones[0].id), {
          status: "in_progress"
        });
      }

      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: "Escrow funds deposited. Project is now active.",
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
    if (!newTask.trim()) return;
    setIsProcessing(true);
    try {
      const taskObj = typeof currentTasks[0] === 'string' 
        ? currentTasks.map(t => ({ title: t, completed: false }))
        : currentTasks;

      await updateDoc(doc(db, "engagements", engagementId, "milestones", milestoneId), {
        tasks: [...taskObj, { title: newTask.trim(), completed: false }]
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
    
    const taskObj = typeof currentTasks[0] === 'string' 
        ? currentTasks.map(t => ({ title: t, completed: false }))
        : [...currentTasks];

    taskObj[taskIndex].completed = !taskObj[taskIndex].completed;

    try {
      await updateDoc(doc(db, "engagements", engagementId, "milestones", milestoneId), {
        tasks: taskObj
      });
    } catch (error) {
      console.error(error);
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
              <h1 className="font-heading text-2xl font-bold text-rhino">{engagement.title}</h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-wider border border-blue-100 capitalize">
                {engagement.mode} Mode
              </span>
            </div>
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
        <div className="lg:col-span-3 space-y-6">
          {engagement.escrowStatus === "unfunded" && engagement.status === "in_progress" && user?.role === "ofw" && (
            <div className="bg-rhino p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-left">
                <h3 className="font-heading text-3xl font-bold">Phase 4: Fund Escrow</h3>
                <p className="font-body text-akaroa/60 max-w-md">
                  Secure the project by depositing the budget into the Vault. Payments are released per milestone.
                </p>
              </div>
              <Button 
                onClick={handleFundEscrow} 
                isLoading={isProcessing}
                size="md" 
                className="bg-desert hover:bg-walnut border-none px-12 h-16 rounded-2xl shadow-2xl shadow-desert/20"
              >
                Deposit ₱{engagement.totalAmount.toLocaleString()}
                <CreditCard className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {milestones.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-akaroa/10 text-center space-y-4">
              <Clock className="w-12 h-12 text-rhino/20 mx-auto" />
              <p className="font-heading font-bold text-rhino">No milestones defined yet.</p>
            </div>
          ) : (
            milestones.map((m, i) => (
              <div key={m.id} className={cn(
                "bg-white rounded-[2.5rem] border transition-all overflow-hidden",
                m.status === "in_progress" ? "border-desert ring-4 ring-desert/5 shadow-xl" : "border-akaroa/10 shadow-sm opacity-80"
              )}>
                <div className="p-8 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl",
                        m.status === "released" ? "bg-green-50 text-green-600" :
                        m.status === "in_progress" ? "bg-desert text-white" : "bg-rhino/5 text-rhino/20"
                      )}>
                        {m.status === "released" ? <CheckCircle2 className="w-8 h-8" /> : 
                         m.status === "locked" ? <Lock className="w-6 h-6" /> : i + 1}
                      </div>
                      <div className="space-y-1 text-left">
                        <h3 className="font-heading text-2xl font-bold text-rhino">{m.title}</h3>
                        <p className="text-xs font-body text-rhino/40">
                          {m.tasks?.length || 0} Sub-tasks for this phase
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Release Value</p>
                      <p className="text-2xl font-bold text-rhino font-heading">₱{m.amount.toLocaleString()}</p>
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest mt-2 capitalize",
                        m.status === "released" ? "bg-green-50 text-green-600" :
                        m.status === "in_progress" ? "bg-desert/10 text-desert" : "bg-rhino/5 text-rhino/40"
                      )}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Task Management */}
                  {(m.status === "in_progress" || m.status === "released") && (
                    <div className="space-y-4 pt-8 border-t border-akaroa/5">
                      {m.tasks?.map((task: any, tIndex: number) => {
                        const title = typeof task === 'string' ? task : task.title;
                        const completed = typeof task === 'string' ? (m.status === 'released') : task.completed;
                        
                        return (
                          <div key={tIndex} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => handleToggleTask(m.id, m.tasks ?? [], tIndex)}
                                className={cn(
                                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                  completed ? "bg-green-500 border-green-500 text-white" : "border-akaroa/10 text-rhino/20 hover:border-desert"
                                )}
                              >
                                {completed && <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <span className={cn(
                                "text-sm font-body text-left",
                                completed ? "text-rhino/40 line-through" : "text-rhino"
                              )}>{title}</span>
                            </div>
                          </div>
                        );
                      })}

                      {user?.role === "consultant" && m.status === "in_progress" && (
                        <div className="flex items-center gap-4 pt-4">
                          <div className="flex-1 relative">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rhino/20" />
                            <input 
                              type="text" 
                              placeholder="Add local task (e.g. Site Inspection)..."
                              value={newTask}
                              onChange={(e) => setNewTask(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTask(m.id, m.tasks)}
                              className="w-full h-12 pl-12 pr-4 rounded-xl bg-rhino/5 border-transparent outline-none font-body text-xs focus:bg-white focus:border-akaroa/20 transition-all"
                            />
                          </div>
                          <Button 
                            onClick={() => handleAddTask(m.id, m.tasks)}
                            variant="ghost" 
                            className="h-12 w-12 p-0 rounded-xl bg-rhino/5 hover:bg-rhino/10"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {m.status === "in_progress" && (
                    <div className="pt-8 border-t border-akaroa/5 flex flex-col sm:flex-row gap-4">
                      {user?.role === "ofw" ? (
                        <div className="flex-1 p-6 rounded-2xl bg-desert/5 border border-desert/10 flex items-center gap-4">
                          <AlertCircle className="w-10 h-10 text-desert" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-rhino">Awaiting AI Audit</p>
                            <p className="text-[10px] text-rhino/40 font-body">Once the expert uploads proof in the Vault, funds release automatically.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 p-6 rounded-2xl bg-rhino/5 border border-rhino/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Upload className="w-8 h-8 text-rhino/20" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-rhino">Submit Proof of Work</p>
                              <p className="text-[10px] text-rhino/40 font-body">Upload photos/scans to the Vault for AI verification.</p>
                            </div>
                          </div>
                          <Link href={`/engagements/${engagementId}/vault`}>
                            <Button className="h-12 px-8 rounded-xl bg-rhino text-white hover:bg-rhino/90 shadow-lg font-bold text-xs">Go to Vault</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-rhino rounded-[2.5rem] p-8 text-white space-y-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-8 text-left">
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold">Phase 4 Execution</h3>
                <p className="text-xs text-akaroa/50 font-body leading-relaxed">
                  The Consultant manages tasks while the OFW monitors progress in real-time.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10">
                <div className="space-y-1">
                  <p className="text-[10px] text-akaroa/40 font-body uppercase tracking-widest font-bold">Total Escrowed</p>
                  <p className="text-2xl font-bold font-heading">₱{engagement.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
