import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, Mic, MicOff, Heart, ThumbsUp, Star, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatViewProps {
  goal: string;
  category: string;
  progressPercent: number;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGeneratingChat: boolean;
}

const CONST_QUICK_PRESETS = [
  "I'm feeling lazy right now.",
  "I want to quit. Hard stuff is draining.",
  "What is our future life like?",
  "Give me a direct roadmap hack.",
];

export default function ChatView({
  goal,
  category,
  progressPercent,
  chatMessages,
  onSendMessage,
  isGeneratingChat,
}: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordFeedback, setRecordFeedback] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // States to animate premium typewriter on ONLY the very last AI message if it was just loaded
  const [lastAssistedText, setLastAssistedText] = useState("");
  const [typedOutput, setTypedOutput] = useState("");

  // Reaction counters per message ID to emulate localized responses
  const [reactions, setReactions] = useState<{ [msgId: string]: string }>({});

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGeneratingChat]);

  // Simulated Voice recording to align with "Premium interactive feel" which is client-safe
  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordFeedback("");
      // Add simulated spoken input text
      const voicePrompts = [
        "Future self, am I writing optimal systems today?",
        "I need a massive spike of energy right now.",
        "Tell me what we achieve in the next two years.",
      ];
      setInputText(voicePrompts[Math.floor(Math.random() * voicePrompts.length)]);
    } else {
      setIsRecording(true);
      setRecordFeedback("Synchronizing core telemetry audio channel...");
      setTimeout(() => {
        setRecordFeedback("Recording bio-frequencies... Speak now.");
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isGeneratingChat) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const selectPreset = (preset: string) => {
    if (isGeneratingChat) return;
    onSendMessage(preset);
  };

  const addReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: emoji,
    }));
  };

  return (
    <div id="future-me-chat-window" className="flex flex-col h-full w-full min-h-[500px] gap-4">
      {/* Header telemetry info panel */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm scale-110 animate-pulse" />
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold relative text-sm font-display">
              FM
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-950 rounded-full" />
          </div>
          <div>
            <h4 className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              Future Self (ChronosLink)
            </h4>
            <span className="text-xs text-neutral-100 font-semibold font-sans mt-0.5 block truncate max-w-[200px]">
              Succeeding in "{goal}"
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-cyan-400 block tracking-widest uppercase">
            SYNC STATUS
          </span>
          <span className="text-xs font-semibold text-neutral-200 block font-sans">
            Level: {progressPercent}%
          </span>
        </div>
      </div>

      {/* Message logs content stage */}
      <div className="flex-1 min-h-[300px] border border-neutral-800/80 rounded-2xl bg-neutral-950/40 p-4 overflow-y-auto flex flex-col gap-4">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
            <div className="p-3.5 bg-purple-950/20 border border-purple-800/30 rounded-full text-purple-400">
              <Sparkles className="animate-pulse" size={24} />
            </div>
            <h5 className="font-bold text-sm font-sans text-neutral-200">Wormhole Bridge Unlocked</h5>
            <p className="text-xs text-neutral-500 font-sans max-w-[240px] leading-relaxed">
              Ask your successful future self about difficulties, strategy or visual rewards in life after goal victory.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isAI = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? "" : "self-end flex-row-reverse"}`}
              >
                {isAI && (
                  <div className="w-7 h-7 bg-purple-950/60 border border-purple-800/40 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono text-purple-400 font-bold">
                    FM
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-sans leading-relaxed relative ${
                      isAI
                        ? "bg-neutral-900 border border-neutral-800/60 text-neutral-100 rounded-tl-none select-text"
                        : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-tr-none select-text"
                    }`}
                  >
                    <span>{msg.text}</span>

                    {/* Active Message reaction slot */}
                    {reactions[msg.id] && (
                      <div className="absolute -bottom-2 -right-1 bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded-full text-[9px] flex items-center gap-0.5 shadow-md">
                        <span>{reactions[msg.id]}</span>
                      </div>
                    )}
                  </div>

                  {/* Reaction panel triggers */}
                  {isAI && (
                    <div className="flex gap-2.5 mt-1 ml-1 items-center">
                      <button
                        type="button"
                        onClick={() => addReaction(msg.id, "👍")}
                        className="text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        <ThumbsUp size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => addReaction(msg.id, "❤️")}
                        className="text-rose-500 hover:text-rose-400 transition-colors"
                      >
                        <Heart size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => addReaction(msg.id, "⭐")}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <Star size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing loader state */}
        {isGeneratingChat && (
          <div className="flex gap-3 items-center">
            <div className="w-7 h-7 bg-purple-900/15 border border-purple-800/20 rounded-full flex items-center justify-center text-[10px] font-mono text-purple-400 font-bold animate-pulse">
              FM
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800/60 p-3 rounded-2xl rounded-tl-none">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Question Pill Presets list */}
      <AnimatePresence>
        {!isGeneratingChat && chatMessages.length < 8 && (
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {CONST_QUICK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => selectPreset(preset)}
                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 px-3 py-1.5 text-[11px] text-neutral-400 hover:text-neutral-200 transition-all rounded-full shrink-0 font-sans cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Simulated voice status feedback */}
      {isRecording && (
        <div className="text-[10px] font-mono text-pink-500 text-center flex items-center justify-center gap-1.5 animate-pulse bg-pink-950/20 border border-pink-900/30 p-2 rounded-xl">
          <Mic size={10} />
          <span>{recordFeedback}</span>
        </div>
      )}

      {/* Dialogue Core Input Field area */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Simulated Voice button */}
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`p-3.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            isRecording
              ? "bg-pink-600 border-pink-500 text-white animate-pulse"
              : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
          }`}
          title="Speak to Future Self"
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Area block */}
        <input
          id="chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Manifest an inquiry to your future successful self..."
          className="flex-1 py-3.5 px-4 bg-neutral-900/90 border border-neutral-800/80 focus:border-purple-500 focus:outline-none transition-all placeholder-neutral-600 rounded-xl text-xs font-sans text-white text-left"
        />

        {/* Send message trigger */}
        <button
          id="btn-chat-send"
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isGeneratingChat}
          className={`p-3.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            inputText.trim() && !isGeneratingChat
              ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow shadow-purple-900/20"
              : "bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800/40"
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
