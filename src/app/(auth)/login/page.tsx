"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setFormError(null);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        // Create initial profile for Google user
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          role: "", // Will be set in onboarding
          isOnboarded: false,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        router.push("/onboarding/role");
      } else if (!snap.data().role) {
        router.push("/onboarding/role");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setFormError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().role) {
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-akaroa/20"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-rhino/40 font-body">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="ghost" 
          fullWidth 
          onClick={handleGoogleSignIn}
          className="bg-white border-akaroa/20 hover:bg-rhino/5 text-rhino flex items-center justify-center gap-3 h-12 rounded-xl"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
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
