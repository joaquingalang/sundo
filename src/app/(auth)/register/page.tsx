"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { setDoc, doc } from "firebase/firestore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

function validatePassword(password: string): string | undefined {
  if (password.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must include an uppercase letter";
  if (!/[0-9]/.test(password)) return "Must include a number";
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!email) next.email = "Email is required";
    const pwErr = validatePassword(password);
    if (pwErr) next.password = pwErr;
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: "", // Will be set in onboarding
        role: "ofw", // Default role
        isOnboarded: false,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await sendEmailVerification(userCredential.user);
      router.push("/verify-email");
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists." });
      } else {
        setErrors({ form: "Failed to create account. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-[2rem] font-bold text-foreground mb-2 leading-tight">
          Create your account
        </h1>
        <p className="font-body text-[#393939] text-sm">
          Join Sundo and connect with trusted consultants
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          error={errors.password}
          hint="Min. 8 characters, 1 uppercase letter, 1 number"
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError("confirmPassword");
          }}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {errors.form && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600 font-body">{errors.form}</p>
          </div>
        )}

        <Button type="submit" fullWidth isLoading={isLoading} className="mt-1">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-body text-[#393939]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-desert hover:text-walnut font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
