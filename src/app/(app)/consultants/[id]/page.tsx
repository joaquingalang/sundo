"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { UserProfile } from "@/types";
import { 
  Star, 
  ShieldCheck, 
  Video, 
  Layers, 
  ArrowRight,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export default function ConsultantProfilePage() {
  const params = useParams();
  const [consultant, setConsultant] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConsultant() {
      const docRef = doc(db, "users", params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConsultant(docSnap.data() as UserProfile);
      }
      setIsLoading(false);
    }
    fetchConsultant();
  }, [params.id]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!consultant) return <div className="text-center py-20 font-heading text-2xl">Consultant not found</div>;

  return (
    <div className="space-y-10">
      {/* Hero Profile */}
      <div className="bg-white rounded-[3rem] p-12 border border-akaroa/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-rhino/5 -skew-x-12 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="w-40 h-40 rounded-[3rem] bg-rhino text-white flex items-center justify-center text-5xl font-bold shadow-2xl shadow-rhino/20 overflow-hidden">
            {consultant.photoURL ? (
              <img src={consultant.photoURL} alt={consultant.displayName} className="w-full h-full object-cover" />
            ) : (
              (consultant.displayName || "?").split(' ').map(n => n[0]).join('')
            )}
          </div>
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="font-heading text-5xl font-bold text-rhino">{consultant.displayName}</h1>
                <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest border border-green-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Expert
                </span>
              </div>
              <p className="font-heading text-xl text-desert font-bold uppercase tracking-wider">{consultant.professionalTitle}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-8 font-body text-sm text-rhino/50 font-bold">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-desert text-desert" />
                <span className="text-rhino text-lg">4.9</span>
                <span>(24 reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Manila, Philippines
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Typically replies in 2h
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {consultant.categories?.map(tag => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-rhino/5 text-rhino/60 text-xs font-bold font-body uppercase border border-akaroa/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* About & Expertise */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-6">
            <h2 className="font-heading text-3xl font-bold text-rhino">About</h2>
            <p className="font-body text-lg text-rhino/70 leading-relaxed">
              {consultant.bio || "No bio available."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 space-y-6">
              <h3 className="font-heading text-xl font-bold text-rhino">Core Expertise</h3>
              <ul className="space-y-4">
                {["Reintegration Planning", "Small Business Strategy", "Financial Literacy", "Local Market Analysis"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-body text-rhino/70">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 space-y-6">
              <h3 className="font-heading text-xl font-bold text-rhino">Education & Certifications</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 font-body text-rhino/70">
                  <Briefcase className="w-5 h-5 text-desert shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-rhino">Certified Business Consultant</p>
                    <p className="text-xs">Institute of Management Accountants</p>
                  </div>
                </li>
                <li className="flex gap-3 font-body text-rhino/70">
                  <Briefcase className="w-5 h-5 text-desert shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-rhino">BS in Entrepreneurship</p>
                    <p className="text-xs">University of the Philippines</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-8">
          <div className="bg-rhino rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-rhino/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <h3 className="font-heading text-2xl font-bold">Choose your path</h3>
            
            <div className="space-y-4">
              <Link href={`/book/${consultant.uid}/session`}>
                <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 p-6 rounded-2xl text-left transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <Video className="w-8 h-8 text-akaroa" />
                    <span className="text-2xl font-bold font-heading">₱{consultant.sessionRate?.toLocaleString()}</span>
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-1 flex items-center justify-between">
                    1-on-1 Session
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </h4>
                  <p className="text-xs text-akaroa/60 font-body">1-hour deep dive into your specific challenges.</p>
                </button>
              </Link>

              <Link href={`/book/${consultant.uid}/project`}>
                <button className="w-full bg-desert hover:bg-walnut p-6 rounded-2xl text-left transition-all group shadow-lg shadow-desert/20">
                  <div className="flex justify-between items-start mb-4">
                    <Layers className="w-8 h-8 text-white" />
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/60">Starts at</p>
                      <span className="text-2xl font-bold font-heading">₱{consultant.projectRateRange?.min?.toLocaleString()}</span>
                    </div>
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-1 flex items-center justify-between">
                    Structured Project
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </h4>
                  <p className="text-xs text-white/70 font-body">Milestone-based collaboration for complex goals.</p>
                </button>
              </Link>
            </div>

            <p className="text-[10px] text-center text-akaroa/40 font-body">
              All payments are secured by Sundo Escrow until delivery is verified.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-6">
            <h3 className="font-heading text-xl font-bold text-rhino">Success Rate</h3>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-rhino font-heading">98%</span>
                <span className="text-rhino/40 font-body text-sm mb-1">Project Completion</span>
              </div>
              <div className="h-2 w-full bg-rhino/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[98%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
