import { Ambassador, AppData, Task, ensureSeedData } from "./storage";
import { addNotification, NotificationData, getNotifications } from "./notifications";

export function generateAmbassadorNotifications(): void {
  const data = ensureSeedData();
  const currentAmbassador = data.ambassadors.find(a => a.id === data.currentAmbassadorId);
  if (!currentAmbassador) return;

  const existingNotifications = getNotifications();
  const existingIds = new Set(existingNotifications.map(n => `${n.type}_${JSON.stringify(n.data)}`));

  // Badge unlock notifications
  currentAmbassador.badges.forEach(badge => {
    const notifId = `badge_unlock_${badge}`;
    if (!existingIds.has(notifId)) {
      addNotification({
        type: "badge_unlock",
        message: `🎉 You unlocked the ${badge}!`,
        data: { badgeName: badge }
      });
    }
  });

  // Points milestones (every 100 points)
  const milestonePoints = Math.floor(currentAmbassador.points / 100) * 100;
  if (milestonePoints > 0) {
    const notifId = `points_milestone_${milestonePoints}`;
    if (!existingIds.has(notifId)) {
      addNotification({
        type: "points_milestone",
        message: `🎯 Milestone achieved! You've reached ${milestonePoints} points!`,
        data: { points: milestonePoints }
      });
    }
  }

  // Task deadline warnings (within 24 hours)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  data.tasks.forEach(task => {
    if (!currentAmbassador.completedTaskIds.includes(task.id)) {
      const deadline = new Date(task.deadline);
      if (deadline <= tomorrow && deadline > now) {
        const notifId = `deadline_warning_${task.id}`;
        if (!existingIds.has(notifId)) {
          addNotification({
            type: "deadline_warning",
            message: `⏰ Task "${task.title}" is due soon!`,
            data: { taskTitle: task.title, deadline: task.deadline }
          });
        }
      }
    }
  });

  // Rank change (compare with stored previous rank)
  const previousRankKey = `previous_rank_${currentAmbassador.id}`;
  const previousRank = localStorage.getItem(previousRankKey);
  const currentRank = data.ambassadors
    .sort((a, b) => b.points - a.points)
    .findIndex(a => a.id === currentAmbassador.id) + 1;

  if (previousRank && previousRank !== currentRank.toString()) {
    const oldRank = parseInt(previousRank);
    const change = oldRank - currentRank;
    const direction = change > 0 ? "up" : "down";
    const notifId = `rank_change_${currentRank}_${Date.now()}`;
    
    addNotification({
      type: "rank_change",
      message: `📈 Your rank moved ${direction}! You're now #${currentRank}`,
      data: { oldRank, newRank: currentRank }
    });
  }
  
  localStorage.setItem(previousRankKey, currentRank.toString());
}

export function generateOrgNotifications(): void {
  const data = ensureSeedData();
  const existingNotifications = getNotifications();
  const existingIds = new Set(existingNotifications.map(n => `${n.type}_${JSON.stringify(n.data)}`));

  // New ambassador joined notifications
  data.ambassadors.forEach(ambassador => {
    const notifId = `new_ambassador_${ambassador.id}`;
    if (!existingIds.has(notifId)) {
      addNotification({
        type: "new_ambassador",
        message: `👋 ${ambassador.name} from ${ambassador.college} joined the program!`,
        data: { ambassadorName: ambassador.name, college: ambassador.college }
      });
    }
  });

  // Task completion alerts
  data.ambassadors.forEach(ambassador => {
    ambassador.completedTaskIds.forEach(taskId => {
      const task = data.tasks.find(t => t.id === taskId);
      if (task) {
        const notifId = `task_completion_${ambassador.id}_${taskId}`;
        if (!existingIds.has(notifId)) {
          addNotification({
            type: "task_completion",
            message: `✅ ${ambassador.name} completed "${task.title}"`,
            data: { ambassadorName: ambassador.name, taskTitle: task.title }
          });
        }
      }
    });
  });

  // At-risk ambassador alerts
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  
  data.ambassadors.forEach(ambassador => {
    const latestActivity = ambassador.activityDates.length
      ? [...ambassador.activityDates].sort((a, b) => b.localeCompare(a))[0]
      : ambassador.lastActiveDate;
    
    if (latestActivity) {
      const daysInactive = Math.floor((today.getTime() - new Date(`${latestActivity}T00:00:00`).getTime()) / dayMs);
      
      if (daysInactive >= 5) {
        const notifId = `at_risk_alert_${ambassador.id}`;
        if (!existingIds.has(notifId)) {
          addNotification({
            type: "at_risk_alert",
            message: `⚠️ ${ambassador.name} from ${ambassador.college} is at risk (${daysInactive} days inactive)`,
            data: { ambassadorName: ambassador.name, college: ambassador.college, daysInactive }
          });
        }
      }
    }
  });
}
