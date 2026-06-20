export interface Task {
  id: string;
  title: string;
  estimatedTime: string;
  completed: boolean;
}

export interface WeekMilestone {
  weekNumber: number;
  weekTitle: string;
  focus: string;
  milestoneTitle: string;
  milestoneDescription: string;
  tasks: Task[];
}

export interface VisionCard {
  id: string;
  emoji: string;
  text: string;
}

export interface UserProfile {
  name: string;
  goal: string;
  category: string;
  targetDays: number;
  dailyMinutes: number;
  customDetails?: string;
  isOnboarded: boolean;
  startDate: string; // ISO string
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  completedDatesCount: number; // For consistency
  tasksHistory: { [dateStr: string]: string[] }; // date string YYYY-MM-DD -> list of completed task IDs
  xp?: number;
  visionBoard?: VisionCard[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: string;
  iconName: string;
}
