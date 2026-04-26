"use client";

import { Shield, Zap, Trophy, Crown, Flame, Flag, Star, Target, Building } from "lucide-react";

interface BadgeCardProps {
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  unlocked: boolean;
}

const badgeConfig = {
  Common: { 
    color: "#CD7F32", 
    icon: Shield,
    glowColor: "rgba(205, 127, 50, 0.3)" 
  },
  Rare: { 
    color: "#94A3B8", 
    icon: Zap,
    glowColor: "rgba(148, 163, 184, 0.3)" 
  },
  Epic: { 
    color: "#F59E0B", 
    icon: Trophy,
    glowColor: "rgba(245, 158, 11, 0.3)" 
  },
  Legendary: { 
    color: "#3B82F6", 
    icon: Crown,
    glowColor: "rgba(59, 130, 246, 0.3)" 
  },
};

const specialBadgeConfig = {
  "Bronze Badge": { color: "#CD7F32", icon: Shield },
  "Silver Badge": { color: "#94A3B8", icon: Zap },
  "Gold Badge": { color: "#F59E0B", icon: Trophy },
  "Legend Badge": { color: "#3B82F6", icon: Crown },
  "Streak": { color: "#F97316", icon: Flame },
  "First Task": { color: "#10B981", icon: Flag },
  "Overachiever": { color: "#EAB308", icon: Star },
  "SharpShooter": { color: "#EF4444", icon: Target },
  "Campus Hero": { color: "#8B5CF6", icon: Building },
};

export default function BadgeCard({ name, rarity, unlocked }: BadgeCardProps) {
  const config = badgeConfig[rarity];
  const specialConfig = specialBadgeConfig[name as keyof typeof specialBadgeConfig];
  const badgeColor = specialConfig?.color || config.color;
  const Icon = specialConfig?.icon || config.icon;

  return (
    <div className={`bg-[#131720] border border-[#1E2433] rounded-[16px] p-5 flex flex-col items-center gap-3 ${
      !unlocked ? "opacity-50" : ""
    }`}>
      {/* Icon Container */}
      <div 
        className="w-16 h-16 rounded-full bg-[#0E1117] border-2 flex items-center justify-center"
        style={{ 
          borderColor: unlocked ? badgeColor : "#1E2433",
          boxShadow: unlocked ? `0 0 16px ${badgeColor}30` : "none"
        }}
      >
        <Icon 
          size={32} 
          color={unlocked ? badgeColor : "#334155"}
        />
      </div>

      {/* Badge Name */}
      <h3 className="text-[13px] font-semibold text-[#F1F5F9] text-center">
        {name}
      </h3>

      {/* Status Pill */}
      <div
        className={`px-3 py-1 rounded-[6px] text-xs font-semibold ${
          unlocked 
            ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
            : "bg-[rgba(100,116,139,0.1)] text-[#64748B] border border-[#1E2433]"
        }`}
      >
        {unlocked ? "Unlocked" : "Locked"}
      </div>
    </div>
  );
}
