import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleDot,
  Circle,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { WeekMilestone, Task } from "../types";

interface RoadmapViewProps {
  roadmap: WeekMilestone[];
  completedTaskIds: string[];
}

export default function RoadmapView({ roadmap, completedTaskIds }: RoadmapViewProps) {
  const [expandedWeekNum, setExpandedWeekNum] = useState<number | null>(1);

  if (!roadmap || roadmap.length === 0) return null;

  const toggleExpand = (weekNum: number) => {
    setExpandedWeekNum(expandedWeekNum === weekNum ? null : weekNum);
  };

  return (
    <div id="roadmap-screen" className="flex flex-col gap-5 w-full">
      {/* Intro info card */}
      <div className="bg-gradient-to-tr from-purple-950/20 to-neutral-900 border border-neutral-800/80 p-5 rounded-2xl">
        <div className="flex gap-3 items-center">
          <div className="p-2.5 bg-purple-950/40 border border-purple-800/30 rounded-xl text-purple-400">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base font-display text-white">Quantum Evolutionary Line</h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-relaxed">
              Your chronological progress pathway formulated by your future successful self.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Journey Timeline Path */}
      <div className="relative pl-6 pb-6 flex flex-col gap-6">
        {/* Glow-Line Backdrop */}
        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500 rounded-full" />

        {roadmap.map((week, idx) => {
          const isExpanded = expandedWeekNum === week.weekNumber;
          const weekTasks = week.tasks.map((t) => t.id);
          const completedTasksInWeek = weekTasks.filter((id) => completedTaskIds.includes(id));
          const isCompleted = completedTasksInWeek.length === weekTasks.length && weekTasks.length > 0;
          const isStarted = completedTasksInWeek.length > 0;

          return (
            <div key={week.weekNumber} className="relative">
              {/* Path node indicator */}
              <div className="absolute -left-[20px] top-1.5 z-10">
                {isCompleted ? (
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className="flex items-center justify-center w-[22px] h-[22px] bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full text-white shadow-lg shadow-green-500/10"
                  >
                    <CircleCheck size={14} />
                  </motion.div>
                ) : isStarted ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center w-[22px] h-[22px] bg-gradient-to-tr from-purple-500 to-cyan-400 rounded-full text-white shadow-md shadow-purple-500/10"
                  >
                    <CircleDot size={14} />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center w-[22px] h-[22px] bg-neutral-900 border-2 border-neutral-700 rounded-full text-neutral-500">
                    <Circle size={10} />
                  </div>
                )}
              </div>

              {/* Main Week Expandable Card */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm hover:border-neutral-700 transition-all">
                {/* Header Section */}
                <button
                  type="button"
                  id={`btn-toggle-week-${week.weekNumber}`}
                  onClick={() => toggleExpand(week.weekNumber)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        WEEK {week.weekNumber}
                      </span>
                      {isCompleted ? (
                        <span className="px-2 py-0.5 text-[8px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 rounded font-mono uppercase tracking-widest">
                          Week Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[8px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded font-mono uppercase tracking-widest">
                          {completedTasksInWeek.length}/{weekTasks.length} Active
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm font-sans text-neutral-100 mt-1 truncate">
                      {week.weekTitle}
                    </h4>
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-neutral-500" />
                    ) : (
                      <ChevronDown size={16} className="text-neutral-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Details Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-neutral-800/50 bg-neutral-950/40"
                    >
                      <div className="p-4 flex flex-col gap-3">
                        {/* Focus description */}
                        <div>
                          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                            Primary Focus:
                          </div>
                          <p className="text-xs text-neutral-300 mt-1 leading-relaxed font-sans">{week.focus}</p>
                        </div>

                        {/* Weekly Milestone checkpoint card */}
                        <div className="bg-neutral-900 border border-neutral-800/40 p-3 rounded-xl flex gap-2">
                          <Award size={16} className="text-purple-400/80 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-neutral-200">{week.milestoneTitle}</div>
                            <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed font-sans">
                              {week.milestoneDescription}
                            </div>
                          </div>
                        </div>

                        {/* Task Progress details check list */}
                        <div className="space-y-1.5 mt-1.5">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                            Milestone Action Steps:
                          </span>
                          {week.tasks.map((task) => {
                            const isTaskDone = completedTaskIds.includes(task.id);
                            return (
                              <div
                                key={task.id}
                                className="flex items-center justify-between gap-3 p-2 bg-neutral-900/30 border border-neutral-800/40 rounded-lg text-xs"
                              >
                                <span className={isTaskDone ? "text-neutral-500 line-through" : "text-neutral-300"}>
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-500 shrink-0">
                                  <Clock size={9} />
                                  <span>{task.estimatedTime}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
