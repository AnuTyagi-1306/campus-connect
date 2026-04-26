"use client";

import { motion } from "framer-motion";
import NotificationCenter from "@/components/ui/NotificationCenter";

type NavbarProps = {
  title: string;
  subtitle?: string;
  userName?: string;
};

export default function Navbar({ title, subtitle, userName = "User" }: NavbarProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[#1E2433] bg-[rgba(8,11,20,0.95)] px-6 backdrop-blur-[16px]">
      <div className="flex h-full items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9]">{title}</h1>
          {subtitle ? <p className="text-sm text-[#64748B]">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <div className="flex items-center gap-2 rounded-xl border border-[#1E2433] bg-[#131720] px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E1117] border border-[#1E2433] text-xs font-bold text-[#3B82F6]">
              {initial}
            </div>
            <span className="pr-1 text-sm text-[#F1F5F9]">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
