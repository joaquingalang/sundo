"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { OnboardingDoc } from "@/lib/firestore/onboarding";
import { cn } from "@/lib/cn";

const OFW_DOCS = [
  "Government-Issued ID",
  "Passport",
  "OFW Card / e-Card",
  "Visa / Work Permit",
  "Proof of Philippine Address",
];

const CONSULTANT_DOCS = [
  "Government-Issued ID",
  "Tax Certificate (BIR Form 2307)",
  "Bank Verification",
];

export default function PendingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ofw" | "consultant" | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) { router.replace("/login"); return; }
      if (!user.emailVerified) { router.replace("/verify-email"); return; }

      setAuthReady(true);

      unsubSnapshot = onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as OnboardingDoc;
        if (data.role) setRole(data.role);
        if (data.status === "verified") {
          router.push("/dashboard");
        }
      });
    });

    return () => {
      unsubAuth();
      unsubSnapshot?.();
    };
  }, [router]);

  if (!authReady) return null;

  const docList = role === "consultant" ? CONSULTANT_DOCS : OFW_DOCS;

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      <header className="px-6 py-5 border-b border-akaroa/25">
        <Link
          href="/"
          className="font-heading text-xl font-bold text-rhino tracking-tight"
        >
          Sundo
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-lg text-center">
          {/* Animated icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-rhino/10 flex items-center justify-center">
                <ClipboardCheckIcon />
              </div>
              <span className="absolute -top-1 -right-1 flex h-5 w-5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-desert opacity-60" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-desert" />
              </span>
            </div>
          </div>

          <h1 className="font-heading text-[2rem] font-bold text-foreground leading-tight mb-3">
            Application submitted!
          </h1>
          <p className="font-body text-sandstone text-base mb-2">
            Our team is reviewing your profile and documents.
          </p>
          <p className="font-body text-sandstone text-base mb-10">
            This usually takes{" "}
            <span className="text-foreground font-medium">3–5 business days</span>.
            We&apos;ll notify you by email once your account is verified.
          </p>

          {/* Submitted docs */}
          <div className="bg-white border border-akaroa/40 rounded-2xl p-6 text-left mb-8">
            <p className="text-sm font-body font-semibold text-foreground mb-4">
              Documents submitted
            </p>
            <ul className="flex flex-col gap-3">
              {docList.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <SmallCheckIcon />
                  </span>
                  <span className="text-sm font-body text-foreground">{name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2.5 text-sm font-body text-sandstone">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sandstone opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sandstone" />
            </span>
            Waiting for verification&hellip;
          </div>

          {/* Steps */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { label: "Application submitted", done: true },
              { label: "Admin review in progress", done: false, active: true },
              { label: "Account verified — access granted", done: false },
            ].map((step) => (
              <div
                key={step.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  step.done && "bg-green-50/80",
                  step.active && "bg-rhino/5",
                  !step.done && !step.active && "opacity-40"
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                    step.done && "bg-green-500 text-white",
                    step.active && "bg-rhino text-white",
                    !step.done && !step.active && "bg-akaroa/50 text-sandstone"
                  )}
                >
                  {step.done ? <SmallCheckIcon /> : step.active ? "2" : "3"}
                </span>
                <span
                  className={cn(
                    "text-sm font-body",
                    step.done && "text-green-700",
                    step.active && "text-rhino font-medium",
                    !step.done && !step.active && "text-sandstone"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#273f5b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="m9 14 2 2 4-4"/>
    </svg>
  );
}

function SmallCheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
