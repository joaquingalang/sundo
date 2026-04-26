import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-cream">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-between p-12 bg-rhino">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden mb-10 font-heading text-2xl font-bold text-rhino"
        >
          Sundo
        </Link>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
