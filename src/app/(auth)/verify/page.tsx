"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { signInWithCustomToken } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/clientApp";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) value = value.slice(-1);
      if (!/^\d*$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleVerify = useCallback(
    async (pin: string) => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, pin }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Verification failed. Please try again.");
          setOtp(["", "", "", ""]);
          inputRefs.current[0]?.focus();
          return;
        }

        const { customToken } = data;
        const credential = await signInWithCustomToken(auth, customToken);
        const uid = credential.user.uid;

        // Check if user has completed onboarding
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists() && userDoc.data().onboardingCompleted) {
          router.push("/app/dashboard");
        } else {
          router.push("/onboarding");
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email, router]
  );

  // Auto-submit when all 4 digits are filled
  useEffect(() => {
    const pin = otp.join("");
    if (pin.length === 4) {
      handleVerify(pin);
    }
  }, [otp, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code.");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-5 py-10">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield size={40} className="text-primary" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Verify your account
        </h1>
        <p className="text-sm text-text-secondary mb-1">
          Enter the 4-digit code sent to
        </p>
        <p className="text-sm font-semibold text-primary mb-8 break-all">
          {email || "your email"}
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="
                w-16 h-16 text-center text-2xl font-bold
                bg-white border-2 border-border rounded-2xl
                text-text-primary
                outline-none transition-all duration-200
                focus:border-primary focus:ring-4 focus:ring-primary/10
                hover:border-text-muted
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          ))}
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-sm text-text-muted mb-4">Verifying…</p>
        )}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || loading}
          className={`
            text-sm font-medium transition-colors duration-200
            ${resendCooldown > 0 || loading
              ? "text-text-muted cursor-not-allowed"
              : "text-primary hover:underline cursor-pointer"}
          `}
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend Code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
