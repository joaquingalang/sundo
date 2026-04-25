import React from "react";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-dvh">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
