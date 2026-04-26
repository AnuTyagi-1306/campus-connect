"use client";

import { motion } from "framer-motion";

interface CircularAvatarProps {
  name: string;
  rank?: number;
  size?: number;
  className?: string;
}

export default function CircularAvatar({ name, rank, size = 48, className = "" }: CircularAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getRingStyle = () => {
    if (rank === 1) {
      return {
        background: "conic-gradient(from 0deg, #FFD700, #FFA500, #FFD700)",
        animation: "spin 3s linear infinite",
      };
    }
    if (rank === 2) {
      return {
        background: "linear-gradient(135deg, #C0C0C0, #808080)",
      };
    }
    if (rank === 3) {
      return {
        background: "linear-gradient(135deg, #CD7F32, #8B4513)",
      };
    }
    return {
      background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
    };
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Gradient ring */}
      <div
        className="absolute inset-0 rounded-full p-1"
        style={getRingStyle()}
      >
        <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
          <span 
            className="font-bold text-white"
            style={{ fontSize: `${size / 3}px` }}
          >
            {getInitials(name)}
          </span>
        </div>
      </div>

      {/* Rank badge for top 3 */}
      {rank && rank <= 3 && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#0A0A0F]"
          style={{
            backgroundColor: rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32",
          }}
        >
          {rank}
        </div>
      )}
    </div>
  );
}
