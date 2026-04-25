"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(5);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        value = value.slice(-1);
      }
      if (!/^\d*$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
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
        <p className="text-sm text-text-secondary mb-8">
          Enter the 4-digit code sent to your email
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
              className="
                w-16 h-16 text-center text-2xl font-bold
                bg-white border-2 border-border rounded-2xl
                text-text-primary
                outline-none transition-all duration-200
                focus:border-primary focus:ring-4 focus:ring-primary/10
                hover:border-text-muted
              "
            />
          ))}
        </div>

        {/* Countdown */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <span className="text-2xl font-bold text-primary">{countdown}</span>
          </div>
          <p className="text-xs text-text-muted">
            Redirecting automatically...
          </p>
        </div>

        {/* Resend */}
        <button
          disabled={countdown > 0}
          className={`
            text-sm font-medium cursor-pointer
            transition-colors duration-200
            ${countdown > 0 ? "text-text-muted cursor-not-allowed" : "text-primary hover:underline"}
          `}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
