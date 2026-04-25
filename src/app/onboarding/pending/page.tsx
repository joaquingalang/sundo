"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Clock, ShieldCheck, Mail, MessageSquare } from "lucide-react";

export default function OnboardingPendingPage() {
  const router = useRouter();

  return (
    <div className="space-y-12 text-center py-6">
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-rhino/5 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-rhino animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-desert text-white flex items-center justify-center border-4 border-white">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-bold text-rhino">Salamat, Kabayan!</h1>
          <p className="font-body text-rhino/60 text-lg">Your documents are now under review.</p>
        </div>
      </div>

      <div className="bg-rhino/5 rounded-[2.5rem] p-8 border border-akaroa/10 space-y-6 max-w-md mx-auto text-left">
        <p className="font-body text-sm text-rhino/70 leading-relaxed text-center">
          Our team typically completes verification within <span className="font-bold text-rhino">2–3 business days</span>. You&apos;ll receive an email once your account is ready.
        </p>

        <div className="space-y-4 pt-4 border-t border-akaroa/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-500 border border-akaroa/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-rhino text-sm">Identity Documents</p>
              <p className="font-body text-[10px] text-rhino/40 italic">Submitted & Pending Review</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-500 border border-akaroa/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-rhino text-sm">Deployment Records</p>
              <p className="font-body text-[10px] text-rhino/40 italic">Submitted & Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button variant="ghost" className="h-14 rounded-2xl gap-3">
          <Mail className="w-5 h-5" />
          Check Email
        </Button>
        <Button variant="ghost" className="h-14 rounded-2xl gap-3">
          <MessageSquare className="w-5 h-5" />
          Contact Support
        </Button>
      </div>

      <p className="text-xs font-body text-rhino/30 italic">
        Verification usually takes less than 24 hours. You will receive an email once your account is active.
      </p>
      
      <Button onClick={() => router.push("/dashboard")} className="h-14 rounded-2xl w-full max-w-xs mx-auto">
        Go to Dashboard
      </Button>
    </div>
  );
}
