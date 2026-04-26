"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, ListTodo, Trophy, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import { Ambassador, AppData, ensureSeedData, getLeaderboard, submitTaskProof, resetAllData } from "@/lib/storage";
import { generateAmbassadorNotifications } from "@/lib/notificationGenerators";
import BadgeCard from "@/components/ui/BadgeCard";
import CircularAvatar from "@/components/ui/CircularAvatar";

type GeneratedTask = {
  title: string;
  description: string;
  points: number;
  proof: string;
};

type ProofResult = {
  score: number;
  feedback: string;
  valid: boolean;
};

type InsightsResult = {
  insights: string[];
  recommendation: string;
};

type WeeklyReportResult = {
  digest: string;
};

function formatDeadline(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AmbassadorDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [proofInput, setProofInput] = useState("");
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [insightsResult, setInsightsResult] = useState<InsightsResult | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [weeklyReportResult, setWeeklyReportResult] = useState<WeeklyReportResult | null>(null);
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false);
  const [weeklyReportError, setWeeklyReportError] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      setData(ensureSeedData());
      generateAmbassadorNotifications();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const leaderboard: Ambassador[] = useMemo(() => {
    if (!data) return [];
    return getLeaderboard(data.ambassadors);
  }, [data]);

  const activeAmbassador = useMemo(() => {
    if (!data) return null;
    return data.ambassadors.find((ambassador) => ambassador.id === data.currentAmbassadorId) ?? null;
  }, [data]);

  const rank = useMemo(() => {
    if (!activeAmbassador) return "-";
    const found = leaderboard.findIndex((ambassador) => ambassador.id === activeAmbassador.id);
    return found === -1 ? "-" : found + 1;
  }, [activeAmbassador, leaderboard]);

  const streakWeek = useMemo(() => {
    if (!activeAmbassador) return [];
    const activity = new Set(activeAmbassador.activityDates);
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const iso = date.toISOString().slice(0, 10);
      return {
        key: iso,
        label: days[date.getDay()],
        active: activity.has(iso),
      };
    });
  }, [activeAmbassador]);

  const navItems = [
    {
      id: "amb-dashboard",
      label: "Dashboard",
      href: "#dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "amb-tasks",
      label: "My Tasks",
      href: "#tasks",
      icon: <ListTodo size={18} />,
    },
    {
      id: "amb-badges",
      label: "Badges",
      href: "#badges",
      icon: <Trophy size={18} />,
    },
  ];

  const pushNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 2600);
  };

  const handleSubmitProof = (taskId: string) => {
    if (!data) return;
    const result = submitTaskProof(data.currentAmbassadorId, taskId);
    if (!result) return;
    if (result.alreadyCompleted) {
      pushNotification("Task already completed");
      return;
    }
    setData(result.data);
    pushNotification(`Points +${result.pointsEarned}`);
    result.badgesUnlocked.forEach((badge) => pushNotification(`New Badge Unlocked! ${badge}`));
  };

  const handleGenerateTasks = async () => {
    if (!goalInput.trim()) {
      setTaskError("Please enter a goal first.");
      return;
    }
    setTaskLoading(true);
    setTaskError(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "task", data: goalInput }),
      });
      const payload = (await response.json()) as { result?: unknown; error?: string };
      if (!response.ok || !payload.result || !Array.isArray(payload.result)) {
        throw new Error(payload.error ?? "Unable to generate tasks.");
      }
      setGeneratedTasks(payload.result as GeneratedTask[]);
      pushNotification("AI generated successfully");
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Unable to generate tasks.");
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCheckProofWithAI = async () => {
    if (!proofInput.trim()) {
      setProofError("Please enter a submission.");
      return;
    }
    setProofLoading(true);
    setProofError(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "proof", data: proofInput }),
      });
      const payload = (await response.json()) as { result?: unknown; error?: string };
      if (!response.ok || !payload.result || typeof payload.result !== "object") {
        throw new Error(payload.error ?? "Unable to verify proof.");
      }
      setProofResult(payload.result as ProofResult);
      pushNotification("AI generated successfully");
    } catch (error) {
      setProofError(error instanceof Error ? error.message : "Unable to verify proof.");
    } finally {
      setProofLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!data || !activeAmbassador) return;
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const stats = {
        ambassadorName: activeAmbassador.name,
        points: activeAmbassador.points,
        streak: activeAmbassador.streak,
        rank,
        totalAmbassadors: data.ambassadors.length,
        completedTasks: activeAmbassador.completedTaskIds.length,
        badges: activeAmbassador.badges,
      };
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "insights", data: JSON.stringify(stats) }),
      });
      const payload = (await response.json()) as { result?: unknown; error?: string };
      if (!response.ok || !payload.result || typeof payload.result !== "object") {
        throw new Error(payload.error ?? "Unable to generate insights.");
      }
      const result = payload.result as InsightsResult;
      setInsightsResult({
        insights: Array.isArray(result.insights) ? result.insights.slice(0, 3) : [],
        recommendation: result.recommendation ?? "",
      });
      pushNotification("AI generated successfully");
    } catch (error) {
      setInsightsError(error instanceof Error ? error.message : "Unable to generate insights.");
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    if (!data || !activeAmbassador) return;
    setWeeklyReportLoading(true);
    setWeeklyReportError(null);
    try {
      // Calculate weekly stats (simplified - using current stats as example)
      const weeklyStats = {
        name: activeAmbassador.name,
        points: activeAmbassador.points,
        tasks: activeAmbassador.completedTaskIds.length,
        streak: activeAmbassador.streak,
        rank: rank,
        badges: activeAmbassador.badges.join(", ") || "None",
      };
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "digest", data: JSON.stringify(weeklyStats) }),
      });
      const payload = (await response.json()) as { result?: unknown; error?: string };
      if (!response.ok || !payload.result || typeof payload.result !== "object") {
        throw new Error(payload.error ?? "Unable to generate weekly report.");
      }
      const result = payload.result as WeeklyReportResult;
      setWeeklyReportResult(result);
      pushNotification("Weekly report generated successfully");
    } catch (error) {
      setWeeklyReportError(error instanceof Error ? error.message : "Unable to generate weekly report.");
    } finally {
      setWeeklyReportLoading(false);
    }
  };

  if (!mounted || !data || !activeAmbassador) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] p-6 md:ml-60">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={`amb-skeleton-${idx}`} className="animate-pulse">
              <div className="h-8 w-24 rounded bg-zinc-700/70" />
              <div className="mt-3 h-4 w-32 rounded bg-zinc-800/70" />
              <div className="mt-4 h-2 w-2 rounded-full bg-zinc-700/70" />
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0F] text-[#F9FAFB]">
      <Sidebar roleLabel="Ambassador" navItems={navItems} />
      <div className="md:ml-60">
        <Navbar
          title="Ambassador Dashboard"
          subtitle={`Welcome back, ${activeAmbassador.name}`}
          userName={activeAmbassador.name}
        />
        <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-12">
          <div className="pointer-events-none fixed right-3 top-20 z-50 space-y-2 md:right-5">
            <AnimatePresence>
              {notifications.map((message, idx) => (
                <motion.div
                  key={`${message}-${idx}`}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 18, scale: 0.95 }}
                  className="rounded-xl border border-[#1F2937] bg-[#111827]/95 px-4 py-2 text-sm text-[#F9FAFB] shadow-lg backdrop-blur"
                >
                  {message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.section
            id="dashboard"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:col-span-12 md:grid-cols-3"
          >
            <Card>
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">
                  Points
                </div>
                <div className="text-[40px] font-bold text-[#F1F5F9] animate-count-up" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {activeAmbassador.points}
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">
                  Rank
                </div>
                <div className="text-[40px] font-bold text-[#3B82F6] animate-count-up" style={{ fontVariantNumeric: "tabular-nums" }}>
                  #{rank}
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">
                  Streak
                </div>
                <div className="text-[40px] font-bold text-[#F59E0B] animate-count-up" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {activeAmbassador.streak}
                </div>
                <div className="flex items-center gap-2">
                  {streakWeek.map((day) => (
                    <div key={day.key} className="flex flex-col items-center gap-1">
                      <span
                        className={`w-[10px] h-[10px] rounded-full ${
                          day.active 
                            ? "bg-[#10B981]" 
                            : "bg-[#1E2433]"
                        } ${
                          day.key === new Date().toISOString().slice(0, 10) 
                            ? "bg-[#3B82F6]" 
                            : ""
                        }`}
                      />
                      <span className="text-[10px] text-[#64748B]">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="md:col-span-12"
          >
            <div className="flex justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, opacity: 0.85 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (confirm("Are you sure you want to reset all progress? This will clear all your data!")) {
                    resetAllData();
                    window.location.reload();
                  }
                }}
                className="rounded-[12px] bg-[#131720] border border-[#EF4444] px-8 py-3 text-sm font-semibold text-[#EF4444] transition-all duration-150 hover:bg-[rgba(239,68,68,0.08)] flex items-center gap-2"
              >
                <Sparkles size={16} />
                Reset All Data
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, opacity: 0.85 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateWeeklyReport}
                disabled={weeklyReportLoading}
                className="rounded-[12px] bg-[#131720] border border-[#3B82F6] px-8 py-3 text-sm font-semibold text-[#3B82F6] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[rgba(59,130,246,0.08)] flex items-center gap-2"
              >
                <Sparkles size={16} />
                {weeklyReportLoading ? "Generating..." : "Generate My Weekly Report"}
              </motion.button>
            </div>
            {weeklyReportError ? <p className="mt-3 text-center text-sm text-red-400">{weeklyReportError}</p> : null}
          </motion.section>

          <AnimatePresence>
            {weeklyReportResult && (
              <motion.section
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="md:col-span-12"
              >
                <Card>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>Your Week in Review 📊</h3>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateWeeklyReport}
                      disabled={weeklyReportLoading}
                      className="rounded-lg border border-[rgba(124,58,237,0.4)] text-[#7C3AED] bg-transparent px-3 py-1.5 text-xs font-semibold transition-all duration-250 hover:bg-[rgba(124,58,237,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {weeklyReportLoading ? "Regenerating..." : "Regenerate"}
                    </motion.button>
                  </div>
                  <p className="text-[#E5E7EB] leading-relaxed">{weeklyReportResult.digest}</p>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>

          <motion.section
            id="tasks"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="md:col-span-8"
          >
            <Card>
              <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>Task List</h2>
              <div className="mt-4 space-y-3">
                <AnimatePresence>
                  {data.tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#1F2937] bg-zinc-900/30 p-6 text-sm text-[#9CA3AF]">
                      No tasks yet. Your organization will assign tasks soon.
                    </div>
                  ) : (
                    data.tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="rounded-xl border border-[#1F2937] bg-zinc-900/50 p-4 md:flex md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-[#F9FAFB]">{task.title}</p>
                        <p className="mt-1 text-xs text-[#9CA3AF]">Deadline: {formatDeadline(task.deadline)}</p>
                        <span className="numeric mt-2 inline-block rounded-full bg-[rgba(59,130,246,0.1)] px-3 py-1 text-xs font-semibold text-[#3B82F6]">
                          {task.points} points
                        </span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubmitProof(task.id)}
                        disabled={activeAmbassador.completedTaskIds.includes(task.id)}
                        className="mt-3 rounded-[8px] bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white shadow-[0_4px_24px_rgba(59,130,246,0.3)] transition disabled:cursor-not-allowed disabled:opacity-40 md:mt-0"
                      >
                        {activeAmbassador.completedTaskIds.includes(task.id) ? "Completed" : "Submit Proof"}
                      </motion.button>
                    </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Card>
            <Card className="mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>AI Task Generator</h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateTasks}
                  disabled={taskLoading}
                  className="rounded-[8px] bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white shadow-[0_4px_24px_rgba(59,130,246,0.3)] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {taskLoading ? "Thinking..." : "Generate Tasks"}
                </motion.button>
              </div>
              <div className="mt-3">
                <input
                  value={goalInput}
                  onChange={(event) => setGoalInput(event.target.value)}
                  placeholder="Enter your goal"
                  className="w-full rounded-xl border border-[#1E2433] bg-[#131720] px-3 py-2 text-sm text-[#F1F5F9] outline-none ring-[#3B82F6]/60 placeholder:text-[#64748B] focus:ring-1"
                />
              </div>
              {taskError ? <p className="mt-3 text-sm text-red-400">{taskError}</p> : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {generatedTasks.map((task, idx) => (
                  <div key={`${task.title}-${idx}`} className="rounded-xl border border-[#1F2937] bg-zinc-900/40 p-3">
                    <p className="font-medium text-[#F9FAFB]">{task.title}</p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">{task.description}</p>
                    <p className="mt-2 text-xs text-[#3B82F6]">Points: {task.points}</p>
                    <p className="mt-1 text-xs text-cyan-300">Proof: {task.proof}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.section>

          <motion.section
            id="badges"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="md:col-span-4"
          >
            <Card>
              <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>Badges</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { name: "Bronze Badge", rarity: "Common" as const },
                  { name: "Silver Badge", rarity: "Rare" as const },
                  { name: "Gold Badge", rarity: "Epic" as const },
                  { name: "Legend Badge", rarity: "Legendary" as const },
                ].map((badge) => {
                  const unlocked = activeAmbassador.badges.includes(badge.name);
                  return (
                    <BadgeCard
                      key={badge.name}
                      name={badge.name}
                      rarity={badge.rarity}
                      unlocked={unlocked}
                    />
                  );
                })}
              </div>
            </Card>
            <Card className="mt-4">
              <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>AI Proof Verifier</h2>
              <textarea
                value={proofInput}
                onChange={(event) => setProofInput(event.target.value)}
                placeholder="Describe your submission proof"
                className="mt-3 min-h-24 w-full rounded-xl border border-[#1E2433] bg-[#131720] px-3 py-2 text-sm text-[#F1F5F9] outline-none ring-[#3B82F6]/60 placeholder:text-[#64748B] focus:ring-1"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckProofWithAI}
                disabled={proofLoading}
                className="mt-3 w-full rounded-[8px] bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white shadow-[0_4px_24px_rgba(59,130,246,0.3)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {proofLoading ? "Thinking..." : "Check with AI"}
              </motion.button>
              {proofError ? <p className="mt-2 text-sm text-red-400">{proofError}</p> : null}
              {proofResult ? (
                <div className="mt-3 rounded-xl border border-[#1F2937] bg-zinc-900/40 p-3">
                  <p className="text-sm text-[#F9FAFB]">
                    Score: <span className="numeric text-cyan-400">{proofResult.score}</span>
                  </p>
                  <p className={`mt-1 text-xs ${proofResult.valid ? "text-emerald-400" : "text-red-400"}`}>
                    {proofResult.valid ? "Valid submission" : "Needs improvement"}
                  </p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">{proofResult.feedback}</p>
                </div>
              ) : null}
              {activeAmbassador.completedTaskIds.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-[#1F2937] bg-zinc-900/30 p-3 text-xs text-[#9CA3AF]">
                  No submissions yet. Complete a task and run AI verification for feedback.
                </p>
              ) : null}
            </Card>
            <Card className="mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>AI Insights</h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateInsights}
                  disabled={insightsLoading}
                  className="rounded-[8px] bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {insightsLoading ? "Thinking..." : "Refresh"}
                </motion.button>
              </div>
              {insightsError ? <p className="mt-3 text-sm text-red-400">{insightsError}</p> : null}
              {insightsResult ? (
                <div className="mt-3 space-y-2">
                  <ul className="list-disc space-y-1 pl-5 text-xs text-[#9CA3AF]">
                    {insightsResult.insights.map((insight, idx) => (
                      <li key={`${insight}-${idx}`}>{insight}</li>
                    ))}
                  </ul>
                  <p className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-xs text-cyan-200">
                    Recommendation: {insightsResult.recommendation}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#9CA3AF]">Run AI analysis to view insights and recommendations.</p>
              )}
            </Card>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
