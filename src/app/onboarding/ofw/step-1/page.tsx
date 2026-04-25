"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Camera, User, MapPin } from "lucide-react";

export default function OFWStep1Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleContinue() {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/onboarding/ofw/step-2");
    }, 800);
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-bold text-rhino">Tell us about yourself</h1>
        <p className="font-body text-rhino/60 text-sm">
          Let&apos;s start with the basics to set up your profile.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-rhino/5 border-2 border-dashed border-akaroa/50 flex items-center justify-center overflow-hidden">
            <User className="w-12 h-12 text-rhino/20" />
            {/* Placeholder Box for Photo */}
          </div>
          <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-rhino text-white flex items-center justify-center shadow-lg hover:bg-desert transition-colors">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs font-body text-rhino/40">Upload a professional profile photo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input label="Full Government Name" placeholder="Juan Dela Cruz" />
        </div>
        <Input label="Barangay" placeholder="Brgy. 123" />
        <Input label="City / Municipality" placeholder="Quezon City" />
        <div className="md:col-span-2">
          <Input label="Province" placeholder="Metro Manila" />
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-akaroa/10">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rhino/5 border border-akaroa/20">
          <div className="flex items-center gap-3">
            <GlobeIcon className="w-5 h-5 text-rhino" />
            <span className="font-body text-sm font-medium text-rhino">Language Preference</span>
          </div>
          <div className="flex bg-white rounded-lg p-1 border border-akaroa/20">
            <button className="px-3 py-1 text-xs font-bold rounded bg-rhino text-white">English</button>
            <button className="px-3 py-1 text-xs font-medium text-rhino/60">Filipino</button>
          </div>
        </div>
      </div>

      <Button fullWidth isLoading={isLoading} onClick={handleContinue} className="h-14 text-lg rounded-2xl">
        Continue
      </Button>
    </div>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
