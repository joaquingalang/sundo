"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        clearInterval(interval);
        router.push("/onboarding/role");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleResend() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-rhino/10 flex items-center justify-center">
            <MailIcon />
          </div>
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5"
            aria-hidden="true"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-desert opacity-60" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-desert" />
          </span>
        </div>
      </div>

      <h1 className="font-heading text-[2rem] font-bold text-foreground mb-3 leading-tight">
        Check your inbox
      </h1>

      <p className="font-body text-[#393939] text-sm mb-1">
        We sent a verification link to your email address.
      </p>
      <p className="font-body text-[#393939] text-sm mb-8">
        Click the link in the email to continue setting up your account.
      </p>

      {/* Polling indicator */}
      <div className="flex items-center justify-center gap-2.5 text-sm font-body text-sandstone mb-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sandstone opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sandstone" />
        </span>
        Waiting for verification&hellip;
      </div>

      <div className="space-y-3">
        <p className="text-sm font-body text-[#393939]">
          Didn&apos;t receive an email?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-desert hover:text-walnut font-medium transition-colors"
          >
            Resend
          </button>
        </p>

        <p className="text-sm font-body text-[#393939]">
          Wrong email address?{" "}
          <Link
            href="/register"
            className="text-desert hover:text-walnut font-medium transition-colors"
          >
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#273f5b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
