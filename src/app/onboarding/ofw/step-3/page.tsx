"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, TrendingUp, Briefcase, HelpCircle, ClipboardCheck, Home, GraduationCap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export default function OFWStep3Page() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: "business", label: "Business", icon: TrendingUp, desc: "Registration, planning, and operations." },
    { id: "work_local", label: "Work (Local)", icon: Briefcase, desc: "Job matching and local employment tips." },
    { id: "general", label: "General", icon: HelpCircle, desc: "Personalized advice for any situation." },
    { id: "benefits", label: "Benefits", icon: ClipboardCheck, desc: "OWWA, SSS, and PhilHealth claims." },
    { id: "retirement", label: "Retirement", icon: Home, desc: "Financial planning and property." },
    { id: "reintegration", label: "Reintegration", icon: ShieldCheck, desc: "Psychosocial and family support." },
    { id: "education", label: "Education", icon: GraduationCap, desc: "Scholarships and skills upgrading." },
  ];

  function toggleInterest(id: string) {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : prev.length < 2 ? [...prev, id] : prev
    );
  }

  async function handleContinue() {
    if (selectedInterests.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push("/onboarding/ofw/step-4");
    }, 800);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-rhino/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-rhino" />
        </button>
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold text-rhino">What do you need help with?</h1>
          <p className="font-body text-rhino/60 text-sm">Select up to 2 categories that matter most to you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleInterest(cat.id)}
            className={cn(
              "p-6 rounded-2xl border-2 transition-all text-left flex gap-4 items-start",
              selectedInterests.includes(cat.id)
                ? "border-rhino bg-rhino/5"
                : "border-akaroa/10 bg-white hover:border-akaroa/30"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              selectedInterests.includes(cat.id) ? "bg-rhino text-white" : "bg-rhino/5 text-rhino"
            )}>
              <cat.icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-rhino text-lg">{cat.label}</h3>
              <p className="font-body text-xs text-rhino/60 leading-relaxed">{cat.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => router.back()}>Back</Button>
        <Button 
          className="flex-[2] rounded-2xl h-14" 
          isLoading={isLoading} 
          onClick={handleContinue}
          disabled={selectedInterests.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
