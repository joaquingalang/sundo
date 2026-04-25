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
          <h1 className="font-heading text-4xl font-bold text-rhino">My Engagements</h1>
          <p className="font-body text-rhino/60">
            {user?.role === "ofw" ? "Track your consultations and milestone releases." : "Manage your projects and deliverable submissions."}
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
          <div key={eng.id} className="bg-white rounded-[2rem] border border-akaroa/10 shadow-sm hover:shadow-xl hover:shadow-rhino/5 transition-all p-6 group">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-rhino/5 flex items-center justify-center text-rhino font-bold shrink-0">
                  {(eng.title || "??").substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 text-left">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-rhino text-xl truncate">{eng.title || "Untitled Engagement"}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border",
                      eng.status === "in_progress" ? "bg-blue-50 text-blue-600 border-blue-100" :
                      eng.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                      "bg-yellow-50 text-yellow-600 border-yellow-100"
                    )}>
                      {eng.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-body text-rhino/50">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {user?.role === 'ofw' ? 'Expert' : 'Client'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span className="capitalize">{eng.mode}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block w-48 space-y-2 px-8 border-x border-akaroa/10 text-left">
                <div className="flex justify-between text-[10px] font-bold text-rhino/40 uppercase tracking-widest">
                  <span>Escrow</span>
                  <span className={cn(eng.escrowStatus === 'funded' ? "text-green-600" : "text-yellow-600")}>
                    {eng.escrowStatus}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-rhino/5 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all", eng.escrowStatus === 'funded' ? "bg-green-500 w-full" : "bg-yellow-400 w-1/4")} />
                </div>
                <p className="text-[10px] text-rhino/40 font-body italic">
                  {eng.status === 'proposal_pending' ? 'Awaiting Roadmap' : 'Work in progress'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Total Budget</p>
                  <p className="text-lg font-bold text-rhino">₱{eng.totalAmount.toLocaleString()}</p>
                </div>
                <Link href={`/engagements/${eng.id}`}>
                  <Button className="h-12 px-6 rounded-xl group">
                    Manage
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <button className="p-3 rounded-xl hover:bg-rhino/5 transition-colors text-rhino/20 hover:text-rhino">
                  <MoreVertical className="w-5 h-5" />
                </button>
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
