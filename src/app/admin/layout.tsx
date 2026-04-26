import { Providers } from "@/components/Providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream/30">
      {children}
    </div>
  );
}
