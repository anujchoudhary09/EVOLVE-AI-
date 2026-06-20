import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Sparkles,
  CalendarDays,
  Clock,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Volume2,
  Trash2,
  Plus,
} from "lucide-react";
import { UserProfile, WeekMilestone, Task, VisionCard } from "../types";
import { getLevelInfo } from "../utils";

interface DashboardProps {
  profile: UserProfile;
  roadmap: WeekMilestone[];
  completedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  activeWeekIndex: number;
  onNavigateToTab: (tabName: string) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
}

export default function Dashboard({
  profile,
  roadmap,
  completedTaskIds,
  onToggleTask,
  activeWeekIndex,
  onNavigateToTab,
  onUpdateProfile,
}: DashboardProps) {
  const [motivationText, setMotivationText] = useState("");
  const [isTypingMotivation, setIsTypingMotivation] = useState(false);
  const [typedMotivation, setTypedMotivation] = useState("");
  const [isFetchingMotivation, setIsFetchingMotivation] = useState(false);

  // Vision Board states
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newEmoji, setNewEmoji] = useState("🚀");
  const [newText, setNewText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pressTimerRef = useRef<{ [key: string]: any }>({});

  const visionBoard = profile.visionBoard || [];

  const handleAddVisionCard = () => {
    if (!newText.trim() || visionBoard.length >= 9) return;

    const newCard: VisionCard = {
      id: `vc_${Date.now()}`,
      emoji: newEmoji,
      text: newText.trim(),
    };

    const updatedProfile: UserProfile = {
      ...profile,
      visionBoard: [...visionBoard, newCard],
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }

    setNewText("");
    setIsAddingCard(false);
  };

  const handleDeleteVisionCard = (id: string) => {
    const updatedProfile: UserProfile = {
      ...profile,
      visionBoard: visionBoard.filter((card) => card.id !== id),
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
  };

  const startPress = (id: string) => {
    if (pressTimerRef.current[id]) {
      clearTimeout(pressTimerRef.current[id]);
    }
    setDeletingId(id);
    pressTimerRef.current[id] = setTimeout(() => {
      handleDeleteVisionCard(id);
      setDeletingId(null);
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(60);
      }
      delete pressTimerRef.current[id];
    }, 700);
  };

  const stopPress = (id: string) => {
    setDeletingId(null);
    if (pressTimerRef.current[id]) {
      clearTimeout(pressTimerRef.current[id]);
      delete pressTimerRef.current[id];
    }
  };

  // Compute stats
  const totalTasks = roadmap.reduce((acc, week) => acc + week.tasks.length, 0);
  const completedTasksCount = completedTaskIds.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Days remaining calculation
  const start = new Date(profile.startDate);
  const today = new Date();
  const diffTime = start.getTime() + profile.targetDays * 24 * 60 * 60 * 1000 - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Current active week tasks
  const currentWeek = roadmap[activeWeekIndex] || roadmap[0];

  // Fetch motivation from AI on first load
  useEffect(() => {
    fetchMotivationalMessage();
  }, [profile.goal]);

  // Typing effect when motivationText updates
  useEffect(() => {
    if (!motivationText) return;

    setIsTypingMotivation(true);
    setTypedMotivation("");
    let index = 0;
    const interval = setInterval(() => {
      setTypedMotivation((prev) => prev + motivationText.charAt(index));
      index++;
      if (index >= motivationText.length) {
        clearInterval(interval);
        setIsTypingMotivation(false);
      }
    }, 20); // 20ms per character typing

    return () => clearInterval(interval);
  }, [motivationText]);

  const fetchMotivationalMessage = async () => {
    setIsFetchingMotivation(true);
    try {
      const response = await fetch("/api/generate-motivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: profile.goal,
          progress: progressPercent,
          category: profile.category,
        }),
      });
      const data = await response.json();
      if (data.message) {
        setMotivationText(data.message);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Failed to generate AI motivation quote:", err);
      // Fallback
      setMotivationText(
        `I am looking back at these moments, so proud of the work you're invested in right now. ${progressPercent}% of the pathway is manifested. Feel my presence in every stride you take today.`
      );
    } finally {
      setIsFetchingMotivation(false);
    }
  };

  // SVGs Circular progress calculations
  const radius = 55;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div id="dashboard-screen" className="flex flex-col gap-5 w-full">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-sans text-neutral-100 flex items-center gap-1">
            Good Evening, <span id="dashboard-name" className="text-purple-400 capitalize">{profile.name}</span>
          </h2>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded px-2 py-0.5 uppercase tracking-widest leading-none">
            {profile.category} Mode
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-400 font-sans">
          <span className="truncate max-w-[240px]">
            Target: <span className="font-semibold text-neutral-200">{profile.goal}</span>
          </span>
          <span id="days-remaining" className="shrink-0 flex items-center gap-1 text-purple-400 font-medium">
            <CalendarDays size={12} />
            {daysRemaining} Days Remain
          </span>
        </div>
      </div>

      {/* Hero Circular Progress ring card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#161B22] to-neutral-900 border border-neutral-800/85 p-5 shadow-lg flex items-center gap-5 justify-between">
        {/* Glow behind the ring */}
        <div className="absolute -left-10 h-32 w-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex-1">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
            Evolution State
          </span>
          <h3 className="text-lg font-bold text-neutral-100 font-display mt-0.5 leading-snug">
            {progressPercent === 100
              ? "Ultimate manifest achieved"
              : progressPercent >= 75
              ? "Sensing gravity of goal"
              : progressPercent >= 40
              ? "Momentum locked"
              : "Establishing timeline baseline"}
          </h3>

          <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-neutral-800/40">
            {/* Streak count */}
            <div>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">
                Current Streak
              </span>
              <span id="streak-counter" className="text-sm font-bold text-white flex items-center gap-1 font-sans mt-0.5">
                {profile.streak} Days
                <Flame size={13} fill="#d946ef" className="text-purple-500 animate-pulse" />
              </span>
            </div>
            {/* Completed tasks stats */}
            <div>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">
                Task Sync
              </span>
              <span className="text-sm font-bold text-neutral-200 block font-sans mt-0.5">
                {completedTasksCount} / {totalTasks} Complete
              </span>
            </div>
          </div>
        </div>

        {/* Circular Progress Ring visualization */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="relative z-10 rotate-[-90deg]">
            {/* Background tracking track circle */}
            <circle
              stroke="#21262D"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Foreground progression line */}
            <motion.circle
              stroke="url(#purple_cyan_gradient)"
              fill="transparent"
              strokeWidth={stroke + 1}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="purple_cyan_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span id="progress-percentage" className="text-xl font-bold font-display text-white">
              {progressPercent}%
            </span>
            <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">
              Sync
            </span>
          </div>
        </div>
      </div>

      {/* Animated XP & Level System Card */}
      {(() => {
        const xp = profile.xp || 0;
        const info = getLevelInfo(xp);
        return (
          <div className="bg-[#161B22]/80 border border-neutral-800 rounded-2xl p-4.5 flex flex-col gap-3 relative overflow-hidden shadow-lg mt-0.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-display text-sm font-black text-white shadow-md shadow-indigo-950/20">
                  {info.level}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-100 uppercase tracking-widest font-sans">
                    {info.name}
                  </h4>
                  <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                    Level {info.level} • {xp} Total XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded px-2 py-0.5 select-none uppercase tracking-wider">
                  {info.neededXpForNext > 0 ? `${info.neededXpForNext} XP to evolution` : "Max Level Master"}
                </span>
              </div>
            </div>

            {/* Custom high-contrast animated level-bar */}
            <div className="relative w-full h-3 bg-[#0D1117] rounded-full overflow-hidden border border-neutral-800/70 p-[1.5px] z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${info.percentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              />
            </div>
          </div>
        );
      })()}

      {/* Future Message Card: Emotional Center */}
      <div className="bg-gradient-to-tr from-[#161B22] to-indigo-950/20 border border-purple-500/15 rounded-2xl p-5 shadow relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -bottom-10 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Message author heading */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-800/40">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-purple-500/25 rounded-full scale-110 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-display text-xs text-white font-bold relative">
                FM
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-100 font-sans block">Future You</span>
              <span className="text-[9px] font-mono text-neutral-500 tracking-wider block">
                TIMELINE ORIGIN: SUCCESSFUL REALITY
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchMotivationalMessage}
            disabled={isFetchingMotivation}
            className="flex items-center gap-1 px-3 py-1 bg-purple-950/40 border border-purple-800/40 text-purple-400 hover:text-purple-300 text-[10px] font-mono font-semibold tracking-wide rounded-full transition-all cursor-pointer"
            title="Refresh Motivation from Future Self"
          >
            <Sparkles size={11} className={isFetchingMotivation ? "animate-spin" : ""} />
            <span>SYNC ADVICE</span>
          </button>
        </div>

        {/* Message quote content with typewriter effect */}
        <div className="pt-4 px-1 min-h-[64px]">
          {isFetchingMotivation ? (
            <div className="flex flex-col gap-2 animate-pulse">
              <div className="h-3 bg-neutral-800 rounded w-full" />
              <div className="h-3 bg-neutral-800 rounded w-4/6" />
            </div>
          ) : (
            <p className="text-xs text-neutral-200 font-sans italic leading-relaxed text-left transition-all">
              "{typedMotivation || motivationText}"
              {isTypingMotivation && <span className="typewriter-cursor inline-block w-1.5 h-3.5 ml-1 select-none" />}
            </p>
          )}
        </div>

        {/* Small badge advice footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-neutral-500">
            <MessageSquare size={10} />
            <span>Encouragement Model v3.5</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab("Future Me")}
            className="text-[10px] font-mono font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-0.5"
          >
            <span>Talk to Future Self</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Quick Today's Mission preview */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle size={12} className="text-purple-400" />
            Active Missions Preview (Week {currentWeek.weekNumber})
          </h3>
          <button
            type="button"
            onClick={() => onNavigateToTab("Today")}
            className="text-[10px] font-mono font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            Full List →
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {currentWeek.tasks.map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-neutral-900/30 border-purple-900/15 opacity-80"
                    : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      isCompleted
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent text-white"
                        : "border-neutral-700 hover:border-purple-400"
                    }`}
                  >
                    {isCompleted && <span className="text-[10px]">✓</span>}
                  </button>
                  <span
                    className={`font-sans text-xs ${
                      isCompleted ? "text-neutral-500 line-through" : "text-neutral-200"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500 shrink-0">
                  <Clock size={10} />
                  <span>{task.estimatedTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 3 — Vision Board */}
      <div className="flex flex-col gap-3 mt-1.5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 matches-title">
              <Sparkles size={12} className="text-cyan-400" />
              Vision Manifestation Board
            </h3>
            <p className="text-[10px] text-neutral-500 font-sans mt-0.5">
              Hold a card to delete or disintegrate it
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold text-neutral-500">
            {visionBoard.length} / 9 Loaded
          </span>
        </div>

        {/* Vision board 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3">
          {visionBoard.map((card) => {
            const isDeleting = deletingId === card.id;
            return (
              <motion.div
                key={card.id}
                onMouseDown={() => startPress(card.id)}
                onMouseUp={() => stopPress(card.id)}
                onMouseLeave={() => stopPress(card.id)}
                onTouchStart={() => startPress(card.id)}
                onTouchEnd={() => stopPress(card.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`aspect-square relative rounded-xl p-[1.5px] cursor-pointer select-none transition-all duration-300 ${
                  isDeleting 
                    ? "bg-gradient-to-r from-red-500 to-rose-600 scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                    : "bg-gradient-to-tr from-purple-500/40 via-purple-700/20 to-cyan-400/40 hover:from-purple-500 hover:to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                }`}
              >
                <div className="w-full h-full bg-[#11141B] rounded-[11px] p-2 flex flex-col items-center justify-center text-center gap-1.5 overflow-hidden">
                  <span className={`text-2xl ${isDeleting ? "animate-bounce" : ""}`}>{card.emoji}</span>
                  <span className="text-[9px] font-sans font-medium text-neutral-300 leading-normal line-clamp-3 px-0.5">
                    {card.text}
                  </span>
                  {isDeleting && (
                    <div className="absolute inset-0 bg-red-950/25 rounded-[11px] flex items-center justify-center backdrop-blur-[1px]">
                      <span className="text-[8px] font-mono font-bold text-red-400 uppercase tracking-widest animate-pulse">
                        BURNING...
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Dotted empty slot card for manifesting */}
          {visionBoard.length < 9 && !isAddingCard && (
            <motion.div
              onClick={() => setIsAddingCard(true)}
              whileHover={{ scale: 1.03 }}
              className="aspect-square border border-dashed border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/10 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-1.5 text-neutral-500 hover:text-neutral-300 bg-neutral-900/10 p-2"
            >
              <Plus size={16} className="text-neutral-500" />
              <span className="text-[9px] font-mono tracking-wider uppercase text-neutral-400 font-bold">manifest</span>
            </motion.div>
          )}
        </div>

        {/* Inline form to manifest new vision card */}
        <AnimatePresence>
          {isAddingCard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#161B22] border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-3 mt-2 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
                <span className="text-xs font-bold text-neutral-100 font-sans flex items-center gap-1.5">
                  ✨ Build Manifestation Card
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="text-neutral-400 hover:text-white text-xs font-mono font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Emoji quick select tray */}
              <div>
                <p className="text-[10px] text-neutral-400 mb-1.5 font-sans">1. Choose Symbol</p>
                <div className="flex gap-2 flex-wrap pb-1">
                  {["🏆", "💻", "💼", "🏃", "🧘", "📚", "✈️", "💪", "🔥", "🚀", "👑"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewEmoji(emoji)}
                      className={`text-lg p-1.5 rounded-lg border transition-all cursor-pointer ${
                        newEmoji === emoji ? "bg-purple-950 border-purple-500 scale-110 text-white" : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text goal */}
              <div>
                <p className="text-[10px] text-neutral-400 mb-1.5 font-sans font-semibold">2. Enter Goal Text</p>
                <input
                  type="text"
                  maxLength={36}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. 7-Figure Tech Lead, Muscle Gain..."
                  className="w-full bg-[#0D1117] border border-neutral-800 rounded-lg py-2.5 px-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 font-sans"
                />
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleAddVisionCard}
                className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-sans text-xs font-bold hover:brightness-110 scale-100 active:scale-95 transition-all cursor-pointer"
              >
                Add to Vision Board (Slot {visionBoard.length + 1}/9)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
