import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-akaroa/20">
        <Link href="/" className="font-heading text-2xl font-bold text-rhino">
          Sundo
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs font-body text-rhino/40 uppercase tracking-widest font-bold">
            Step-by-step Onboarding
          </span>
          <div className="h-2 w-24 bg-akaroa/20 rounded-full overflow-hidden">
            <div className="h-full bg-rhino w-1/4 transition-all" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-rhino/5 border border-akaroa/10">
          {children}
        </div>
      </main>
    </div>
  );
}
