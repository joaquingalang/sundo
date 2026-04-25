"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        router.push("/verify-email");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().onboardingComplete) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/role");
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            setFormError("Invalid email or password. Please try again.");
            break;
          case "auth/too-many-requests":
            setFormError("Too many sign-in attempts. Please try again later.");
            break;
          case "auth/user-disabled":
            setFormError("This account has been disabled. Please contact support.");
            break;
          default:
            setFormError("Sign-in failed. Please try again.");
        }
      } else {
        setFormError("Sign-in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-[2rem] font-bold text-foreground mb-2 leading-tight">
          Welcome back
        </h1>
        <p className="font-body text-[#393939] text-sm">
          Sign in to your Sundo account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-body text-desert hover:text-walnut transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600 font-body">{formError}</p>
          </div>
        )}

        <Button type="submit" fullWidth isLoading={isLoading} className="mt-1">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-body text-[#393939]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-desert hover:text-walnut font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
