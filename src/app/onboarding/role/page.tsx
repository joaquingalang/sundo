"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"ofw" | "consultant" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleContinue() {
    if (!selectedRole || !auth.currentUser) return;
    setIsLoading(true);
    
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        role: selectedRole,
        updatedAt: new Date(),
      }, { merge: true });

      if (selectedRole === "ofw") {
        router.push("/onboarding/ofw/step-1");
      } else {
        router.push("/onboarding/consultant/step-1");
      }
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-4xl font-bold text-rhino">Who are you joining as?</h1>
        <p className="font-body text-rhino/60">
          Choose your role to get started with your personalized dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setSelectedRole("ofw")}
          className={cn(
            "p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-6 group",
            selectedRole === "ofw" 
              ? "border-rhino bg-rhino/5 shadow-xl shadow-rhino/5 scale-[1.02]" 
              : "border-akaroa/20 hover:border-rhino/30 bg-white"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            selectedRole === "ofw" ? "bg-rhino text-white" : "bg-rhino/5 text-rhino"
          )}>
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-2xl font-bold text-rhino">I am an OFW</h3>
            <p className="font-body text-sm text-rhino/60 leading-relaxed">
              I&apos;m returning home and need expert guidance for my next chapter and reintegration.
            </p>
          </div>
          <div className={cn(
            "mt-auto h-2 w-full rounded-full bg-akaroa/10 overflow-hidden",
            selectedRole === "ofw" && "bg-rhino/10"
          )}>
            {selectedRole === "ofw" && <div className="h-full bg-rhino w-full animate-progress" />}
          </div>
        </button>

        <button
          onClick={() => setSelectedRole("consultant")}
          className={cn(
            "p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-6 group",
            selectedRole === "consultant" 
              ? "border-rhino bg-rhino/5 shadow-xl shadow-rhino/5 scale-[1.02]" 
              : "border-akaroa/20 hover:border-rhino/30 bg-white"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            selectedRole === "consultant" ? "bg-rhino text-white" : "bg-rhino/5 text-rhino"
          )}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-2xl font-bold text-rhino">I am a Consultant</h3>
            <p className="font-body text-sm text-rhino/60 leading-relaxed">
              I have experience to share and want to guide returning OFWs through their transition.
            </p>
          </div>
          <div className={cn(
            "mt-auto h-2 w-full rounded-full bg-akaroa/10 overflow-hidden",
            selectedRole === "consultant" && "bg-rhino/10"
          )}>
            {selectedRole === "consultant" && <div className="h-full bg-rhino w-full animate-progress" />}
          </div>
        </button>
      </div>

      <Button 
        fullWidth 
        disabled={!selectedRole} 
        isLoading={isLoading}
        onClick={handleContinue}
        className="h-14 text-lg rounded-2xl mt-8"
      >
        Continue
      </Button>
    </div>
  );
}
