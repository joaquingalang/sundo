"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/40 backdrop-blur-md border-b border-akaroa/10 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96 max-w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rhino/40" />
            <input 
              type="text" 
              placeholder="Search consultants, engagements, or help..."
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-rhino/5 border-transparent focus:bg-white focus:border-akaroa/30 focus:ring-4 focus:ring-rhino/5 transition-all font-body text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-xl bg-white border border-akaroa/10 flex items-center justify-center text-rhino hover:bg-rhino hover:text-white transition-all group relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-desert rounded-full border-2 border-white" />
            </button>
            <div className="h-11 px-4 rounded-xl bg-rhino text-white font-body text-xs font-bold flex items-center gap-2 shadow-lg shadow-rhino/5">
              <div className="w-7 h-7 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10 text-[10px]">
                    {user.displayName?.[0] || "?"}
                  </div>
                )}
              </div>
              <span className="capitalize">Verified {user.role}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
