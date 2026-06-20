import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code,
  GraduationCap,
  Video,
  Dumbbell,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Lightbulb,
} from "lucide-react";

interface OnboardingProps {
  onComplete: (onboardingData: {
    name: string;
    goal: string;
    category: string;
    targetDays: number;
    dailyMinutes: number;
    customDetails: string;
    generatedRoadmap: any;
  }) => void;
}

const CATEGORIES = [
  { id: "App Developer", label: "App Developer", icon: Code, color: "from-blue-500 to-indigo-600", desc: "Build applications & software" },
  { id: "Top Student", label: "Top Student", icon: GraduationCap, color: "from-amber-500 to-orange-600", desc: "Ace exams & master disciplines" },
  { id: "Content Creator", label: "Content Creator", icon: Video, color: "from-red-500 to-pink-600", desc: "Grow audience & scale media channels" },
  { id: "Fitness Beast", label: "Fitness Beast", icon: Dumbbell, color: "from-green-500 to-emerald-600", desc: "Sculpt physique & optimize strength" },
  { id: "Entrepreneur", label: "Entrepreneur", icon: Briefcase, color: "from-purple-500 to-fuchsia-600", desc: "Succeed in business & start ventures" },
  { id: "Custom", label: "Custom Goal", icon: Target, color: "from-cyan-500 to-teal-600", desc: "Define your own path" },
];

const DEADLINES = [
  { id: 30, label: "30 Days", desc: "Rapid high-intensity sprint" },
  { id: 60, label: "60 Days", desc: "Standard growth timeline" },
  { id: 90, label: "90 Days", desc: "Deep permanent transformation" },
  { id: 180, label: "6 Months", desc: "Ultimate career mastery" },
];

const TIME_ARR = [
  { id: 30, label: "30 Minutes", desc: "Micro-habits, consistent drill" },
  { id: 60, label: "1 Hour", desc: "Focused mastery, daily strides" },
  { id: 120, label: "2 Hours", desc: "Accelerated training, deep work" },
  { id: 240, label: "4+ Hours", desc: "Extreme dedication, rapid rise" },
];

const LOADING_STATUSES = [
  "Contacting your future successful self...",
  "Analyzing temporal trajectories & timelines...",
  "Sensing bio-motivation signals...",
  "Assembling dynamic 4-week milestoning...",
  "Synthesizing personal advice and task lists...",
  "Securing wormhole linkage for Future Chats...",
  "Finalizing quantum code synchronization...",
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  // Form states
  const [userName, setUserName] = useState("");
  const [category, setCategory] = useState("");
  const [goalName, setGoalName] = useState("");
  const [targetDays, setTargetDays] = useState(30);
  const [customDays, setCustomDays] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [customDetails, setCustomDetails] = useState("");
  const generationTriggeredRef = useRef(false);

  const [loadingText, setLoadingText] = useState(LOADING_STATUSES[0]);
  const [progressVal, setProgressVal] = useState(0);
  const [errorText, setErrorText] = useState("");

  // Cycle onboarding loading messages and progress
  useEffect(() => {
    if (step === 5) {
      let statusIndex = 0;
      const statusInterval = setInterval(() => {
        statusIndex = (statusIndex + 1) % LOADING_STATUSES.length;
        setLoadingText(LOADING_STATUSES[statusIndex]);
      }, 2000);

      const progressInterval = setInterval(() => {
        setProgressVal((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(statusInterval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 200);

      return () => {
        clearInterval(statusInterval);
        clearInterval(progressInterval);
      };
    }
  }, [step]);

  // Initiate AI Roadmap Generation
  useEffect(() => {
    if (step === 5 && progressVal >= 100 && !generationTriggeredRef.current) {
      generationTriggeredRef.current = true;
      triggerRoadmapGeneration();
    }
  }, [step, progressVal]);

  const triggerRoadmapGeneration = async () => {
    const finalDays = targetDays === -1 ? Number(customDays) || 30 : targetDays;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 6000);

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          goal: goalName || `Excel in ${category}`,
          targetDays: finalDays,
          dailyMinutes,
          category,
          customDetails,
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.weeks) {
        onComplete({
          name: userName || "Future Champion",
          goal: goalName || `Excel in ${category}`,
          category,
          targetDays: finalDays,
          dailyMinutes,
          customDetails,
          generatedRoadmap: data.weeks,
        });
      } else if (data.fallback) {
        // Handle server fallback
        onComplete({
          name: userName || "Future Champion",
          goal: goalName || `Excel in ${category}`,
          category,
          targetDays: finalDays,
          dailyMinutes,
          customDetails,
          generatedRoadmap: data.fallback.weeks,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("AI Generation error, falling back locally:", err);
      // Fallback local mock roadmap so UI is robust:
      const localFallback = [
        {
          weekNumber: 1,
          weekTitle: "Core Habits & Baseline",
          focus: "Laying the perfect foundation is crucial to unlock high growth.",
          milestoneTitle: "Establishing Rhythm",
          milestoneDescription: "Establish steady training and basic muscle memory for the goal.",
          tasks: [
            { id: "t1_w1", title: `Explore fundamental blueprints of ${goalName || category}`, estimatedTime: "30m", completed: false },
            { id: "t2_w1", title: "Configure your physical/digital workspace", estimatedTime: "30m", completed: false },
            { id: "t3_w1", title: "Practice initial drills and review mistakes", estimatedTime: "40m", completed: false },
          ],
        },
        {
          weekNumber: 2,
          weekTitle: "Advanced Application",
          focus: "Double down on real scenarios, creating systems and working on speed.",
          milestoneTitle: "First Successful Deliverable",
          milestoneDescription: "Assemble the core components of your task successfully.",
          tasks: [
            { id: "t1_w2", title: "Execute deeper research or high intensity training", estimatedTime: "1h", completed: false },
            { id: "t2_w2", title: "Draft a major component or outline of your milestone", estimatedTime: "45m", completed: false },
            { id: "t3_w2", title: "Eliminate errors, review logs with laser focus", estimatedTime: "1h", completed: false },
          ],
        },
        {
          weekNumber: 3,
          weekTitle: "Maximum Intensity Run",
          focus: "Perform mock drills, high-intensity workouts, or add complex submodels.",
          milestoneTitle: "Overcoming Major Wall",
          milestoneDescription: "Master the most difficult bottleneck on your roadmap.",
          tasks: [
            { id: "t1_w3", title: "Solve complex hurdles, simulate test environment", estimatedTime: "1h 15m", completed: false },
            { id: "t2_w3", title: "Clean layout, polish structure, optimize metrics", estimatedTime: "50m", completed: false },
            { id: "t3_w3", title: "Deploy beta project or hit extreme peak rate", estimatedTime: "1h 30m", completed: false },
          ],
        },
        {
          weekNumber: 4,
          weekTitle: "Polishing & Temporal Mastery",
          focus: "Final adjustments, reviews with Future Self, and preparing to win.",
          milestoneTitle: "Total Achievement Target",
          milestoneDescription: "Successful final review of original targets and completion check.",
          tasks: [
            { id: "t1_w4", title: "Run ultimate verification & full validation test", estimatedTime: "1h", completed: false },
            { id: "t2_w4", title: "Prepare presentation, showcase, or launch final assets", estimatedTime: "45m", completed: false },
            { id: "t3_w4", title: "Submit roadmap deliverables and synchronise futures", estimatedTime: "30m", completed: false },
          ],
        },
      ];
      onComplete({
        name: userName || "Future Champion",
        goal: goalName || `Excel in ${category}`,
        category,
        targetDays: finalDays,
        dailyMinutes,
        customDetails,
        generatedRoadmap: localFallback,
      });
    }
  };

  const handleNext = () => {
    if (step === 0 && !userName.trim()) {
      setErrorText("State your identifier to make quantum contact.");
      return;
    }
    setErrorText("");

    if (step === 1 && !category) {
      setErrorText("Please choose an evolution category.");
      return;
    }

    if (step === 2 && !goalName.trim()) {
      setErrorText("Speak your targeted focal event (your specific goal).");
      return;
    }

    if (step === 3 && targetDays === -1 && !customDays) {
      setErrorText("Input custom duration.");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorText("");
    setStep((prev) => Math.max(0, prev - 1));
  };

  // Render Category Select list
  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category);
  const CategoryIcon = selectedCategoryObj?.icon;

  return (
    <div className="flex flex-col items-center px-4 py-8 w-full min-h-screen bg-neutral-950 text-white font-sans overflow-y-auto">
      {/* Upper Progress Indicator Dots */}
      {step < 5 && (
        <div className="flex justify-center items-center gap-2 mb-8 z-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? "w-8 bg-purple-500" : "w-1.5 bg-neutral-800"
              }`}
            />
          ))}
        </div>
      )}

      {/* Main Form container with Motion */}
      <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative z-10 my-auto">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              id="step-0"
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-full text-purple-400">
                  <User size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">First, tell me your traveler name.</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Your future self needs to identify you precisely to synchronize progress logs correctly.
              </p>

              <div className="mt-4 relative">
                <input
                  id="input-username"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="w-full py-3 px-4 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:outline-none transition-all placeholder-neutral-600 text-center text-lg"
                />
              </div>

              {errorText && (
                <p id="error-step-0" className="text-xs text-rose-500 mt-2">
                  {errorText}
                </p>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              id="step-1"
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-2xl font-bold font-display text-center text-white">What do you want to become?</h2>
              <p className="text-xs text-neutral-400 text-center leading-relaxed">
                Choose a general discipline to specialize your quantum roadmap models.
              </p>

              <div id="category-options-list" className="grid grid-cols-1 gap-3 mt-4 max-h-[300px] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-3.5 p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-800 border-purple-500 shadow-md shadow-purple-900/10"
                          : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div className={`p-2 bg-gradient-to-tr ${cat.color} rounded-lg text-white`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{cat.label}</div>
                        <div className="text-xs text-neutral-400 truncate mt-0.5">{cat.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {errorText && (
                <p id="error-step-1" className="text-xs text-center text-rose-500 mt-2">
                  {errorText}
                </p>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              id="step-2"
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-2xl font-bold font-display text-center text-white">Specify your specific target.</h2>
              <p className="text-sm text-neutral-400 text-center leading-relaxed">
                What landmark success does your Future Self possess? State it clearly.
              </p>

              <div className="mt-4 flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-neutral-500">
                    {CategoryIcon ? <CategoryIcon size={18} /> : <Target size={18} />}
                  </div>
                  <input
                    id="input-goalname"
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder={
                      category === "App Developer"
                        ? "e.g. Learn Flutter & build 3 mobile apps"
                        : category === "Top Student"
                        ? "e.g. Master AP Calculus & score 95%"
                        : category === "Fitness Beast"
                        ? "e.g. Shred fat and reach 12% bodyfat"
                        : category === "Entrepreneur"
                        ? "e.g. Launch SaaS beta to 100 paid clients"
                        : "e.g. Learn UI layout & develop premium site"
                    }
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:outline-none transition-all placeholder-neutral-600 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-neutral-500 flex items-center gap-1.5">
                    <Lightbulb size={12} className="text-purple-400" />
                    ADDITIONAL CONTEXT (PAIN POINTS, CURRENT STATUS, ETC)
                  </label>
                  <textarea
                    id="input-custom-details"
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value)}
                    rows={3}
                    placeholder="e.g., I have zero programming background, but I have 2 weeks free time."
                    className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-purple-500 focus:outline-none transition-all placeholder-neutral-600 text-xs resize-none"
                  />
                </div>
              </div>

              {errorText && (
                <p id="error-step-2" className="text-xs text-center text-rose-500 mt-2">
                  {errorText}
                </p>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              id="step-3"
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-2xl font-bold font-display text-center text-white">Select target duration.</h2>
              <p className="text-xs text-neutral-400 text-center leading-relaxed">
                When do you wish to stand fully transformed, holding your results?
              </p>

              <div id="deadline-options-list" className="grid grid-cols-2 gap-3 mt-4">
                {DEADLINES.map((dl) => {
                  const isSelected = targetDays === dl.id;
                  return (
                    <button
                      key={dl.id}
                      type="button"
                      onClick={() => {
                        setTargetDays(dl.id);
                        setCustomDays("");
                      }}
                      className={`flex flex-col items-center p-3 text-center rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-800 border-purple-500 shadow-md shadow-purple-900/10"
                          : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <Calendar size={18} className="text-purple-400 mb-1.5" />
                      <div className="font-semibold text-sm text-neutral-100">{dl.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{dl.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Target Days option */}
              <div className="mt-2 text-center text-neutral-400 text-xs">
                <span>Or input specific amount of days: </span>
                <input
                  id="input-custom-days"
                  type="number"
                  value={customDays}
                  onChange={(e) => {
                    setTargetDays(-1);
                    setCustomDays(e.target.value);
                  }}
                  placeholder="30"
                  className="w-16 py-1 px-2 border border-neutral-800 bg-neutral-950 rounded text-center focus:outline-none focus:border-cyan-500 inline-block text-cyan-400 text-xs ml-1"
                />
              </div>

              {errorText && (
                <p id="error-step-3" className="text-xs text-center text-rose-500 mt-1">
                  {errorText}
                </p>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              id="step-4"
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 text-center"
            >
              <h2 className="text-2xl font-bold font-display text-white">Daily energy commitment?</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                How much daily dedicated time can you promise that we invest together?
              </p>

              <div id="time-options-list" className="grid grid-cols-2 gap-3 mt-4">
                {TIME_ARR.map((tm) => {
                  const isSelected = dailyMinutes === tm.id;
                  return (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={() => setDailyMinutes(tm.id)}
                      className={`flex flex-col items-center p-3 text-center rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-800 border-purple-500 shadow-md"
                          : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <Clock size={18} className="text-cyan-400 mb-1.5" />
                      <div className="font-semibold text-sm text-neutral-100">{tm.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{tm.desc}</div>
                    </button>
                  );
                })}
              </div>

              {errorText && (
                <p id="error-step-4" className="text-xs text-rose-500 mt-1">
                  {errorText}
                </p>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              id="step-5"
              key="step5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center gap-6 py-6"
            >
              <div className="relative">
                {/* Glowing Pulsing Aura for AI Generation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-full scale-125 blur-xl opacity-30 animate-pulse" />
                <div className="flex items-center justify-center w-24 h-24 bg-neutral-950 border border-purple-500/20 rounded-full z-10 relative">
                  <Sparkles size={40} className="text-purple-400 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">
                  Temporal Calculation Active
                </h3>
                <p id="loading-roadmaps-text" className="text-sm font-sans text-neutral-400 h-10 px-2 leading-relaxed">
                  {loadingText}
                </p>
              </div>

              {/* Progress bars */}
              <div className="w-full bg-neutral-950 border border-neutral-800/80 rounded-full h-3 overflow-hidden relative">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 h-full rounded-full"
                  style={{ width: `${progressVal}%` }}
                />
              </div>

              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                TIMELINE ALIGNMENT {progressVal}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back and Next buttons block */}
        {step < 5 && (
          <div className="flex justify-between items-center gap-4 mt-8 pt-4 border-t border-neutral-800">
            {step > 0 ? (
              <button
                id="btn-onboarding-back"
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 py-2 px-3 text-sm text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              id="btn-onboarding-next"
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 py-2 px-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl text-sm shadow hover:from-purple-500 hover:to-cyan-500 transition-all cursor-pointer"
            >
              <span>{step === 4 ? "GENERATE ROADMAP" : "Continue"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
