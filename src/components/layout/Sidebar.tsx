"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  MessageCircle,
  Wallet,
  UserCircle,
  Shield,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { currentUser } from "@/lib/mock-data";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/consultations", label: "Consultations", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/escrow", label: "Escrow Wallet", icon: Wallet },
  { href: "/account", label: "Account", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light">
        <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-text-primary">Sundo</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary/8 text-primary border-l-3 border-primary"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-border-light">
        <div className="flex items-center gap-3 px-2">
          <Avatar name={currentUser.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-text-muted truncate">
              {currentUser.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
