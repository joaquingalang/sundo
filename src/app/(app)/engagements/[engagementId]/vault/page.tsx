"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
  Layers, 
  ShieldCheck, 
  FileText,
  MessageSquare,
  Upload,
  Search,
  ExternalLink,
  ShieldAlert,
  BrainCircuit,
  FileCheck,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEngagement } from "@/hooks/useEngagement";
import { processDocumentUpload } from "@/app/actions/validation";
import { updateDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EngagementVaultPage() {
  const params = useParams();
  const pathname = usePathname();
  const engagementId = params.engagementId as string;
  const { engagement, milestones, isLoading } = useEngagement(engagementId);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;
  if (!engagement) return <div className="text-center py-20 font-heading text-2xl">Engagement not found</div>;

  const tabs = [
    { label: "Overview", href: `/engagements/${engagementId}`, icon: Layers },
    { label: "Chat", href: `/engagements/${engagementId}/chat`, icon: MessageSquare },
    { label: "Milestones", href: `/engagements/${engagementId}/milestones`, icon: ShieldCheck },
    { label: "Vault", href: `/engagements/${engagementId}/vault`, icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  const handleAudit = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAuditResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("milestoneId", milestones.find(m => m.status === 'in_progress')?.id || milestones[0]?.id || "default");
    formData.append("engagementId", engagementId);

    try {
      const result = await processDocumentUpload(formData);
      setAuditResult(result);
    } catch (error) {
      console.error(error);
      alert("AI Audit failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReleaseSubmission = async () => {
    const activeMilestone = milestones.find(m => m.status === 'in_progress') || milestones[0];
    if (!activeMilestone) return;

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "engagements", engagementId, "milestones", activeMilestone.id), {
        status: "AI_AUDITED"
      });

      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        senderId: "system",
        content: `Expert has submitted ${activeMilestone.title} for verification.`,
        type: "system",
        createdAt: serverTimestamp()
      });

      alert("Success! Submitted for verification.");
      setAuditResult(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/engagements" className="p-3 rounded-2xl bg-white border border-akaroa/10 text-rhino hover:bg-rhino hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-rhino">{engagement.title}</h1>
              <span className="px-2 py-0.5 rounded-full bg-rhino/5 text-rhino/40 text-[8px] font-bold uppercase tracking-wider border border-akaroa/10">Vault</span>
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
        <div className="lg:col-span-3 space-y-8">
          {/* Compliance Area */}
          <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-akaroa/20 hover:border-desert/40 transition-all text-center space-y-6 group relative shadow-sm">
            <div className="w-20 h-20 bg-rhino/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <ShieldCheck className={cn("w-10 h-10 text-rhino/20", isUploading && "animate-bounce text-desert")} />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-bold text-rhino">Legal & Compliance Vault</h3>
              <p className="font-body text-rhino/40 max-w-sm mx-auto">
                Securely share legal documents, permits, and proofs of identity. This space is for compliance and project validity only.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <input 
                type="file" 
                id="vault-upload" 
                className="hidden" 
                onChange={handleAudit}
                accept="application/pdf,image/*"
              />
              <label htmlFor="vault-upload" className="cursor-pointer">
                <div className="inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-rhino text-white hover:bg-rhino/90 shadow-xl shadow-rhino/5 font-heading font-bold text-sm transition-all">
                  {isUploading ? "Uploading Securely..." : "Share Legal Document"}
                </div>
              </label>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[3rem] flex flex-col items-center justify-center space-y-6 z-20">
                <BrainCircuit className="w-16 h-16 text-desert animate-pulse" />
                <div className="space-y-2 text-center">
                  <h4 className="font-heading text-xl font-bold text-rhino">Gemini AI Audit in progress</h4>
                  <p className="font-body text-xs text-rhino/50 animate-pulse">Scanning document for milestone requirements...</p>
                </div>
              </div>
            )}
          </div>

          {/* Audit Result (if any) */}
          {auditResult && (
            <div className={cn(
              "p-8 rounded-[2.5rem] border-2 space-y-6 animate-in slide-in-from-top-4 duration-500",
              auditResult.status === "passed" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    auditResult.status === "passed" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {auditResult.status === "passed" ? <FileCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className={cn("font-heading text-xl font-bold", auditResult.status === "passed" ? "text-green-800" : "text-red-800")}>
                      AI Audit {auditResult.status === "passed" ? "Successful" : "Failed"}
                    </h4>
                    <p className="text-xs font-body opacity-60">Milestone: {milestones[0]?.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Confidence Score</p>
                  <p className="text-xl font-bold font-heading">{Math.round(auditResult.confidence * 100)}%</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 border border-black/5 font-body text-sm leading-relaxed text-left">
                {auditResult.analysis}
              </div>
              {auditResult.status === "passed" && (
                <div className="flex justify-end">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleReleaseSubmission}
                    isLoading={isProcessing}
                  >
                    Submit for Verification
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Recent Files */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-rhino">Recent Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Initial_Plan_v1.pdf", type: "PDF", size: "2.4 MB", date: "Apr 25", status: "audited" },
                { name: "BIR_Form_1901.jpg", type: "Image", size: "1.2 MB", date: "Apr 24", status: "audited" },
              ].map((file, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-akaroa/10 flex items-center justify-between group hover:border-desert/30 transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rhino/5 flex items-center justify-center text-rhino/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-rhino">{file.name}</p>
                      <p className="text-[10px] text-rhino/40 font-body">{file.type} • {file.size} • {file.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[8px] font-bold uppercase tracking-wider border border-green-100">
                      AI Verified
                    </span>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-rhino/20" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-rhino rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-6 text-left">
              <h3 className="font-heading text-xl font-bold">Vault Security</h3>
              <p className="text-xs text-akaroa/60 font-body leading-relaxed">
                Documents are encrypted and stored in private buckets. Access is restricted to you and your consultant.
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <ShieldCheck className="w-5 h-5 text-desert" />
                <span className="text-xs font-bold font-body">AES-256 Encryption</span>
              </div>
            </div>
          </div>

          <div className="bg-desert rounded-[2.5rem] p-8 text-white space-y-4">
            <h3 className="font-heading font-bold text-lg">AI Audit Help</h3>
            <p className="text-xs text-white/70 font-body leading-relaxed">
              Make sure documents are clear and legible for the AI to analyze properly. Hand-written notes may take longer to verify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
