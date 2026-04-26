"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { setRole, loadOnboardingDoc } from "@/lib/firestore/onboarding";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type RoleChoice = "ofw" | "consultant";

export default function RolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<RoleChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }
      const existing = await loadOnboardingDoc(user.uid);
      if (existing?.onboardingComplete) { router.replace("/dashboard"); return; }
      setUid(user.uid);
      setAuthReady(true);
    });
    return unsub;
  }, [router]);

  async function handleContinue() {
    if (!selected || !uid) return;
    setLoading(true);
    try {
      await setRole(uid, selected);
      router.push(`/onboarding/${selected}/step-1`);
    } catch {
      setLoading(false);
    }
  }

  if (!authReady) return null;

  return (
    <div className="h-screen flex bg-[#fdfbf7] overflow-hidden">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-between p-12 bg-rhino h-full overflow-hidden">
        <Link
          href="/"
          className="font-heading text-2xl font-bold text-white tracking-tight"
        >
          Sundo
        </Link>

        <div className="space-y-6">
          <p className="font-heading text-white/85 text-[1.6rem] leading-snug italic">
            &ldquo;Bridging the trust gap between OFWs and the experts who
            care.&rdquo;
          </p>
          <div className="flex gap-2 items-center">
            <div className="h-1.5 w-6 rounded-full bg-akaroa" />
            <div className="h-1.5 w-2 rounded-full bg-akaroa/40" />
            <div className="h-1.5 w-2 rounded-full bg-akaroa/40" />
          </div>
        </div>

        <p className="text-white/30 text-xs font-body">
          &copy; {new Date().getFullYear()} Sundo. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden mb-10 font-heading text-2xl font-bold text-rhino"
        >
          Sundo
        </Link>

        <div className="w-full max-w-[480px]">
          <div className="mb-8">
            <h1 className="font-heading text-[2rem] font-bold text-foreground leading-tight mb-2">
              How will you use Sundo?
            </h1>
            <p className="font-body text-[#393939] text-sm">
              Choose your role to get started. This cannot be changed later.
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-7">
            <RoleCard
              selected={selected === "ofw"}
              onSelect={() => setSelected("ofw")}
              icon={<PlaneIcon />}
              title="Overseas Filipino Worker"
              description="I'm an OFW looking for trusted consultants to help with financial, legal, or reintegration needs."
            />
            <RoleCard
              selected={selected === "consultant"}
              onSelect={() => setSelected("consultant")}
              icon={<BriefcaseIcon />}
              title="Consultant / Expert"
              description="I'm a licensed professional offering consultations to OFWs and their families."
            />
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={!selected}
            isLoading={loading}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}

interface RoleCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}

function RoleCard({ selected, onSelect, icon, title, description }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex items-start gap-4 w-full px-5 py-4 rounded-xl border-2 text-left transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-rhino focus-visible:ring-offset-2",
        selected
          ? "border-rhino bg-white shadow-sm"
          : "border-akaroa/60 bg-white hover:border-rhino/40"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5",
          selected ? "bg-rhino/10 text-rhino" : "bg-akaroa/30 text-sandstone"
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "font-body font-semibold text-sm transition-colors",
              selected ? "text-rhino" : "text-foreground"
            )}
          >
            {title}
          </p>
          <span
            className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              selected ? "border-rhino bg-rhino" : "border-akaroa"
            )}
          >
            {selected && <SmallCheckIcon />}
          </span>
        </div>
        <p className="font-body text-xs text-sandstone leading-relaxed mt-1">
          {description}
        </p>
      </div>
    </button>
  );
}

function PlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-1-5.5.5L10 6 1.8 7.2C.8 7.4 0 8 0 9s.8 2 1.8 2.2L6 12l-2 3.5C2 17 3 18 4 17l3-2 1.2 4.2c.2 1 .8 1.8 1.8 1.8s1.6-.8 1.8-1.8z"/>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function SmallCheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
