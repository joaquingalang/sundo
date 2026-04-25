"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Upload, CheckCircle2, ShieldCheck, FileText, BrainCircuit, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { processDocumentUpload } from "@/app/actions/validation";
import { useAuthStore } from "@/store/useAuthStore";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OFWStep4Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [verifiedDocs, setVerifiedDocs] = useState<string[]>([]);
  const [failedDocs, setFailedDocs] = useState<string[]>([]);

  const requiredDocs = [
    { id: "Passport", label: "Passport", desc: "Data page showing your info." },
    { id: "OFW Card", label: "OFW Card / OEC", desc: "Proof of active/recent deployment." },
    { id: "Visa", label: "Working VISA", desc: "Your most recent deployment visa." },
  ];

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, docType: string) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsVerifying(docType);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("expectedType", docType);
    
    try {
      const result = await processDocumentUpload(formData);
      
      if (result.status === "passed") {
        setVerifiedDocs(prev => [...prev, docType]);
        setFailedDocs(prev => prev.filter(d => d !== docType));
      } else {
        setFailedDocs(prev => [...prev, docType]);
        alert(`AI Verification Failed: ${result.analysis}`);
      }
    } catch (error) {
      console.error(error);
      alert("Verification service error. Please try again.");
    } finally {
      setIsVerifying(null);
    }
  }

  async function handleSubmit() {
    if (verifiedDocs.length < 2 || !user) return; 

    try {
      await updateDoc(doc(db, "users", user.uid), {
        status: "verified",
        onboardingStep: "completed"
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-rhino/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-rhino" />
        </button>
        <div className="space-y-1 text-left">
          <h1 className="font-heading text-3xl font-bold text-rhino">AI Identity Guard</h1>
          <p className="font-body text-rhino/60 text-sm">Gemini AI will scan your documents for instant verification.</p>
        </div>
      </div>

      <div className="bg-rhino/5 rounded-[2rem] p-8 border border-akaroa/20 space-y-8">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-akaroa/10 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-desert" />
          <p className="font-body text-xs text-rhino/70 text-left">
            Your data is encrypted. Once verified, you gain "Active" status in the Sundo ecosystem.
          </p>
        </div>

        <div className="space-y-4 pr-2">
          {requiredDocs.map((doc) => (
            <div key={doc.id} className={cn(
              "bg-white p-6 rounded-2xl border transition-all flex items-center justify-between group",
              failedDocs.includes(doc.id) ? "border-red-200 bg-red-50" : "border-akaroa/10"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  verifiedDocs.includes(doc.id) ? "bg-green-100 text-green-600" : 
                  failedDocs.includes(doc.id) ? "bg-red-100 text-red-600" : "bg-rhino/5 text-rhino/40"
                )}>
                  {isVerifying === doc.id ? <BrainCircuit className="w-6 h-6 animate-spin" /> :
                   verifiedDocs.includes(doc.id) ? <CheckCircle2 className="w-6 h-6" /> : 
                   failedDocs.includes(doc.id) ? <ShieldAlert className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div className="text-left">
                  <h4 className="font-heading font-bold text-rhino text-sm">{doc.label}</h4>
                  <p className="font-body text-[10px] text-rhino/40">{doc.desc}</p>
                </div>
              </div>
              
              <div className="relative">
                <input 
                  type="file" 
                  id={`upload-${doc.id}`}
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, doc.id)}
                  disabled={isVerifying !== null}
                />
                <label htmlFor={`upload-${doc.id}`} className="cursor-pointer">
                  <div 
                    className={cn(
                      "inline-flex items-center justify-center h-10 px-6 rounded-xl text-xs font-bold transition-all",
                      verifiedDocs.includes(doc.id) 
                        ? "bg-green-50 text-green-700 pointer-events-none" 
                        : "bg-rhino text-white hover:bg-rhino/90"
                    )}
                  >
                    {isVerifying === doc.id ? "Scanning..." : 
                     verifiedDocs.includes(doc.id) ? "Verified" : "Upload"}
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => router.back()}>Back</Button>
        <Button 
          className="flex-[2] rounded-2xl h-14" 
          onClick={handleSubmit}
          disabled={verifiedDocs.length < 2 || isVerifying !== null}
        >
          Complete Verification
        </Button>
      </div>
    </div>
  );
}
