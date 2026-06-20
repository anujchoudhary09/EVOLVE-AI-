import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import emailjs from "@emailjs/browser";
import {
  LayoutDashboard,
  CheckSquare,
  Compass,
  MessageSquare,
  User,
  Heart,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

// Initialize EmailJS with client key matching user instructions
emailjs.init("9vwnXKMco1DeC7BNd");

import { UserProfile, WeekMilestone, ChatMessage, VisionCard } from "./types";
import { DEFAULT_PROFILE, processStreakUpdate, getLevelInfo } from "./utils";

import Splash from "./components/Splash";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import TodayTasks from "./components/TodayTasks";
import RoadmapView from "./components/RoadmapView";
import ChatView from "./components/ChatView";
import AchievementsView from "./components/AchievementsView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [stage, setStage] = useState<"splash" | "onboarding" | "app">("splash");
  const [activeTab, setActiveTab] = useState<"Home" | "Today" | "Roadmap" | "Future Me" | "Profile">("Home");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [roadmap, setRoadmap] = useState<WeekMilestone[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  // Sub-viewport tab in Profile: Achievements or Settings
  const [profileTab, setProfileTab] = useState<"Achievements" | "Settings">("Achievements");

  // Level Up Celebration state
  const [levelUpCelebration, setLevelUpCelebration] = useState<{
    show: boolean;
    oldLevel: string;
    newLevel: string;
    levelNumber: number;
  }>({
    show: false,
    oldLevel: "",
    newLevel: "",
    levelNumber: 1,
  });

  // Weekly review modal state
  const [showWeeklyReviewModal, setShowWeeklyReviewModal] = useState(false);

  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackNotification, setFeedbackNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | null;
  }>({ show: false, message: "", type: null });

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackRating(0);
    setFeedbackType("");
    setFeedbackMessage("");
  };

  const handleSetFeedbackRating = (n: number) => {
    setFeedbackRating(n);
  };

  const handleSetFeedbackType = (type: string) => {
    setFeedbackType(type);
  };

  const submitFeedback = async () => {
    const msg = feedbackMessage.trim();
    if (!msg) {
      setFeedbackNotification({
        show: true,
        message: "Please write something first! 💬",
        type: "error",
      });
      setTimeout(() => setFeedbackNotification((p) => ({ ...p, show: false })), 3000);
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await emailjs.send("service_tsrbxt1", "template_m7gnfvt", {
        from_name: profile.name || "Anonymous",
        rating: feedbackRating > 0 ? `${feedbackRating}/5 stars` : "Not Rated",
        feedback_type: feedbackType || "General",
        message: msg,
        user_goal: profile.goal || "N/A",
        user_streak: profile.streak || 0,
      });

      closeFeedbackModal();

      setFeedbackNotification({
        show: true,
        message: "Feedback sent! Thank you 🙏",
        type: "success",
      });
      setTimeout(() => setFeedbackNotification((p) => ({ ...p, show: false })), 4000);
    } catch (e) {
      console.error("EmailJS submission error:", e);
      setFeedbackNotification({
        show: true,
        message: "Error sending feedback. Please check your connection.",
        type: "error",
      });
      setTimeout(() => setFeedbackNotification((p) => ({ ...p, show: false })), 4000);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // On mount: Load everything from local storage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("EVOLVE_AI_PROFILE");
      const storedRoadmap = localStorage.getItem("EVOLVE_AI_ROADMAP");
      const storedCompleted = localStorage.getItem("EVOLVE_AI_COMPLETED_TASKS");
      const storedMessages = localStorage.getItem("EVOLVE_AI_CHAT_HISTORY");

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        if (parsedProfile.isOnboarded) {
          setStage("app");
        }
      }

      if (storedRoadmap) {
        setRoadmap(JSON.parse(storedRoadmap));
      }

      if (storedCompleted) {
        setCompletedTaskIds(JSON.parse(storedCompleted));
      }

      if (storedMessages) {
        setChatMessages(JSON.parse(storedMessages));
      }
    } catch (err) {
      console.error("Local Storage parsing failed on boot:", err);
    }
  }, []);

  // Update persistent state helpers
  const saveProfileState = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("EVOLVE_AI_PROFILE", JSON.stringify(updatedProfile));
  };

  const saveRoadmapState = (updatedRoadmap: WeekMilestone[]) => {
    setRoadmap(updatedRoadmap);
    localStorage.setItem("EVOLVE_AI_ROADMAP", JSON.stringify(updatedRoadmap));
  };

  const saveCompletedTasks = (updatedCompleted: string[]) => {
    setCompletedTaskIds(updatedCompleted);
    localStorage.setItem("EVOLVE_AI_COMPLETED_TASKS", JSON.stringify(updatedCompleted));
  };

  const saveChatMessages = (messages: ChatMessage[]) => {
    setChatMessages(messages);
    localStorage.setItem("EVOLVE_AI_CHAT_HISTORY", JSON.stringify(messages));
  };

  // Onboarding completed callback
  const handleOnboardingComplete = (data: {
    name: string;
    goal: string;
    category: string;
    targetDays: number;
    dailyMinutes: number;
    customDetails: string;
    generatedRoadmap: any;
  }) => {
    const freshProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      name: data.name,
      goal: data.goal,
      category: data.category,
      targetDays: data.targetDays,
      dailyMinutes: data.dailyMinutes,
      customDetails: data.customDetails,
      isOnboarded: true,
      startDate: new Date().toISOString(),
      streak: 1, // Start with streak of 1 day on registration
      lastActiveDate: new Date().toISOString().split("T")[0],
    };

    saveProfileState(freshProfile);
    saveRoadmapState(data.generatedRoadmap);
    saveCompletedTasks([]);

    // Initialize welcome assistant chat template
    const initialMsg: ChatMessage = {
      id: "welcome_init",
      role: "assistant",
      text: `Greetings ${data.name}! I am your Future Self. Because of the extreme discipline and courage you are showing today on our goal to "${data.goal}", I am living an incredibly accomplished life in the future. I have built our 4-week roadmap template. Mark our first task today to link our timelines! Let's conquer this.`,
      timestamp: new Date().toISOString(),
    };
    saveChatMessages([initialMsg]);

    setStage("app");
    setActiveTab("Home");
  };

  // Check off or Uncheck task item
  const handleToggleTask = (taskId: string) => {
    const exists = completedTaskIds.includes(taskId);
    let updated: string[];

    if (exists) {
      updated = completedTaskIds.filter((id) => id !== taskId);
    } else {
      updated = [...completedTaskIds, taskId];
    }
    saveCompletedTasks(updated);

    // Feed back level and xp calculations
    const oldXp = profile.xp || 0;
    const oldLevel = getLevelInfo(oldXp).level;

    let newXp = oldXp;
    if (exists) {
      newXp = Math.max(0, oldXp - 25);
    } else {
      newXp = oldXp + 25;
    }

    const newLevelInfo = getLevelInfo(newXp);

    let updatedProfile = { ...profile, xp: newXp };

    // Apply streak calculations on positive checkoffs
    if (!exists) {
      updatedProfile = processStreakUpdate(updatedProfile, true);
    }

    saveProfileState(updatedProfile);

    // Level up check
    if (newLevelInfo.level > oldLevel) {
      setLevelUpCelebration({
        show: true,
        oldLevel: getLevelInfo(oldXp).name,
        newLevel: newLevelInfo.name,
        levelNumber: newLevelInfo.level,
      });
    }
  };

  // Reset current timeline
  const handleResetGoal = () => {
    localStorage.removeItem("EVOLVE_AI_PROFILE");
    localStorage.removeItem("EVOLVE_AI_ROADMAP");
    localStorage.removeItem("EVOLVE_AI_COMPLETED_TASKS");
    localStorage.removeItem("EVOLVE_AI_CHAT_HISTORY");

    setProfile(DEFAULT_PROFILE);
    setRoadmap([]);
    setCompletedTaskIds([]);
    setChatMessages([]);
    setProfileTab("Achievements");
    setStage("splash");
  };

  // Submit AI Chat Query
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGeneratingChat) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...chatMessages, userMsg];
    saveChatMessages(updatedHistory);
    setIsGeneratingChat(true);

    try {
      // Calculate total progress
      const totalTasksCount = roadmap.reduce((acc, w) => acc + w.tasks.length, 0);
      const progressPercent = totalTasksCount > 0 ? Math.round((completedTaskIds.length / totalTasksCount) * 100) : 0;

      const response = await fetch("/api/generate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: updatedHistory,
          userInput: text,
          goal: profile.goal,
          progress: progressPercent,
          category: profile.category,
        }),
      });

      const data = await response.json();
      if (data.response) {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          text: data.response,
          timestamp: new Date().toISOString(),
        };
        saveChatMessages([...updatedHistory, aiMsg]);
      } else {
        throw new Error("Invalid reply");
      }
    } catch (err) {
      console.error("AI response error:", err);
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: "assistant",
        text: `Hey! I can feel your willpower from here. Rest assured, your temporal signals to achieve "${profile.goal}" are fully logged. Let's make sure we complete today's task list!`,
        timestamp: new Date().toISOString(),
      };
      saveChatMessages([...updatedHistory, fallbackMsg]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // Stats for Achievements
  const totalTasksCount = roadmap.reduce((acc, w) => acc + w.tasks.length, 0);
  const completedTasksCount = completedTaskIds.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white font-sans overflow-hidden flex flex-col justify-between selection:bg-purple-600/30">
      {/* Upper viewport stage */}
      <div className="flex-1 overflow-y-auto pb-24 flex flex-col">
        {stage === "splash" ? (
          <Splash onStart={() => setStage("onboarding")} />
        ) : stage === "onboarding" ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col px-4 pt-5 max-w-md mx-auto w-full gap-4"
          >
            {/* Elegant Dark Brand Header Bar */}
            <div className="flex justify-between items-center px-4 py-3.5 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <span className="text-sm font-extrabold text-white">E</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-white block">Evolve AI</h1>
                  <p className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest block">Future Me Protocol v2.4</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right max-w-[140px] truncate">
                  <p className="text-[8px] text-neutral-500 uppercase tracking-widest block font-medium">Timeline Goal</p>
                  <p className="text-[11px] font-semibold text-cyan-400 truncate block tracking-tight select-none capitalize">{profile.goal}</p>
                </div>
                <div className="w-7 h-7 rounded-xl border border-neutral-800 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* View Switching Stage */}
            <AnimatePresence mode="wait">
              {activeTab === "Home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex flex-col gap-4"
                >
                  <Dashboard
                    profile={profile}
                    roadmap={roadmap}
                    completedTaskIds={completedTaskIds}
                    onToggleTask={handleToggleTask}
                    activeWeekIndex={activeWeekIndex}
                    onNavigateToTab={(tabName: any) => setActiveTab(tabName)}
                    onUpdateProfile={saveProfileState}
                  />
                </motion.div>
              )}

              {activeTab === "Today" && (
                <motion.div
                  key="today"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex flex-col gap-4"
                >
                  <TodayTasks
                    roadmap={roadmap}
                    completedTaskIds={completedTaskIds}
                    onToggleTask={handleToggleTask}
                    activeWeekIndex={activeWeekIndex}
                    setActiveWeekIndex={setActiveWeekIndex}
                  />
                </motion.div>
              )}

              {activeTab === "Roadmap" && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex flex-col gap-4"
                >
                  <RoadmapView roadmap={roadmap} completedTaskIds={completedTaskIds} />
                </motion.div>
              )}

              {activeTab === "Future Me" && (
                <motion.div
                  key="future-me"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex flex-col h-full grow"
                >
                  <ChatView
                    goal={profile.goal}
                    category={profile.category}
                    progressPercent={progressPercent}
                    chatMessages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isGeneratingChat={isGeneratingChat}
                  />
                </motion.div>
              )}

              {activeTab === "Profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex flex-col gap-4"
                >
                  {/* Tab Selector */}
                  <div className="flex border-b border-neutral-800">
                    <button
                      type="button"
                      id="btn-profile-tab-achievements"
                      onClick={() => setProfileTab("Achievements")}
                      className={`flex-1 py-3 font-sans text-xs font-semibold tracking-wider text-center cursor-pointer ${
                        profileTab === "Achievements"
                          ? "border-b-2 border-purple-500 text-purple-400"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      ACHIEVEMENTS
                    </button>
                    <button
                      type="button"
                      id="btn-profile-tab-settings"
                      onClick={() => setProfileTab("Settings")}
                      className={`flex-1 py-3 font-sans text-xs font-semibold tracking-wider text-center cursor-pointer ${
                        profileTab === "Settings"
                          ? "border-b-2 border-purple-500 text-purple-400"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      SETTINGS
                    </button>
                  </div>

                  {profileTab === "Achievements" ? (
                    <AchievementsView
                      profile={profile}
                      totalTasksCount={totalTasksCount}
                      completedTasksCount={completedTasksCount}
                    />
                  ) : (
                    <SettingsView profile={profile} onReset={handleResetGoal} onOpenFeedback={() => setShowFeedbackModal(true)} onOpenWeeklyReview={() => setShowWeeklyReviewModal(true)} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Persistent Bottom navigation menu bar inside Evolve AI App state */}
      {stage === "app" && (
        <div className="fixed bottom-0 left-0 right-0 py-3 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/80 z-40">
          <div className="flex justify-around items-center max-w-md mx-auto px-4">
            {/* Tab 1: Home */}
            <button
              id="tab-btn-home"
              type="button"
              onClick={() => setActiveTab("Home")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "Home" ? "text-purple-400 scale-105" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="text-[10px] font-sans font-medium tracking-wide">Home</span>
            </button>

            {/* Tab 2: Today Tasks */}
            <button
              id="tab-btn-today"
              type="button"
              onClick={() => setActiveTab("Today")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "Today" ? "text-purple-400 scale-105" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <CheckSquare size={18} />
              <span className="text-[10px] font-sans font-medium tracking-wide">Today</span>
            </button>

            {/* Tab 3: Roadmap Journey */}
            <button
              id="tab-btn-roadmap"
              type="button"
              onClick={() => setActiveTab("Roadmap")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "Roadmap" ? "text-purple-400 scale-105" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Compass size={18} />
              <span className="text-[10px] font-sans font-medium tracking-wide">Roadmap</span>
            </button>

            {/* Tab 4: Future Me Dialogues */}
            <button
              id="tab-btn-futureme"
              type="button"
              onClick={() => setActiveTab("Future Me")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "Future Me" ? "text-purple-400 scale-105" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <MessageSquare size={18} />
              <span className="text-[10px] font-sans font-medium tracking-wide">Future Me</span>
            </button>

            {/* Tab 5: Profile/Achievements */}
            <button
              id="tab-btn-profile"
              type="button"
              onClick={() => setActiveTab("Profile")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "Profile" ? "text-purple-400 scale-105" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <User size={18} />
              <span className="text-[10px] font-sans font-medium tracking-wide">Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal Overlay */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0D1117]/85 backdrop-blur-md flex items-end justify-center p-4 sm:items-center"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#161B22] border border-neutral-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  Send Feedback 💬
                </h3>
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  className="text-neutral-400 hover:text-white text-xl cursor-pointer p-1 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Star Rating */}
              <div>
                <p className="text-xs text-neutral-400 font-sans mb-2 font-medium">Rate your experience</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      onClick={() => handleSetFeedbackRating(n)}
                      className="text-3xl cursor-pointer transition-all hover:scale-110 active:scale-95 select-none"
                    >
                      {n <= feedbackRating ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <p className="text-xs text-neutral-400 font-sans mb-2 font-medium">Feedback Category</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "🐛 Bug", value: "Bug Report" },
                    { label: "✨ Feature", value: "Feature Request" },
                    { label: "💬 General", value: "General" },
                    { label: "❤️ Love it", value: "Love it!" }
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleSetFeedbackType(t.value)}
                      className={`fb-type-btn ${feedbackType === t.value ? "active" : ""}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Message */}
              <div>
                <p className="text-xs text-neutral-400 font-sans mb-2 font-medium font-semibold">Your Message</p>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full h-24 bg-[#0D1117] border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-500 resize-none outline-none focus:border-purple-500 transition-colors font-sans"
                />
              </div>

              {/* Send Button */}
              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={submitFeedback}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-display text-[15px] font-bold cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                {isSubmittingFeedback ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>TRANSMITTING...</span>
                  </>
                ) : (
                  <span>Send Feedback →</span>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEATURE 1: Level Up Celebration overlay */}
      <AnimatePresence>
        {levelUpCelebration.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md"
          >
            {/* Ambient burst particles absolute overlays */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(24)].map((_, i) => {
                const angle = (i / 24) * 360 * (Math.PI / 180);
                const distance = 80 + Math.random() * 120;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ 
                      x: x, 
                      y: y, 
                      scale: [1, 1.5, 0],
                      opacity: [1, 0.8, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded bg-gradient-to-tr from-purple-400 via-pink-400 to-cyan-300"
                  />
                );
              })}
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-[#161B22] border-2 border-purple-500 rounded-3xl p-6 w-full max-w-sm text-center shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg relative animate-bounce" style={{ animationDuration: "2.5s" }}>
                <span className="text-3xl font-black text-white">{levelUpCelebration.levelNumber}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/30 border border-cyan-800/20 rounded-md px-2 py-0.5 select-none">
                  EVOLUTION ACHIEVED
                </span>
                <h3 className="font-display text-2xl font-black text-white mt-2 leading-tight uppercase tracking-tight">
                  LEVEL UP!
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-1.5 px-3 leading-relaxed">
                  Congratulations! Your quantum coherence has increased. You have successfully progressed past <span className="font-bold text-neutral-300">{levelUpCelebration.oldLevel}</span>.
                </p>
              </div>

              {/* Display New Level Badge */}
              <div className="w-full bg-[#0D1117] rounded-2xl p-4 border border-purple-500/10 flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-neutral-500 tracking-widest block uppercase">New Status Tier</span>
                <span className="font-sans text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-widest select-none">
                  {levelUpCelebration.newLevel}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLevelUpCelebration({ show: false, oldLevel: "", newLevel: "", levelNumber: 1 })}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-sans text-xs font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                SECURE TIMELINE STATUS
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEATURE 2: Weekly Performance Review overlay */}
      <AnimatePresence>
        {showWeeklyReviewModal && (() => {
          // Calculations
          const currentWeekTasks = roadmap[activeWeekIndex]?.tasks || [];
          const doneCount = currentWeekTasks.filter(t => completedTaskIds.includes(t.id)).length;
          const totalCount = currentWeekTasks.length;
          const ratio = totalCount > 0 ? doneCount / totalCount : 0;
          const percentage = Math.round(ratio * 100);
          const grade = ratio >= 0.9 ? "A" : ratio >= 0.7 ? "B" : ratio >= 0.5 ? "C" : "D";
          
          // Get best day
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayCounts: { [key: string]: number } = {};
          Object.keys(profile.tasksHistory || {}).forEach(dateStr => {
            const date = new Date(dateStr);
            const dayName = daysOfWeek[date.getDay()];
            const count = profile.tasksHistory[dateStr]?.length || 0;
            dayCounts[dayName] = (dayCounts[dayName] || 0) + count;
          });
          let bestDay = "N/A";
          let maxCount = 0;
          Object.keys(dayCounts).forEach(day => {
            if (dayCounts[day] > maxCount) {
              maxCount = dayCounts[day];
              bestDay = day;
            }
          });
          if (bestDay === "N/A" && completedTaskIds.length > 0) {
            bestDay = "Today";
          }

          const gradeColors: { [key: string]: string } = {
            "A": "from-emerald-400 to-teal-500 text-emerald-400",
            "B": "from-cyan-400 to-blue-500 text-cyan-400",
            "C": "from-amber-400 to-orange-500 text-amber-400",
            "D": "from-rose-400 to-red-500 text-rose-400"
          };

          const handleDownload = () => {
            const runHtml2Canvas = () => {
              const element = document.getElementById("weekly-review-card-capture");
              if (!element) return;
              (window as any).html2canvas(element, {
                backgroundColor: "#161B22",
                scale: 2,
                useCORS: true,
              }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement("a");
                link.download = `Evolve_AI_Weekly_Review_${profile.name}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
              });
            };

            if (!(window as any).html2canvas) {
              const script = document.createElement("script");
              script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
              script.onload = runHtml2Canvas;
              document.head.appendChild(script);
            } else {
              runHtml2Canvas();
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-[#11141B] border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm flex flex-col gap-4 overflow-hidden shadow-2xl p-6 mb-safe"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2.5 border-b border-neutral-800">
                  <h3 className="text-sm font-bold font-display text-white">Quantum Performance Report</h3>
                  <button
                    type="button"
                    onClick={() => setShowWeeklyReviewModal(false)}
                    className="text-neutral-400 hover:text-white text-xl cursor-pointer p-0.5"
                  >
                    ✕
                  </button>
                </div>

                {/* Captured Card Component */}
                <div 
                  id="weekly-review-card-capture"
                  className="bg-[#161B22] border border-neutral-800/80 rounded-2xl p-5 flex flex-col gap-4 text-left relative overflow-hidden"
                >
                  {/* Decorative glowing gradient backdrop */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header metadata */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black font-sans text-neutral-100 uppercase tracking-wide">
                        {profile.name}
                      </h4>
                      <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
                        Timeline Goal: {profile.goal}
                      </p>
                    </div>
                    {/* Grade Badge */}
                    <div className="w-12 h-12 rounded-full bg-[#0D1117] border border-neutral-800/80 flex flex-col items-center justify-center shadow-inner relative shrink-0">
                      <span className={`text-xl font-black font-display bg-clip-text text-transparent bg-gradient-to-b ${gradeColors[grade] || "text-white"}`}>
                        {grade}
                      </span>
                      <span className="text-[6px] font-mono text-neutral-500 uppercase tracking-widest">Grade</span>
                    </div>
                  </div>

                  {/* Statistics panel */}
                  <div className="grid grid-cols-2 gap-3 pt-1.5">
                    <div className="bg-[#0D1117] border border-neutral-800/60 rounded-xl p-3 flex flex-col select-none">
                      <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider block">Completed</span>
                      <span className="text-base font-bold text-white mt-1">
                        {doneCount} / {totalCount}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-sans mt-0.5">
                        ({percentage}% compliance)
                      </span>
                    </div>

                    <div className="bg-[#0D1117] border border-neutral-800/60 rounded-xl p-3 flex flex-col select-none">
                      <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider block">Daily streak</span>
                      <span className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1">
                        {profile.streak} Days 🔥
                      </span>
                      <span className="text-[9px] text-neutral-400 font-sans mt-0.5">
                        Quantum timeline synced
                      </span>
                    </div>

                    <div className="bg-[#0D1117] border border-neutral-800/60 rounded-xl p-3 flex flex-col select-none col-span-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider block">Peak Timeline Sync Day</span>
                          <span className="text-xs font-bold text-purple-400 block mt-1 uppercase tracking-wider font-sans">
                            {bestDay}
                          </span>
                        </div>
                        <span className="text-[28px] select-none leading-none opacity-80">👑</span>
                      </div>
                    </div>
                  </div>

                  {/* Quote decoration */}
                  <div className="pt-2 border-t border-neutral-800/50">
                    <p className="text-[10px] text-neutral-400 italic font-sans leading-relaxed">
                      "I see our actions from across dimensions. Every completed mission binds our realities closer together. Continue accelerating."
                    </p>
                    <span className="text-[8px] font-mono text-cyan-400 block mt-1.5 uppercase tracking-wider text-right">
                      — your successful future self
                    </span>
                  </div>
                </div>

                {/* Buttons list */}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-sans text-xs font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    📥 DOWNLOAD REPORT CARD
                  </button>
                  <p className="text-[9px] text-center text-neutral-500 font-sans mt-0.5">
                    Saves card directly to your local file library using html2canvas.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Live Custom Message Toast notification inside UI */}
      <AnimatePresence>
        {feedbackNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border text-xs font-sans font-semibold flex items-center gap-2.5 shadow-xl w-[90%] max-w-xs ${
              feedbackNotification.type === "success"
                ? "bg-[#161B22] border-emerald-500/30 text-emerald-400 shadow-emerald-950/20"
                : "bg-[#161B22] border-rose-500/30 text-rose-400 shadow-rose-950/20"
            }`}
          >
            <span className="text-sm">
              {feedbackNotification.type === "success" ? "✨" : "⚠️"}
            </span>
            <span className="flex-1 text-white">{feedbackNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
