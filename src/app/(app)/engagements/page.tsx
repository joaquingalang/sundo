"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  FileText
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Engagement } from "@/types";

export default function EngagementsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("active");
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const field = user.role === "ofw" ? "ofwId" : "consultantId";
    const q = query(
      collection(db, "engagements"),
      where(field, "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEngagements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Engagement)));
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredEngagements = engagements.filter(eng => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return eng.status !== "completed" && eng.status !== "cancelled";
    if (activeTab === "completed") return eng.status === "completed";
    return true;
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-left">
          <h1 className="font-heading text-4xl font-bold text-rhino">
            {user?.role === "consultant" ? "Project Feed" : "My Engagements"}
          </h1>
          <p className="font-body text-rhino/60">
            {user?.role === "ofw" ? "Track your consultations and milestone releases." : "Manage your active client projects and deliverables."}
          </p>
        </div>
        
        <div className="flex bg-white rounded-xl p-1 border border-akaroa/20 shadow-sm">
          {["all", "active", "completed"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg font-body text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-rhino text-white shadow-md" : "text-rhino/40 hover:text-rhino"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredEngagements.map((eng) => (
          <div key={eng.id} className={cn(
            "bg-white rounded-[2rem] border transition-all p-6 group",
            eng.status === 'ESCROW_LOCKED' ? "border-desert/30 shadow-xl shadow-desert/5 ring-1 ring-desert/10" : "border-akaroa/10 shadow-sm"
          )}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-lg",
                  eng.status === 'ESCROW_LOCKED' ? "bg-desert text-white shadow-desert/20" : "bg-rhino/5 text-rhino shadow-rhino/5"
                )}>
                  {(eng.title || "??").substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 text-left">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-rhino text-xl truncate">
                      {eng.title || "Untitled Engagement"}
                    </h3>
                    {eng.status === 'ESCROW_LOCKED' && (
                      <span className="px-2 py-0.5 rounded-md bg-green-500 text-white text-[7px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck className="w-2 h-2" /> Digital Workspace Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-body text-rhino/50 font-bold">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-desert" />
                      {user?.role === 'ofw' ? (eng.consultantName || 'Expert Partner') : (eng.ofwName || 'OFW Client')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-desert" />
                      <span className="capitalize">{eng.mode || "Project"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block w-56 space-y-2 px-8 border-x border-akaroa/10 text-left">
                <div className="flex justify-between text-[10px] font-bold text-rhino/40 uppercase tracking-widest">
                  <span>Vault Status</span>
                  <span className={cn(eng.escrowStatus === 'funded' ? "text-green-600" : "text-yellow-600")}>
                    {eng.escrowStatus === 'funded' ? "SECURED" : "PENDING"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-rhino/5 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all", eng.escrowStatus === 'funded' ? "bg-green-500 w-full" : "bg-yellow-400 w-1/4")} />
                </div>
                <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-tighter">
                  {eng.status === 'REQUESTED' ? 'Awaiting Expert Review' : 
                   eng.status === 'PROPOSAL' ? 'Awaiting Acceptance' : 
                   eng.status === 'WAITING_FOR_DEPOSIT' ? 'Awaiting Secure Deposit' :
                   'Execution in Progress'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Project Value</p>
                  <p className="text-lg font-bold text-rhino">₱{(eng.totalAmount || 0).toLocaleString()}</p>
                </div>
                <Link href={`/engagements/${eng.id}`}>
                  <Button className={cn(
                    "h-12 px-8 rounded-2xl group font-bold shadow-xl transition-all",
                    eng.status === 'ESCROW_LOCKED' ? "bg-rhino hover:bg-black shadow-rhino/20" : "bg-desert hover:bg-walnut shadow-desert/20"
                  )}>
                    {eng.status === 'ESCROW_LOCKED' ? 'Enter Workspace' : 'Manage Case'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEngagements.length === 0 && (
          <div className="bg-white/50 border-2 border-dashed border-akaroa/20 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rhino/5 flex items-center justify-center text-rhino/20">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-rhino">No engagements found</h3>
              <p className="font-body text-sm text-rhino/40">You haven&apos;t started any consultations yet.</p>
            </div>
            {user?.role === "ofw" && (
              <Link href="/consultants">
                <Button variant="ghost" className="rounded-xl px-8 mt-4">Browse Consultants</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
