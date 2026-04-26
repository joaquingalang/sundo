"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Wallet, 
  User, 
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

const ofwNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find Experts", href: "/consultants", icon: Users },
  { label: "Status", href: "/engagements", icon: Briefcase },
  { label: "Wallet", href: "/wallet", icon: Wallet },
];

const consultantNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Status", href: "/engagements", icon: Briefcase },
  { label: "Earnings", href: "/wallet", icon: Wallet },
];

const secondaryItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('') || "U";

  const currentNavItems = user?.role === "consultant" ? consultantNavItems : ofwNavItems;

  return (
    <aside className="w-72 bg-rhino text-white flex flex-col h-full overflow-y-auto">
      <div className="p-8">
        <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-white">
          Sundo
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="px-4 py-2">
          <p className="text-[10px] font-bold text-akaroa/30 uppercase tracking-[0.2em] mb-4 text-left">Main Menu</p>
          <div className="space-y-1">
            {currentNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-sm",
                  pathname === item.href 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "text-akaroa/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-desert" : "text-akaroa/40")} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-4 py-8">
          <p className="text-[10px] font-bold text-akaroa/30 uppercase tracking-[0.2em] mb-4 text-left">Account</p>
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-sm",
                  pathname === item.href 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "text-akaroa/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-desert" : "text-akaroa/40")} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 border-t border-white/5 space-y-6">
        <div className="flex items-center gap-4 px-4">
          <div className="w-10 h-10 rounded-full bg-akaroa/10 flex items-center justify-center text-akaroa font-bold overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-sm font-bold truncate">{user?.displayName}</p>
            <p className="text-[10px] text-akaroa/40 truncate font-body">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-akaroa/60 hover:text-red-400 hover:bg-red-400/5 transition-all font-body text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
