"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Trophy, CheckSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import { Ambassador, AppData, ensureSeedData, getLeaderboard } from "@/lib/storage";
import { generateOrgNotifications } from "@/lib/notificationGenerators";
import LiveActivityFeed from "@/components/ui/LiveActivityFeed";
import CircularAvatar from "@/components/ui/CircularAvatar";

type RiskLevel = "Healthy" | "At Risk" | "High Risk";

type CollegeData = {
  name: string;
  totalPoints: number;
  activeAmbassadors: number;
  totalAmbassadors: number;
};

function formatDeadline(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrgDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [nudgeLoadingId, setNudgeLoadingId] = useState<string | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);
  const [nudgeFor, setNudgeFor] = useState<string>("");
  const [nudgeError, setNudgeError] = useState<string | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<"ambassadors" | "colleges">("ambassadors");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      setData(ensureSeedData());
      generateOrgNotifications();
    });

    const refreshFromStorage = () => {
      setData(ensureSeedData());
    };

    window.addEventListener("storage", refreshFromStorage);
    window.addEventListener("campusconnect-storage-updated", refreshFromStorage);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", refreshFromStorage);
      window.removeEventListener("campusconnect-storage-updated", refreshFromStorage);
    };
  }, []);

  const leaderboard: Ambassador[] = useMemo(() => {
    if (!data) return [];
    return getLeaderboard(data.ambassadors);
  }, [data]);

  const totalPoints = useMemo(() => {
    if (!data) return 0;
    return data.ambassadors.reduce((sum, ambassador) => sum + ambassador.points, 0);
  }, [data]);

  const health = useMemo(() => {
    if (!data || data.ambassadors.length === 0) {
      return {
        total: 0,
        completionRate: 0,
        activityRate: 0,
        streakRetention: 0,
        pointsEvenness: 0,
      };
    }

    const ambassadors = data.ambassadors;
    const tasksCount = data.tasks.length;
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    const completedTasks = ambassadors.reduce((sum, ambassador) => sum + ambassador.completedTaskIds.length, 0);
    const completionRate =
      tasksCount > 0 ? Math.min(100, (completedTasks / (ambassadors.length * tasksCount)) * 100) : 0;

    const activityRate =
      (ambassadors.filter((ambassador) => {
        if (!ambassador.lastActiveDate) return false;
        const diff = Math.floor(
          (today.getTime() - new Date(`${ambassador.lastActiveDate}T00:00:00`).getTime()) / dayMs
        );
        return diff >= 0 && diff <= 7;
      }).length /
        ambassadors.length) *
      100;

    const streakRetention =
      (ambassadors.filter((ambassador) => ambassador.streak > 1).length / ambassadors.length) * 100;

    const total = ambassadors.reduce((sum, ambassador) => sum + ambassador.points, 0);
    const pointsEvenness = (() => {
      if (ambassadors.length <= 1) return 100;
      if (total <= 0) return 0;
      const hhi = ambassadors.reduce((sum, ambassador) => {
        const share = ambassador.points / total;
        return sum + share * share;
      }, 0);
      const minHhi = 1 / ambassadors.length;
      const normalized = (1 - hhi) / (1 - minHhi);
      return Math.max(0, Math.min(100, normalized * 100));
    })();

    const totalScore =
      completionRate * 0.3 + activityRate * 0.25 + streakRetention * 0.25 + pointsEvenness * 0.2;

    return {
      total: Math.round(totalScore),
      completionRate: Math.round(completionRate),
      activityRate: Math.round(activityRate),
      streakRetention: Math.round(streakRetention),
      pointsEvenness: Math.round(pointsEvenness),
    };
  }, [data]);

  const gauge = useMemo(() => {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(100, health.total));
    const dashOffset = circumference * (1 - progress / 100);
    const color = progress <= 40 ? "#EF4444" : progress <= 70 ? "#F59E0B" : "#10B981";
    return { radius, circumference, dashOffset, color };
  }, [health.total]);

  const ambassadorsWithRisk = useMemo(() => {
    if (!data) return [];
    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date();

    const bestBadge = (badges: string[]) => {
      if (badges.includes("Legend Badge")) return "Legend Badge";
      if (badges.includes("Gold Badge")) return "Gold Badge";
      if (badges.includes("Silver Badge")) return "Silver Badge";
      if (badges.includes("Bronze Badge")) return "Bronze Badge";
      return "No Badge";
    };

    return getLeaderboard(data.ambassadors).map((ambassador) => {
      const latestActivity = ambassador.activityDates.length
        ? [...ambassador.activityDates].sort((a, b) => b.localeCompare(a))[0]
        : ambassador.lastActiveDate;
      const daysInactive = latestActivity
        ? Math.max(0, Math.floor((today.getTime() - new Date(`${latestActivity}T00:00:00`).getTime()) / dayMs))
        : 999;
      const risk: RiskLevel = daysInactive <= 2 ? "Healthy" : daysInactive <= 5 ? "At Risk" : "High Risk";
      return {
        ...ambassador,
        daysInactive,
        risk,
        bestBadge: bestBadge(ambassador.badges),
      };
    });
  }, [data]);

  const collegeLeaderboard: CollegeData[] = useMemo(() => {
    if (!data) return [];
    
    const collegeMap = new Map<string, CollegeData>();
    
    data.ambassadors.forEach(ambassador => {
      const college = ambassador.college || "Unknown";
      const existing = collegeMap.get(college) || {
        name: college,
        totalPoints: 0,
        activeAmbassadors: 0,
        totalAmbassadors: 0,
      };
      
      existing.totalPoints += ambassador.points;
      existing.totalAmbassadors++;
      
      // Active ambassadors = those who have completed at least one task
      if (ambassador.completedTaskIds.length > 0) {
        existing.activeAmbassadors++;
      }
      
      collegeMap.set(college, existing);
    });
    
    return Array.from(collegeMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [data]);

  const maxCollegePoints = useMemo(() => {
    return Math.max(...collegeLeaderboard.map(college => college.totalPoints), 1);
  }, [collegeLeaderboard]);

  const handleSendNudge = async (ambassador: (Ambassador & { daysInactive: number; risk: RiskLevel; bestBadge: string })) => {
    setNudgeLoadingId(ambassador.id);
    setNudgeError(null);
    try {
      const payload = `name=${ambassador.name}; days=${ambassador.daysInactive}; points=${ambassador.points}; badge=${ambassador.bestBadge}`;
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nudge", data: payload }),
      });
      const result = (await response.json()) as { result?: { message?: string }; error?: string };
      if (!response.ok || !result.result?.message) {
        throw new Error(result.error ?? "Unable to generate nudge");
      }
      setNudgeFor(ambassador.name);
      setNudgeMessage(result.result.message);
    } catch (error) {
      setNudgeError(error instanceof Error ? error.message : "Unable to generate nudge");
    } finally {
      setNudgeLoadingId(null);
    }
  };

  const navItems = [
    {
      id: "org-dashboard",
      label: "Dashboard",
      href: "#dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "org-leaderboard",
      label: "Leaderboard",
      href: "#leaderboard",
      icon: <Trophy size={18} />,
    },
    {
      id: "org-tasks",
      label: "Tasks",
      href: "#tasks",
      icon: <CheckSquare size={18} />,
    },
  ];

  if (!mounted || !data) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] p-6 md:ml-60">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={`org-skeleton-${idx}`} className="animate-pulse">
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
      <Sidebar roleLabel="Org Admin" navItems={navItems} />
      <div className="md:ml-60">
        <Navbar
          title="Organization Dashboard"
          subtitle="Track ambassador performance and campaign tasks"
          userName="Org Admin"
        />
        <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-8">
          <motion.section
            id="dashboard"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:col-span-12 md:grid-cols-2 xl:grid-cols-4"
          >
            <Card className="group relative overflow-visible">
              <div className="relative group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">
                        Program Health
                      </div>
                      <div className="text-[40px] font-bold text-[#F1F5F9]" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {health.total}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-[6px] text-xs font-semibold ${
                      health.total >= 70 
                        ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                        : health.total >= 40 
                        ? "bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]"
                        : "bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]"
                    }`}>
                      {health.total >= 70 ? "Good" : health.total >= 40 ? "Medium" : "Poor"}
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#1E2433] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${health.total}%` }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className={`h-full rounded-full ${
                        health.total >= 70 
                          ? "bg-[#10B981]" 
                          : health.total >= 40 
                          ? "bg-[#F59E0B]" 
                          : "bg-[#EF4444]"
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -top-2 left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-xl border border-[#1F2937] bg-[#0A0A0F]/95 p-3 text-xs text-[#D1D5DB] shadow-xl group-hover:block">
                <p>Task Completion: {health.completionRate}</p>
                <p>Activity Rate (7d): {health.activityRate}</p>
                <p>Streak Retention: {health.streakRetention}</p>
                <p>Points Evenness: {health.pointsEvenness}</p>
              </div>
            </Card>
            {[
              { label: "Total Ambassadors", value: data.ambassadors.length, trend: "+8%" },
              { label: "Active Tasks", value: data.tasks.length, trend: "-2%" },
              { label: "Total Points", value: totalPoints, trend: "+14%" },
              { label: "Program Health", value: health.total, trend: "+5%" },
            ].map((item, index) => (
              <Card key={item.label} className={index === 2 ? "border-[rgba(59,130,246,0.4)] shadow-[0_0_24px_rgba(59,130,246,0.08)_inset]" : ""}>
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">
                    {item.label}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className={`numeric text-[40px] font-bold text-[#F1F5F9] animate-count-up`} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {item.value}
                    </div>
                    <div className={`text-sm font-medium ${
                      item.trend.startsWith("+") ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}>
                      {item.trend}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.section>

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
                {data.tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#1F2937] bg-zinc-900/30 p-6 text-sm text-[#9CA3AF]">
                    No tasks yet. New campaign tasks will appear here.
                  </div>
                ) : (
                  data.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="rounded-[12px] border border-[#1E2433] bg-[#131720] p-5 md:flex md:items-center md:justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase rounded-[6px] bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.2)]">
                        Content
                      </span>
                    </div>
                    <div className="pt-10">
                      <p className="font-medium text-[#F1F5F9] text-[15px]">{task.title}</p>
                      <p className="mt-1 text-xs text-[#64748B]">Deadline: {formatDeadline(task.deadline)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 md:mt-0">
                      <span className="numeric text-sm text-[#F59E0B] font-semibold flex items-center gap-1">
                        {task.points}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1E2433] rounded-b-[12px] overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-b-[12px]"></div>
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.section>

          <motion.section
            id="leaderboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4"
          >
            <Card>
              <div className="mb-4">
                <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>Leaderboard</h2>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaderboardTab("ambassadors")}
                    className={`rounded-[8px] px-3 py-1.5 text-sm font-medium transition ${
                      leaderboardTab === "ambassadors"
                        ? "bg-[#3B82F6] text-white"
                        : "bg-transparent text-[#64748B] border border-[#1E2433] hover:border-[#3B82F6]"
                    }`}
                  >
                    Ambassadors
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaderboardTab("colleges")}
                    className={`rounded-[8px] px-3 py-1.5 text-sm font-medium transition ${
                      leaderboardTab === "colleges"
                        ? "bg-[#3B82F6] text-white"
                        : "bg-transparent text-[#64748B] border border-[#1E2433] hover:border-[#3B82F6]"
                    }`}
                  >
                    Colleges
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {leaderboardTab === "ambassadors" ? (
                  <motion.div
                    key="ambassadors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {leaderboard.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#1F2937] bg-zinc-900/30 p-6 text-sm text-[#9CA3AF]">
                        No submissions yet. Leaderboard updates after first proof.
                      </div>
                    ) : (
                      leaderboard.slice(0, 5).map((ambassador, idx) => {
                      const rank = idx + 1;
                      const getRankStyle = () => {
                        if (rank === 1) return "border-l-2 border-l-[#F59E0B] bg-[rgba(245,158,11,0.03)]";
                        if (rank === 2) return "border-l-2 border-l-[#94A3B8]";
                        if (rank === 3) return "border-l-2 border-l-[#CD7F32]";
                        return "";
                      };
                      const getAvatarRing = () => {
                        if (rank === 1) return "border-2 border-[#F59E0B]";
                        if (rank === 2) return "border-2 border-[#94A3B8]";
                        if (rank === 3) return "border-2 border-[#CD7F32]";
                        return "border border-[#1E2433]";
                      };
                      return (
                        <motion.div
                          key={ambassador.id}
                          whileHover={{ x: 2, scale: 1.01 }}
                          className={`flex items-center justify-between p-[14px_16px] border-b border-[#1E2433] hover:bg-[#0E1117] animate-slide-in-left ${getRankStyle()}`}
                          style={{ animationDelay: `${idx * 0.06}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#1E2433] to-[#131720] flex items-center justify-center text-[#3B82F6] font-bold text-xs ${getAvatarRing()}`}>
                              {ambassador.name.split(" ").slice(0, 2).map(part => part[0]).join("")}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#64748B] min-w-[28px]">
                                #{rank}
                              </div>
                              <p className="text-sm font-medium text-[#F1F5F9]">{ambassador.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[15px] font-semibold text-[#F1F5F9]" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {ambassador.points}
                            </div>
                            <p className="text-xs text-[#F59E0B]">{ambassador.streak} day streak</p>
                          </div>
                        </motion.div>
                      );
                      })
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="colleges"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {collegeLeaderboard.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#1F2937] bg-zinc-900/30 p-6 text-sm text-[#9CA3AF]">
                        No college data available yet.
                      </div>
                    ) : (
                      collegeLeaderboard.map((college, idx) => {
                        const barWidth = (college.totalPoints / maxCollegePoints) * 100;
                        
                        return (
                          <motion.div
                            key={college.name}
                            whileHover={{ x: 2, scale: 1.01 }}
                            className={`rounded-xl border border-[#1E2433] bg-[#131720] p-4`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1E2433] to-[#131720] text-sm font-bold text-[#3B82F6] border border-[#1E2433]">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#F1F5F9]">{college.name}</p>
                                  <p className="text-xs text-[#64748B]">
                                    {college.activeAmbassadors} active ambassador{college.activeAmbassadors !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[15px] font-semibold text-[#F1F5F9]" style={{ fontVariantNumeric: "tabular-nums" }}>{college.totalPoints}</p>
                                <p className="text-xs text-[#9CA3AF]">total points</p>
                              </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#1E2433] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidth}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
                              />
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="md:col-span-12"
          >
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bebas text-[#F9FAFB]" style={{ letterSpacing: "0.02em" }}>Ambassador Health Monitor</h2>
                {nudgeError ? <p className="text-xs text-red-400">{nudgeError}</p> : null}
              </div>
              <div className="space-y-3">
                {ambassadorsWithRisk.map((ambassador) => (
                  <div
                    key={ambassador.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-zinc-900/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">{ambassador.name}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {ambassador.college} • {ambassador.daysInactive} day(s) inactive • {ambassador.points} points
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          ambassador.risk === "Healthy"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : ambassador.risk === "At Risk"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {ambassador.risk}
                      </span>
                      {ambassador.risk !== "Healthy" ? (
                        <button
                          type="button"
                          onClick={() => handleSendNudge(ambassador)}
                          disabled={nudgeLoadingId === ambassador.id}
                          className="rounded-[8px] bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 shadow-[0_4px_24px_rgba(59,130,246,0.3)]"
                        >
                          {nudgeLoadingId === ambassador.id ? "Thinking..." : "Send Nudge"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.section>
        </main>
        
        {/* Floating Live Activity Feed Widget */}
        <LiveActivityFeed />
      </div>
      {nudgeMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#F9FAFB]">Nudge Message for {nudgeFor}</h3>
            <p className="mt-3 text-sm text-[#D1D5DB]">{nudgeMessage}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNudgeMessage(null)}
                className="rounded-lg border border-[#1F2937] px-3 py-2 text-sm text-[#9CA3AF]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(nudgeMessage);
                }}
                className="rounded-[8px] bg-[#3B82F6] px-3 py-2 text-sm font-medium text-white shadow-[0_4px_24px_rgba(59,130,246,0.3)]"
              >
                Copy Message
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
