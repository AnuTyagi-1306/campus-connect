"use client";

export type Ambassador = {
  id: string;
  name: string;
  college: string;
  points: number;
  streak: number;
  lastActiveDate: string | null;
  badges: string[];
  completedTaskIds: string[];
  activityDates: string[];
};

export type Task = {
  id: string;
  title: string;
  points: number;
  deadline: string;
};

export type AppData = {
  ambassadors: Ambassador[];
  tasks: Task[];
  currentAmbassadorId: string;
};

export type TaskSubmissionResult = {
  data: AppData;
  pointsEarned: number;
  badgesUnlocked: string[];
  alreadyCompleted: boolean;
};

const STORAGE_KEY = "campusconnect-data-v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const BADGE_MILESTONES = [
  { points: 100, name: "Bronze Badge" },
  { points: 300, name: "Silver Badge" },
  { points: 700, name: "Gold Badge" },
  { points: 1500, name: "Legend Badge" },
];

const seedData: AppData = {
  ambassadors: [
    {
      id: "a1",
      name: "Aarav Mehta",
      college: "IIT Madras",
      points: 1180,
      streak: 9,
      lastActiveDate: "2026-04-25",
      badges: ["Bronze Badge", "Silver Badge", "Gold Badge"],
      completedTaskIds: ["t1", "t2", "t4"],
      activityDates: ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24", "2026-04-25"],
    },
    {
      id: "a2",
      name: "Diya Khanna",
      college: "Lady Shri Ram College",
      points: 960,
      streak: 7,
      lastActiveDate: "2026-04-25",
      badges: ["Bronze Badge", "Silver Badge", "Gold Badge"],
      completedTaskIds: ["t1", "t3"],
      activityDates: ["2026-04-19", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24", "2026-04-25"],
    },
    {
      id: "a3",
      name: "Ishaan Kulkarni",
      college: "COEP Technological University",
      points: 830,
      streak: 5,
      lastActiveDate: "2026-04-24",
      badges: ["Bronze Badge", "Silver Badge", "Gold Badge"],
      completedTaskIds: ["t2", "t5"],
      activityDates: ["2026-04-18", "2026-04-20", "2026-04-21", "2026-04-23", "2026-04-24"],
    },
    {
      id: "a4",
      name: "Sana Fatima",
      college: "St. Xavier's College Mumbai",
      points: 710,
      streak: 6,
      lastActiveDate: "2026-04-25",
      badges: ["Bronze Badge", "Silver Badge", "Gold Badge"],
      completedTaskIds: ["t1", "t5"],
      activityDates: ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24", "2026-04-25"],
    },
    {
      id: "a5",
      name: "Pranav Reddy",
      college: "NIT Warangal",
      points: 640,
      streak: 4,
      lastActiveDate: "2026-04-25",
      badges: ["Bronze Badge", "Silver Badge"],
      completedTaskIds: ["t3", "t4"],
      activityDates: ["2026-04-21", "2026-04-22", "2026-04-24", "2026-04-25"],
    },
    {
      id: "a6",
      name: "Ananya Sen",
      college: "Jadavpur University",
      points: 520,
      streak: 3,
      lastActiveDate: "2026-04-24",
      badges: ["Bronze Badge", "Silver Badge"],
      completedTaskIds: ["t2"],
      activityDates: ["2026-04-22", "2026-04-23", "2026-04-24"],
    },
    {
      id: "a7",
      name: "Karthik Iyer",
      college: "VIT Vellore",
      points: 390,
      streak: 1,
      lastActiveDate: "2026-04-24",
      badges: ["Bronze Badge", "Silver Badge"],
      completedTaskIds: ["t5"],
      activityDates: ["2026-04-24"],
    },
    {
      id: "a8",
      name: "Manya Oberoi",
      college: "Symbiosis Pune",
      points: 280,
      streak: 2,
      lastActiveDate: "2026-04-24",
      badges: ["Bronze Badge"],
      completedTaskIds: ["t3"],
      activityDates: ["2026-04-23", "2026-04-24"],
    },
    {
      id: "a9",
      name: "Ritvik Bansal",
      college: "IIM Rohtak (IPM)",
      points: 170,
      streak: 1,
      lastActiveDate: "2026-04-23",
      badges: ["Bronze Badge"],
      completedTaskIds: [],
      activityDates: ["2026-04-23"],
    },
    {
      id: "a10",
      name: "Tara Bhattacharya",
      college: "Ashoka University",
      points: 120,
      streak: 2,
      lastActiveDate: "2026-04-24",
      badges: ["Bronze Badge"],
      completedTaskIds: [],
      activityDates: ["2026-04-23", "2026-04-24"],
    },
  ],
  tasks: [
    { id: "t1", title: "Host an orientation meetup", points: 120, deadline: "2026-05-10" },
    { id: "t2", title: "Get 20 sign-ups from campus", points: 80, deadline: "2026-05-08" },
    { id: "t3", title: "Publish one promo reel", points: 60, deadline: "2026-05-06" },
    { id: "t4", title: "Set up a booth for awareness", points: 90, deadline: "2026-05-14" },
    { id: "t5", title: "Share campaign in 3 clubs", points: 50, deadline: "2026-05-05" },
  ],
  currentAmbassadorId: "a1",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`).getTime();
  const to = new Date(`${toISO}T00:00:00`).getTime();
  return Math.floor((to - from) / DAY_MS);
}

function normalizeAmbassador(ambassador: Ambassador): Ambassador {
  return {
    ...ambassador,
    streak: ambassador.streak ?? 0,
    lastActiveDate: ambassador.lastActiveDate ?? null,
    badges: ambassador.badges ?? [],
    completedTaskIds: ambassador.completedTaskIds ?? [],
    activityDates: ambassador.activityDates ?? [],
  };
}

function normalizeData(data: AppData): AppData {
  return {
    ...data,
    ambassadors: data.ambassadors.map((ambassador) => normalizeAmbassador(ambassador)),
  };
}

export function getStorageData(): AppData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

export function setStorageData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("campusconnect-storage-updated"));
}

export function updateStorageData(updater: (prev: AppData) => AppData): AppData | null {
  const prev = getStorageData();
  if (!prev) return null;
  const next = updater(prev);
  setStorageData(next);
  return next;
}

export function ensureSeedData(): AppData {
  const existing = getStorageData();
  if (existing) {
    const normalized = normalizeData(existing);
    setStorageData(normalized);
    return normalized;
  }
  setStorageData(seedData);
  return seedData;
}

export function sortLeaderboard(ambassadors: Ambassador[]): Ambassador[] {
  return [...ambassadors].sort((a, b) => b.points - a.points);
}

export function getLeaderboard(ambassadors: Ambassador[]): Ambassador[] {
  return sortLeaderboard(ambassadors);
}

export function updatePoints(userId: string, points: number): AppData | null {
  return updateStorageData((prev) => {
    const ambassadors = prev.ambassadors.map((ambassador) =>
      ambassador.id === userId ? { ...ambassador, points: ambassador.points + points } : ambassador
    );
    return { ...prev, ambassadors };
  });
}

export function updateStreak(userId: string): AppData | null {
  return updateStorageData((prev) => {
    const now = todayISO();
    const ambassadors = prev.ambassadors.map((ambassador) => {
      if (ambassador.id !== userId) return ambassador;
      if (!ambassador.lastActiveDate) {
        return { ...ambassador, streak: 1, lastActiveDate: now, activityDates: [...ambassador.activityDates, now] };
      }
      const diff = dayDiff(ambassador.lastActiveDate, now);
      if (diff <= 0) return ambassador;
      const activityDates = Array.from(new Set([...ambassador.activityDates, now])).slice(-30);
      if (diff === 1) {
        return { ...ambassador, streak: ambassador.streak + 1, lastActiveDate: now, activityDates };
      }
      return { ...ambassador, streak: 1, lastActiveDate: now, activityDates };
    });
    return { ...prev, ambassadors };
  });
}

export function checkAndAssignBadges(userId: string): { data: AppData | null; unlocked: string[] } {
  const unlocked: string[] = [];
  const data = updateStorageData((prev) => {
    const ambassadors = prev.ambassadors.map((ambassador) => {
      if (ambassador.id !== userId) return ambassador;
      const current = new Set(ambassador.badges);
      for (const milestone of BADGE_MILESTONES) {
        if (ambassador.points >= milestone.points && !current.has(milestone.name)) {
          current.add(milestone.name);
          unlocked.push(milestone.name);
        }
      }
      return { ...ambassador, badges: Array.from(current) };
    });
    return { ...prev, ambassadors };
  });
  return { data, unlocked };
}

export function submitTaskProof(userId: string, taskId: string): TaskSubmissionResult | null {
  let pointsEarned = 0;
  const badgesUnlocked: string[] = [];
  let alreadyCompleted = false;

  const data = updateStorageData((prev) => {
    const task = prev.tasks.find((item) => item.id === taskId);
    if (!task) return prev;

    const now = todayISO();
    const ambassadors = prev.ambassadors.map((ambassador) => {
      if (ambassador.id !== userId) return ambassador;

      if (ambassador.completedTaskIds.includes(taskId)) {
        alreadyCompleted = true;
        return ambassador;
      }

      pointsEarned = task.points;
      const updatedPoints = ambassador.points + task.points;
      const diff = ambassador.lastActiveDate ? dayDiff(ambassador.lastActiveDate, now) : 1;
      const nextStreak = diff <= 0 ? ambassador.streak : diff === 1 ? ambassador.streak + 1 : 1;
      const nextBadges = new Set(ambassador.badges);
      const activityDates = Array.from(new Set([...ambassador.activityDates, now])).slice(-30);

      for (const milestone of BADGE_MILESTONES) {
        if (updatedPoints >= milestone.points && !nextBadges.has(milestone.name)) {
          nextBadges.add(milestone.name);
          badgesUnlocked.push(milestone.name);
        }
      }

      return {
        ...ambassador,
        points: updatedPoints,
        streak: nextStreak,
        lastActiveDate: now,
        badges: Array.from(nextBadges),
        completedTaskIds: [...ambassador.completedTaskIds, taskId],
        activityDates,
      };
    });

    return { ...prev, ambassadors: sortLeaderboard(ambassadors) };
  });

  if (!data) return null;
  return { data, pointsEarned, badgesUnlocked, alreadyCompleted };
}

export function resetAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("campusconnect-storage-updated"));
}
