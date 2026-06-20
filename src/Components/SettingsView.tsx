import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Moon,
  Bell,
  Download,
  RotateCcw,
  ShieldAlert,
  Save,
  Check,
  Award,
} from "lucide-react";
import { UserProfile } from "../types";

interface SettingsViewProps {
  profile: UserProfile;
  onReset: () => void;
  onOpenFeedback: () => void;
  onOpenWeeklyReview: () => void;
}

export default function SettingsView({ profile, onReset, onOpenFeedback, onOpenWeeklyReview }: SettingsViewProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isExported, setIsExported] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(profile, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `Evolve_AI_Timeline_${profile.name.replace(/\s+/g, "_")}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setIsExported(true);
      setTimeout(() => setIsExported(false), 2000);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div id="settings-screen" className="flex flex-col gap-5 w-full">
      {/* Upper header */}
      <div className="bg-neutral-900 border border-neutral-800/80 p-5 rounded-2xl">
        <div className="flex gap-3 items-center">
          <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-cyan-400">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base font-display text-white">System Preference Control</h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-relaxed">
              Configure quantum synchronizations, export timeline profiles, or reset goals.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings menu options list */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl divide-y divide-neutral-800/50">
        {/* Toggle Dark Mode */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="text-neutral-400" size={18} />
            <div>
              <span className="text-sm font-semibold text-neutral-100 font-sans block">Futuristic Dark Mode</span>
              <span className="text-xs text-neutral-500 font-sans mt-0.5 block">
                Force eye-safe deep slate background by default
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-6 rounded-full transition-all duration-300 relative p-0.5 cursor-pointer flex items-center ${
              darkMode ? "bg-purple-600" : "bg-neutral-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${
                darkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle Notifications */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-neutral-400" size={18} />
            <div>
              <span className="text-sm font-semibold text-neutral-100 font-sans block">Quantum Reminders</span>
              <span className="text-xs text-neutral-500 font-sans mt-0.5 block">
                Receive messages from your future self when lazy
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full transition-all duration-300 relative p-0.5 cursor-pointer flex items-center ${
              notifications ? "bg-purple-600" : "bg-neutral-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${
                notifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Export Progress data */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="text-neutral-400" size={18} />
            <div>
              <span className="text-sm font-semibold text-neutral-100 font-sans block">Backup Spatial Timeline</span>
              <span className="text-xs text-neutral-500 font-sans mt-0.5 block">
                Export all tasks and histories to a JSON file
              </span>
            </div>
          </div>
          <button
            type="button"
            id="btn-export-progress"
            onClick={handleExport}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
              isExported
                ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400"
                : "bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            {isExported ? (
              <>
                <Check size={12} />
                <span>SAVED</span>
              </>
            ) : (
              <>
                <Save size={12} />
                <span>EXPORT</span>
              </>
            )}
          </button>
        </div>

        {/* Weekly Performance Review item */}
        <div 
          onClick={onOpenWeeklyReview}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-800/30 transition-all border-t border-neutral-800/50"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <div>
              <span className="text-sm font-semibold text-neutral-100 font-sans block">Weekly Performance Review</span>
              <span className="text-xs text-neutral-500 font-sans mt-0.5 block">
                Generate and download your weekly accomplishment card
              </span>
            </div>
          </div>
          <span className="text-cyan-400 text-lg font-bold pr-1 select-none font-sans">›</span>
        </div>

        {/* Send Feedback item */}
        <div 
          onClick={onOpenFeedback}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-800/30 transition-all border-t border-neutral-800/50 rounded-b-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <div>
              <span className="text-sm font-semibold text-neutral-100 font-sans block">Send Feedback</span>
              <span className="text-xs text-neutral-500 font-sans mt-0.5 block">
                Help us improve Evolve AI
              </span>
            </div>
          </div>
          <span className="text-cyan-400 text-lg font-bold pr-1 select-none font-sans">›</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/15 border border-rose-900/15 rounded-2xl p-4.5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-neutral-100 font-sans">Timeline Dissolution</h4>
            <span className="text-xs text-neutral-400 leading-relaxed font-sans mt-1 block">
              Resetting will clear your current roadmap goals, tasks list, streaks statistics, and chat conversations. This cannot be undone.
            </span>
          </div>
        </div>

        {showConfirmReset ? (
          <div className="flex gap-2 justify-end mt-2 animate-pulse">
            <button
              type="button"
              id="btn-confirm-reset-no"
              onClick={() => setShowConfirmReset(false)}
              className="py-1.5 px-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 rounded-xl text-xs font-sans text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-reset-yes"
              onClick={onReset}
              className="py-1.5 px-4 bg-rose-600 text-white hover:bg-rose-500 rounded-xl text-xs font-medium font-sans cursor-pointer"
            >
              CONFIRM DISSOLUTION
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-2">
            <button
              type="button"
              id="btn-settings-reset"
              onClick={() => setShowConfirmReset(true)}
              className="py-1.5 px-4.5 bg-rose-950/40 border border-rose-900/30 text-rose-400 rounded-xl text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 hover:bg-rose-900/30 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>RESET CURRENT GOAL</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
