import React from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { Achievement, UserProfile } from "../types";
import { ACHIEVEMENTS_LIST, checkAchievementUnlocked } from "../utils";

interface AchievementsViewProps {
  profile: UserProfile;
  totalTasksCount: number;
  completedTasksCount: number;
}

export default function AchievementsView({
  profile,
  totalTasksCount,
  completedTasksCount,
}: AchievementsViewProps) {
  return (
    <div id="achievements-screen" className="flex flex-col gap-5 w-full">
      {/* Overview stats badge banner */}
      <div className="bg-neutral-900 border border-neutral-800/80 p-5 rounded-2xl flex items-center justify-around gap-4 text-center">
        <div>
          <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider">
            TOTAL CRUSHED
          </span>
          <span className="text-xl font-bold font-display text-white mt-1 block">
            {completedTasksCount} Tasks
          </span>
        </div>
        <div className="w-px h-8 bg-neutral-800" />
        <div>
          <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider">
            CURRENT STREAK
          </span>
          <span className="text-xl font-bold font-display text-purple-400 mt-1 block flex items-center justify-center gap-1">
            {profile.streak} <Icons.Flame size={16} fill="currentColor" className="text-purple-400 inline" />
          </span>
        </div>
        <div className="w-px h-8 bg-neutral-800" />
        <div>
          <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider">
            TROPHIES LOCKED
          </span>
          <span className="text-xl font-bold font-display text-neutral-400 mt-1 block">
            {
              ACHIEVEMENTS_LIST.filter(
                (ac) => !checkAchievementUnlocked(ac.id, profile, totalTasksCount, completedTasksCount)
              ).length
            }
          </span>
        </div>
      </div>

      {/* Collectible Achievement Card Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-mono font-bold text-neutral-500 uppercase tracking-wider">
          Collectible Quantum Trophies
        </h3>

        <div className="grid grid-cols-1 gap-3.5 mt-1.5">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = checkAchievementUnlocked(ach.id, profile, totalTasksCount, completedTasksCount);

            // Dynamically load the icon component
            const IconComponent = (Icons as any)[ach.iconName] || Icons.Award;

            return (
              <div
                key={ach.id}
                className={`relative rounded-2xl border p-4.5 overflow-hidden transition-all duration-500 flex gap-4 ${
                  isUnlocked
                    ? "bg-gradient-to-tr from-neutral-900 via-neutral-900/90 to-purple-950/20 border-purple-500/25 shadow-lg shadow-purple-500/5 hover:-translate-y-0.5"
                    : "bg-neutral-900/40 border-neutral-800/60"
                }`}
              >
                {/* Visual Lock/Unlock Background Glows */}
                {isUnlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Trophy Illustration Icon Block */}
                <div className="shrink-0 relative">
                  <div
                    className={`w-13 h-13 rounded-xl flex items-center justify-center shadow ${
                      isUnlocked
                        ? "bg-gradient-to-tr from-purple-600 to-cyan-500 text-white"
                        : "bg-neutral-800 text-neutral-600 grayscale blur-[0.5px]"
                    }`}
                  >
                    {isUnlocked ? (
                      <IconComponent size={24} className="animate-pulse" style={{ animationDuration: "4s" }} />
                    ) : (
                      <Icons.Lock size={20} className="text-neutral-500/60" />
                    )}
                  </div>

                  {isUnlocked && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-neutral-950 rounded-full flex items-center justify-center text-white scale-80">
                      <Icons.Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Trophy details panel */}
                <div className={`flex-1 min-w-0 ${isUnlocked ? "" : "grayscale"}`}>
                  <div className="flex items-center gap-2 justify-between">
                    <h4 className="font-bold text-sm text-neutral-100 font-sans tracking-tight">
                      {ach.title}
                    </h4>
                    {!isUnlocked && (
                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-200 mt-1 leading-relaxed font-sans font-light">
                    {ach.description}
                  </p>

                  <div className="mt-2.5 pt-2.5 border-t border-neutral-800/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500 uppercase tracking-wider">REQUIREMENT:</span>
                    <span className={isUnlocked ? "text-cyan-400" : "text-neutral-500"}>
                      {ach.requirement}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
