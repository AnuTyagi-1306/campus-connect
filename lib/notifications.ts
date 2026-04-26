export type NotificationType = 
  | "badge_unlock"
  | "rank_change"
  | "deadline_warning"
  | "points_milestone"
  | "new_ambassador"
  | "task_completion"
  | "at_risk_alert";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export interface NotificationData {
  badgeName?: string;
  oldRank?: number;
  newRank?: number;
  taskTitle?: string;
  points?: number;
  ambassadorName?: string;
  college?: string;
  daysInactive?: number;
  deadline?: string;
}

export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  } catch {
    // Silent fail for localStorage issues
  }
}

export function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): void {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: generateNotificationId(),
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  saveNotifications(notifications);
}

export function markAllAsRead(): void {
  const notifications = getNotifications();
  notifications.forEach(notif => notif.read = true);
  saveNotifications(notifications);
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}
