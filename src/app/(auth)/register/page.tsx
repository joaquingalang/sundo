"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-5 py-10">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-4 shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-sm text-text-muted mt-1">Join the Sundo community</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            icon={<User size={18} />}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            icon={<Lock size={18} />}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            icon={<Lock size={18} />}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            Create Account
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-text-muted mt-8">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
