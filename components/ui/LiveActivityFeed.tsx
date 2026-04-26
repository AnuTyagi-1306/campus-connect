"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ambassador, AppData, ensureSeedData } from "@/lib/storage";
import { X, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  ambassador: Ambassador;
  action: string;
  points: number;
  timestamp: Date;
}

const sampleActions = [
  "completed LinkedIn Promo",
  "submitted proof for Instagram Story",
  "finished Campus Outreach",
  "uploaded event photos",
  "completed daily check-in",
  "shared campaign post",
  "finished weekly report",
  "submitted task proof",
];

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const data = ensureSeedData();
    const activeAmbassadors = data.ambassadors.filter(a => a.completedTaskIds.length > 0);
    
    // Generate initial activities
    const initialActivities: ActivityItem[] = activeAmbassadors.slice(0, 5).map((ambassador, index) => ({
      id: `activity-${index}`,
      ambassador,
      action: sampleActions[Math.floor(Math.random() * sampleActions.length)],
      points: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Within last hour
    }));
    
    setActivities(initialActivities);

    // Rotate activities every 3 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % initialActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    return "1h ago";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Widget */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 right-6 w-80 bg-black/20 backdrop-blur-md rounded-2xl border border-[#1F2937] shadow-2xl z-50 p-4"
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <motion.div
                    className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <h3 className="text-sm font-semibold text-white font-bebas" style={{ letterSpacing: "0.02em" }}>
                  LIVE ACTIVITY
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Activity Feed */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activities.map((activity, index) => (
                  <motion.div
                    key={`${activity.id}-${index}`}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ 
                      opacity: index === currentIndex ? 1 : 0.3,
                      y: index === currentIndex ? 0 : -10,
                      scale: index === currentIndex ? 1 : 0.95,
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      index === currentIndex ? "bg-white/10" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(activity.ambassador.name)}
                      </div>
                      {index === currentIndex && (
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black/20"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        <span className="font-semibold">{activity.ambassador.name}</span>{" "}
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.2)]">
                          +{activity.points} pts
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                {activities.length} ambassadors active now
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-full shadow-lg flex items-center justify-center text-white z-50"
        >
          <Activity size={20} />
        </motion.button>
      )}
    </>
  );
}
