"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="hero-bg landing-grid relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-4xl rounded-[24px] border border-[rgba(59,130,246,0.2)] bg-[rgba(14,17,23,0.85)] p-8 text-center backdrop-blur-24 shadow-[0_0_80px_rgba(59,130,246,0.08)] md:p-12"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-[#3B82F6]">CampusConnect</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[#F1F5F9] md:text-6xl">
          Premium control for campus ambassador programs
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-[#64748B]">
          Drive outreach, assign growth tasks, and monitor ambassador performance from one elegant
          dark workspace.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.99 }}>
            <Link
              href="/org/dashboard"
              className="block rounded-[12px] bg-[#3B82F6] px-8 py-3.5 font-semibold text-white shadow-[0_4px_24px_rgba(59,130,246,0.3)] transition hover:bg-[#2563EB]"
            >
              I&apos;m an Organization
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
            <Link
              href="/ambassador/dashboard"
              className="block rounded-[12px] border border-[#1E2433] px-8 py-3.5 font-semibold text-[#F1F5F9] transition hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.06)]"
            >
              I&apos;m an Ambassador
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
