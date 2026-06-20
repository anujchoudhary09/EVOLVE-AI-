import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, Clock, Flame, PartyPopper, ChevronRight } from "lucide-react";
import { WeekMilestone, Task } from "../types";

interface TodayTasksProps {
  roadmap: WeekMilestone[];
  completedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  activeWeekIndex: number;
  setActiveWeekIndex: (index: number) => void;
}

export default function TodayTasks({
  roadmap,
  completedTaskIds,
  onToggleTask,
  activeWeekIndex,
  setActiveWeekIndex,
}: TodayTasksProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);

  if (!roadmap || roadmap.length === 0) return null;

  const currentWeek = roadmap[activeWeekIndex] || roadmap[0];

  const handleTaskCheck = (taskId: string, wasCompleted: boolean) => {
    onToggleTask(taskId);
    if (!wasCompleted) {
      // Trigger a mini celebration effect!
      const clickedTask = currentWeek.tasks.find((t) => t.id === taskId);
      if (clickedTask) {
        setLastCompletedTask(clickedTask.title);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2400);
      }
    }
  };

  return (
    <div id="today-tasks-screen" className="flex flex-col gap-5 w-full">
      {/* Week Selector Bar */}
      <div className="flex bg-neutral-900/80 p-1 rounded-xl border border-neutral-800/60 overflow-x-auto gap-1">
        {roadmap.map((week, idx) => {
          const isSelected = activeWeekIndex === idx;
          const weekTasks = week.tasks.map((t) => t.id);
          const completedCount = weekTasks.filter((id) => completedTaskIds.includes(id)).length;
          const isAllCompleted = completedCount === weekTasks.length && weekTasks.length > 0;

          return (
            <button
              key={week.weekNumber}
              id={`tab-week-${week.weekNumber}`}
              type="button"
              onClick={() => setActiveWeekIndex(idx)}
              className={`flex-1 min-w-[70px] py-2 text-center rounded-lg font-sans text-xs transition-all cursor-pointer ${
                isSelected
                  ? "bg-purple-600 text-white font-medium shadow-md shadow-purple-900/10"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <div>Wk {week.weekNumber}</div>
              <div className="text-[9px] mt-0.5 opacity-80">
                {isAllCompleted ? "✓ Done" : `${completedCount}/${weekTasks.length}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Week Title & Focus Statement */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-4">
        <h4 className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">
          Week {currentWeek.weekNumber}: {currentWeek.weekTitle}
        </h4>
        <p className="text-sm text-neutral-200 mt-1 font-sans">{currentWeek.focus}</p>

        {/* Weekly Milestone checkpoint indicator */}
        <div className="mt-3.5 pt-3.5 border-t border-neutral-800/60 flex items-start gap-2.5">
          <div className="p-1 px-2 text-[9px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded font-mono">
            MILESTONE
          </div>
          <div>
            <div className="text-xs font-bold font-sans text-neutral-100">{currentWeek.milestoneTitle}</div>
            <div className="text-xs text-neutral-400 mt-0.5 font-sans leading-relaxed">
              {currentWeek.milestoneDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Interactive Checkbox Cards */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={12} className="text-cyan-400" />
          Missions for Today ({currentWeek.tasks.length} available)
        </h3>

        <div className="flex flex-col gap-2.5">
          {currentWeek.tasks.map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-neutral-900/30 border-purple-900/20 opacity-85"
                    : "bg-neutral-900 border-neutral-800/80 shadow hover:border-neutral-700"
                }`}
              >
                {/* Trigger Button checkoff */}
                <button
                  type="button"
                  id={`btn-check-task-${task.id}`}
                  onClick={() => handleTaskCheck(task.id, isCompleted)}
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full border transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent text-white"
                      : "border-neutral-700 hover:border-purple-400 text-transparent"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-neutral-600" />}
                </button>

                {/* Task Details Info */}
                <div className="flex-1">
                  <span
                    className={`font-sans text-sm block ${
                      isCompleted ? "text-neutral-500 line-through decoration-neutral-800" : "text-neutral-100"
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-neutral-500">
                    <Clock size={10} className="text-cyan-600" />
                    <span>Est: {task.estimatedTime}</span>
                  </div>
                </div>

                {isCompleted && (
                  <div className="text-[10px] font-mono font-medium tracking-widest text-[#22C55E]/80 bg-[#22C55E]/5 border border-[#22C55E]/20 px-2 py-0.5 rounded-full">
                    Crushed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pop-up micro-celebration animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-purple-950 via-neutral-900 to-cyan-950 border border-purple-500/30 p-4 rounded-xl z-50 flex items-center gap-3 shadow-2xl"
          >
            <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white animate-bounce">
              <PartyPopper size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-sm font-sans text-white">Quantum Progress Locked!</h5>
              <p className="text-xs font-sans text-neutral-400 truncate">
                Finished: "{lastCompletedTask}"
              </p>
            </div>
            <div className="flex items-center text-xs font-mono text-cyan-400 gap-1 animate-pulse">
              <span>+Streak Sync</span>
              <Flame size={12} fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
