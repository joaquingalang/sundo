"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-akaroa/30">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-heading text-2xl font-bold text-rhino tracking-tight">
          Sundo
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="font-body text-sm font-medium text-rhino hover:text-desert transition-colors">
            How it works
          </Link>
          <Link href="#categories" className="font-body text-sm font-medium text-rhino hover:text-desert transition-colors">
            Categories
          </Link>
          <Link href="#for-consultants" className="font-body text-sm font-medium text-rhino hover:text-desert transition-colors">
            For Consultants
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Join Sundo
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
