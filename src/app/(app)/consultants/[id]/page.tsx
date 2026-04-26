"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { UserProfile } from "@/types";
import { 
  ShieldCheck, 
  ArrowRight,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/useAuthStore";
import { AlertCircle, Send } from "lucide-react";

export default function ConsultantProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuthStore();
  const [consultant, setConsultant] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    async function fetchConsultant() {
      const docRef = doc(db, "users", params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConsultant({ ...docSnap.data(), uid: docSnap.id } as UserProfile);
      }
      setIsLoading(false);
    }
    fetchConsultant();
  }, [params.id]);

  async function handleSendRequest() {
    if (!currentUser || !consultant) return;
    setIsRequesting(true);
    try {
      const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
      
      await addDoc(collection(db, "engagements"), {
        ofwId: currentUser.uid,
        consultantId: consultant.uid,
        ofwName: currentUser.displayName || "Valued OFW",
        consultantName: consultant.displayName || "Expert Partner",
        status: "REQUESTED",
        title: `Consultation: ${currentUser.goal || "Reintegration"}`,
        category: currentUser.goal || "general",
        totalAmount: consultant.projectRateRange?.min || 5000,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Pass essential profile data to the consultant
        metadata: {
          ofwName: currentUser.displayName || "Valued OFW",
          ofwGoal: currentUser.goal || "not set",
          ofwProvince: currentUser.province || "Philippines",
          ofwSalaryRange: currentUser.salaryRange || "not specified"
        }
      });

      setRequestSent(true);
    } catch (err) {
      console.error("Error sending request:", err);
    } finally {
      setIsRequesting(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!consultant) return <div className="text-center py-20 font-heading text-2xl">Expert not found</div>;

  const consultantName = consultant.displayName || "Expert Consultant";
  const consultantExpertise = consultant.expertise || (consultant as any).categories || [];
  const isLocalMatch = consultant.areaOfOperation === currentUser?.province;

  return (
    <div className="space-y-10">
      {/* Hero Profile */}
      <div className="bg-white rounded-[3rem] p-12 border border-akaroa/10 shadow-sm relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-desert/5 -skew-x-12 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="w-40 h-40 rounded-[3rem] bg-rhino text-white flex items-center justify-center text-5xl font-bold shadow-2xl shadow-rhino/20 overflow-hidden shrink-0">
            {consultant.photoURL ? (
              <img src={consultant.photoURL} alt={consultantName} className="w-full h-full object-cover" />
            ) : (
              (consultantName || "?").split(' ').map(n => n[0]).join('')
            )}
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="font-heading text-5xl font-bold text-rhino">{consultantName}</h1>
                {isLocalMatch && (
                  <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Local Project Expert
                  </span>
                )}
              </div>
              <p className="font-heading text-xl text-desert font-bold uppercase tracking-wider">{consultant.professionalTitle}</p>
            </div>

            <div className="flex flex-wrap gap-8 font-body text-sm text-rhino/50 font-bold">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-desert" />
                {consultant.areaOfOperation || "Philippines"}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-desert" />
                Verified Professional
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-desert" />
                Typical response: 4h
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {consultantExpertise.map((tag: string) => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-rhino/5 text-rhino/60 text-xs font-bold font-body uppercase border border-akaroa/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12 text-left">
          {/* Professional Summary */}
          <div className="space-y-6">
            <h2 className="font-heading text-3xl font-bold text-rhino">Strategic Summary</h2>
            <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-6">
              <p className="font-body text-lg text-rhino/70 leading-relaxed italic">
                &ldquo;{consultant.bio || `I specialize in helping OFWs navigate the complexities of ${consultantExpertise.join(' and ')}. My approach is grounded in local market intelligence and project feasibility.`}&rdquo;
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-akaroa/10">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-rhino/40 tracking-widest">Key Specializations</h4>
                  <ul className="space-y-2">
                    {consultantExpertise.map((item: string) => (
                      <li key={item} className="flex items-center gap-2 text-sm font-bold text-rhino">
                        <CheckCircle2 className="w-4 h-4 text-desert" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-rhino/40 tracking-widest">Local Reach</h4>
                  <p className="text-sm font-body text-rhino/70">Actively managing projects and providing on-ground support in <strong>{consultant.areaOfOperation}</strong>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials & CVs */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-rhino flex items-center gap-3">
              Professional Credentials
              <span className="px-3 py-1 rounded-full bg-rhino text-white text-[10px] font-bold uppercase tracking-widest">Verified</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white border border-akaroa/10 flex items-center justify-between group hover:border-desert/30 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-desert/5 text-desert flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rhino">Curriculum_Vitae.pdf</p>
                    <p className="text-[10px] text-rhino/40 font-body">Professional Background • 1.2 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-rhino/5 group-hover:bg-desert group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 rounded-[2rem] bg-white border border-akaroa/10 flex items-center justify-between group hover:border-desert/30 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rhino">Accreditation_2026.pdf</p>
                    <p className="text-[10px] text-rhino/40 font-body">PRC Certified • 850 KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-rhino/5 group-hover:bg-desert group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-rhino">Working Conditions</h2>
            <div className="bg-rhino/5 p-8 rounded-[2.5rem] border border-akaroa/10 space-y-4">
              <div className="flex gap-4">
                <div className="w-1 h-12 bg-desert rounded-full shrink-0" />
                <p className="text-sm font-body text-rhino/70 leading-relaxed italic">
                  &ldquo;I prioritize projects with a clear social impact and commitment to local employment. All consultations require a signed roadmap agreement and secure escrow funding before execution phases begin.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-rhino rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-rhino/30 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-2 relative z-10">
              <h3 className="font-heading text-2xl font-bold">Request Consultation</h3>
              <p className="text-xs text-akaroa/60 font-body leading-relaxed">
                Send a request to share your goal and location. This expert will review your profile and craft a <strong>custom Roadmap Proposal</strong>.
              </p>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 relative z-10">
              <div>
                <p className="text-[10px] uppercase font-bold text-akaroa/40 tracking-widest mb-1">Project Cost Range</p>
                <p className="text-3xl font-bold font-heading text-akaroa">₱{consultant.projectRateRange?.min?.toLocaleString()} – ₱{consultant.projectRateRange?.max?.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Custom Feasibility Study
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> On-Ground Project Setup
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              className={cn(
                "relative z-10 rounded-2xl h-16 font-bold text-lg transition-all shadow-xl",
                requestSent ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : "bg-desert hover:bg-walnut shadow-desert/20"
              )}
              onClick={handleSendRequest}
              isLoading={isRequesting}
              disabled={requestSent}
            >
              {requestSent ? (
                <span className="flex items-center gap-2">Request Sent! <ArrowRight className="w-5 h-5" /></span>
              ) : (
                <span className="flex items-center gap-2"><Send className="w-5 h-5" /> Send Request</span>
              )}
            </Button>

            <p className="relative z-10 text-[10px] text-center text-akaroa/40 font-body">
              Privacy First: Consultants only see your summary after you initiate the request.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-4 text-left">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-desert/10 flex items-center justify-center text-desert">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-rhino">Trust-Gate™</h3>
            </div>
            <p className="text-xs text-rhino/50 font-body leading-relaxed">
              Sundo verified experts are subject to regular performance audits and identity verification. Your escrow deposit remains safe in our secure vault until you verify project milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
