"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`rounded-[16px] border border-[#1E2433] bg-[#131720] p-6 shadow-sm hover:border-[#3B82F6] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.3)] transition-all duration-150 ${className}`}
    >
      {children}
    </motion.div>
  );
}
