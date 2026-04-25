"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { UserProfile } from "@/types";
import { Layers, ShieldCheck, ArrowRight, ClipboardList, Info } from "lucide-react";

export default function ProjectBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [consultant, setConsultant] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  useEffect(() => {
    async function fetchConsultant() {
      const docRef = doc(db, "users", params.consultantId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConsultant(docSnap.data() as UserProfile);
      }
      setIsLoading(false);
    }
    fetchConsultant();
  }, [params.consultantId]);

  async function handleBook() {
    if (!consultant || !auth.currentUser || !projectTitle) return;
    setIsSubmitting(true);

    try {
      const batch = writeBatch(db);
      
      const engagementRef = doc(collection(db, "engagements"));
      const engagementData = {
        id: engagementRef.id,
        ofwId: auth.currentUser.uid,
        consultantId: consultant.uid,
        title: projectTitle,
        description: projectDesc,
        category: consultant.categories?.[0] || 'general',
        mode: "project",
        status: "proposal_pending",
        totalAmount: consultant.projectRateRange?.min || 10000,
        escrowStatus: "unfunded",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      };

      batch.set(engagementRef, engagementData);

      // Create default milestones
      const milestones = [
        { title: "Project Inception", amount: 0.2, status: "locked", deliverables: ["Project Charter", "Timeline"] },
        { title: "Detailed Analysis", amount: 0.3, status: "locked", deliverables: ["Market Report", "Risk Assessment"] },
        { title: "Final Delivery", amount: 0.5, status: "locked", deliverables: ["Full Business Plan", "Resource Map"] },
      ];

      for (const m of milestones) {
        const mRef = doc(collection(db, "engagements", engagementRef.id, "milestones"));
        batch.set(mRef, {
          ...m,
          engagementId: engagementRef.id,
          amount: (engagementData.totalAmount * m.amount),
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();

      // Add system message
      await addDoc(collection(db, "engagements", engagementRef.id, "messages"), {
        engagementId: engagementRef.id,
        senderId: "system",
        content: `New project "${projectTitle}" created. Milestones generated. Waiting for acceptance.`,
        type: "system",
        createdAt: serverTimestamp(),
      });

      router.push(`/engagements/${engagementRef.id}`);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold text-rhino">Start a Project</h1>
        <p className="font-body text-rhino/60">Collaborate with {consultant?.displayName} on a structured long-term project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-6">
            <h2 className="font-heading text-xl font-bold text-rhino">Project Info</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-rhino/40 uppercase tracking-widest px-1">Project Title</label>
                <input 
                  type="text" 
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Sari-Sari Store Expansion Plan"
                  className="w-full h-14 px-6 rounded-2xl bg-rhino/5 border border-akaroa/10 focus:border-desert outline-none font-body transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-rhino/40 uppercase tracking-widest px-1">Objectives & Description</label>
                <textarea 
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Describe what you want to achieve..."
                  rows={4}
                  className="w-full p-6 rounded-2xl bg-rhino/5 border border-akaroa/10 focus:border-desert outline-none font-body transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-rhino">Milestone Template</h2>
              <span className="text-[10px] font-bold text-desert uppercase tracking-widest bg-desert/5 px-3 py-1 rounded-full">Standard 3-Phase</span>
            </div>
            <div className="space-y-4">
              {[
                { title: "Project Inception", pct: "20%", icon: ClipboardList },
                { title: "Detailed Analysis", pct: "30%", icon: Layers },
                { title: "Final Delivery", pct: "50%", icon: ShieldCheck },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-rhino/5 border border-akaroa/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rhino/40">
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rhino">{m.title}</p>
                      <p className="text-[10px] text-rhino/40 font-body">Milestone {i+1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rhino">{m.pct}</p>
                    <p className="text-[10px] text-rhino/40 font-body uppercase">Budget</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-600 font-body leading-relaxed">
                Consultant can adjust the budget and milestones after you create the project. You will review and fund once agreed.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-rhino p-10 rounded-[3rem] text-white shadow-2xl shadow-rhino/20 space-y-8 h-fit">
            <h2 className="font-heading text-2xl font-bold">Base Estimate</h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] text-akaroa/40 font-bold uppercase tracking-widest">Min. Project Rate</p>
                <p className="text-4xl font-bold font-heading">₱{consultant?.projectRateRange?.min?.toLocaleString()}</p>
              </div>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-akaroa/60">Sundo Protection Fee</span>
                  <span className="font-bold text-akaroa">5%</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-akaroa/60">Payment Protection</span>
                  <span className="font-bold text-akaroa italic">Included</span>
                </div>
              </div>

              <Button 
                fullWidth 
                size="md" 
                variant="ghost"
                isLoading={isSubmitting} 
                onClick={handleBook}
                className="h-16 text-lg rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 group"
              >
                Create Project
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-desert/10 flex items-center justify-center text-desert">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-rhino">Milestone Payments</h3>
            <p className="text-[11px] text-rhino/60 font-body leading-relaxed">
              Payments are only released when milestones are completed and verified by you (or auto-verified by our AI system).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
