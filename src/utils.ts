import { UserProfile, WeekMilestone, Achievement } from "./types";

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  goal: "",
  category: "Career",
  targetDays: 30,
  dailyMinutes: 60,
  customDetails: "",
  isOnboarded: false,
  startDate: new Date().toISOString(),
  streak: 0,
  completedDatesCount: 0,
  tasksHistory: {},
  xp: 0,
  visionBoard: [],
};

export const LEVELS = [
  { level: 1, name: "Beginner", minXp: 0, maxXp: 100 },
  { level: 2, name: "Grinder", minXp: 100, maxXp: 300 },
  { level: 3, name: "Warrior", minXp: 300, maxXp: 600 },
  { level: 4, name: "Legend", minXp: 600, maxXp: 1000 },
  { level: 5, name: "Future Self", minXp: 1000, maxXp: Infinity },
];

export function getLevelInfo(xp: number = 0) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      const currentLevel = LEVELS[i];
      const nextLevel = LEVELS[i + 1] || null;
      const minVal = currentLevel.minXp;
      const maxVal = currentLevel.maxXp;
      const range = maxVal === Infinity ? 500 : maxVal - minVal;
      const currentProgressXp = xp - minVal;
      return {
        level: currentLevel.level,
        name: currentLevel.name,
        minXp: currentLevel.minXp,
        maxXp: currentLevel.maxXp,
        currentProgressXp,
        neededXpForNext: maxVal === Infinity ? 0 : maxVal - xp,
        percentage: maxVal === Infinity ? 100 : Math.min(100, Math.max(0, Math.round((currentProgressXp / range) * 100))),
      };
    }
  }
  return { level: 1, name: "Beginner", minXp: 0, maxXp: 100, currentProgressXp: xp, neededXpForNext: 100, percentage: 0 };
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "first_step",
    title: "First Step",
    description: "Take action to manifest your future success.",
    requirement: "Complete your first mission task.",
    iconName: "Compass",
  },
  {
    id: "streak_3",
    title: "Unstoppable Force",
    description: "Maintain consistency in building the routine.",
    requirement: "Achieve a 3-day active streak.",
    iconName: "Flame",
  },
  {
    id: "streak_7",
    title: "Elite Habit Builder",
    description: "Discipline is the bridge between goals and accomplishment.",
    requirement: "Achieve a 7-day active streak.",
    iconName: "Zap",
  },
  {
    id: "consistency_master",
    title: "Consistency Master",
    description: "Showing up is 80% of the battle, day in and day out.",
    requirement: "Complete 10 total tasks in your roadmap.",
    iconName: "ShieldCheck",
  },
  {
    id: "goal_crusher",
    title: "Goal Crusher",
    description: "Your future successful self smiles upon you, complete transformation.",
    requirement: "Fully reach 100% roadmap completion.",
    iconName: "Award",
  },
];

// Helper to determine if an achievement is unlocked based on state
export function checkAchievementUnlocked(
  id: string,
  profile: UserProfile,
  totalTasksCount: number,
  completedTasksCount: number
): boolean {
  switch (id) {
    case "first_step":
      return completedTasksCount >= 1;
    case "streak_3":
      return profile.streak >= 3;
    case "streak_7":
      return profile.streak >= 7;
    case "consistency_master":
      return completedTasksCount >= 10;
    case "goal_crusher":
      return totalTasksCount > 0 && completedTasksCount === totalTasksCount;
    default:
      return false;
  }
}

// Format days remaining
export function calculateDaysRemaining(startDateStr: string, targetDays: number): number {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = start.getTime() + targetDays * 24 * 60 * 60 * 1000 - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Get the date string in local YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

// Calculate streak updates
export function processStreakUpdate(profile: UserProfile, isTaskCompleted: boolean): UserProfile {
  const updated = { ...profile };
  const todayStr = getLocalDateString();

  // If a task is checked, update lastActiveDate and streak if necessary
  if (isTaskCompleted) {
    if (!updated.lastActiveDate) {
      updated.streak = 1;
      updated.lastActiveDate = todayStr;
      updated.completedDatesCount = 1;
    } else if (updated.lastActiveDate !== todayStr) {
      const lastActive = new Date(updated.lastActiveDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        // Active consecutive day
        updated.streak += 1;
      } else {
        // Streak broke
        updated.streak = 1;
      }
      updated.lastActiveDate = todayStr;
      updated.completedDatesCount += 1;
    }
  }

  return updated;
}
