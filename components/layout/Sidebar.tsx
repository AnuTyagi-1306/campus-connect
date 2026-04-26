"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
};

type SidebarProps = {
  roleLabel: string;
  navItems: NavItem[];
};

export default function Sidebar({ roleLabel, navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#1E2433] bg-[#080B14] p-6 md:block">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-[#F1F5F9]">
          CampusConnect
        </h1>
        <h2 className="mt-1 text-xs font-medium text-[#3B82F6] uppercase tracking-wider">{roleLabel}</h2>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href.startsWith('#') && (pathname === '/ambassador/dashboard' || pathname === '/org/dashboard'));
          const handleClick = (e: React.MouseEvent) => {
            if (item.href.startsWith('#')) {
              e.preventDefault();
              const element = document.querySelector(item.href);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          };
          
          return (
          <Link
            key={item.id}
            href={item.href}
            onClick={handleClick}
            className={`relative flex items-center gap-2.5 overflow-hidden rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-[#131720] text-[#F1F5F9] border-l-2 border-l-[#3B82F6]"
                : "text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#131720]"
            }`}
          >
            <motion.span whileHover={{ scale: 1.07 }} className="text-lg">
              {item.icon}
            </motion.span>
            {item.label}
          </Link>
          );
        })}
      </nav>
    </aside>
  );
}
