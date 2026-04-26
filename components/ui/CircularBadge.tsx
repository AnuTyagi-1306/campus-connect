"use client";

import { motion } from "framer-motion";
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
                }}
              />
            </>
          )}
          
          {/* Gold badge: metallic gradient with subtle shimmer */}
          {rarity === "Epic" && (
            <>
              {/* Metallic gradient background */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, #D4AF37 0%, #B8962E 50%, #8C6F1D 100%)`,
                }}
              />
              {/* Subtle inner highlight */}
              <div
                className="absolute inset-2 rounded-full opacity-30"
                style={{
                  background: `linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              {/* Very slow shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)`,
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </>
          )}
          
          {/* Legendary badge: premium special effects */}
          {rarity === "Legendary" && (
            <>
              {/* Enhanced metallic gradient background */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, #FF00FF 0%, #7C3AED 25%, #06B6D4 50%, #10B981 75%, #F59E0B 100%)`,
                }}
              />
              {/* Enhanced inner highlight */}
              <div
                className="absolute inset-2 rounded-full opacity-40"
                style={{
                  background: `linear-gradient(45deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(255,255,255,0.18) 100%)`,
                }}
              />
              
              {/* Multiple animated gradient overlays */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background: `conic-gradient(from 0deg, #FF00FF, #00FFFF, #00FF00, #FFFF00, #FF00FF)`,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Counter-rotating gradient overlay */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: `conic-gradient(from 180deg, #FF1493, #FFD700, #00CED1, #FF1493)`,
                }}
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Enhanced shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)`,
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Particle effects - orbiting dots */}
              {[0, 90, 180, 270].map((angle, index) => {
                const colors = ["#FF00FF", "#00FFFF", "#00FF00", "#FFFF00"];
                return (
                  <motion.div
                    key={index}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-45px)`,
                      backgroundColor: colors[index],
                      boxShadow: `0 0 10px ${colors[index]}`,
                    }}
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.6, 1, 0.6],
                      rotate: [angle, angle + 360],
                    }}
                    transition={{
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
              
              {/* Pulsing outer glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Sparkle particles */}
              {[...Array(8)].map((_, index) => {
                const sparkleColors = ["#FF00FF", "#00FFFF", "#00FF00", "#FFFF00", "#FF1493", "#FFD700", "#00CED1", "#FF69B4"];
                return (
                  <motion.div
                    key={`sparkle-${index}`}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      top: `${15 + (index * 10)}%`,
                      left: `${10 + (index * 11)}%`,
                      backgroundColor: sparkleColors[index],
                      boxShadow: `0 0 8px ${sparkleColors[index]}`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180],
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.25,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </>
          )}
        </>
      )}
      
      {/* Grayscale filter for locked badges */}
      {!unlocked && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            filter: 'grayscale(1) opacity-0.5',
          }}
        />
      )}
    </motion.div>
  );
}
