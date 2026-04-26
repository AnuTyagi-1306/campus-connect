"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Award, TrendingUp, Clock, Target, Hand, CheckCircle2, AlertTriangle, Megaphone } from "lucide-react";
import { Notification, formatTimestamp, getNotifications, markAllAsRead, getUnreadCount } from "@/lib/notifications";

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifications = () => {
      const notifs = getNotifications();
      setNotifications(notifs);
      setUnreadCount(getUnreadCount());
    };

    updateNotifications();

    // Listen for storage changes
    const handleStorageChange = () => updateNotifications();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("campusconnect-storage-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("campusconnect-storage-updated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      markAllAsRead();
      setUnreadCount(0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "badge_unlock": return <Award size={18} className="text-[#10B981]" />;
      case "rank_change": return <TrendingUp size={18} className="text-[#3B82F6]" />;
      case "deadline_warning": return <Clock size={18} className="text-[#F59E0B]" />;
      case "points_milestone": return <Target size={18} className="text-[#3B82F6]" />;
      case "new_ambassador": return <Hand size={18} className="text-[#10B981]" />;
      case "task_completion": return <CheckCircle2 size={18} className="text-[#10B981]" />;
      case "at_risk_alert": return <AlertTriangle size={18} className="text-[#EF4444]" />;
      default: return <Megaphone size={18} className="text-[#64748B]" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-[#1E2433] bg-[#131720] p-2 text-[#64748B] transition hover:text-[#F1F5F9]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-[#3B82F6] text-xs font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 rounded-[16px] border border-[#1E2433] bg-[#0E1117] z-50"
          >
            <div className="border-b border-[#1E2433] p-4">
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Notifications</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-[#1E2433]">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 hover:bg-[#0E1117] transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#F1F5F9] break-words">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
