import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Hourglass } from "lucide-react";

interface SplashProps {
  onStart: () => void;
}

export default function Splash({ onStart }: SplashProps) {
  // Creating an array of particles to float around
  const particles = Array.from({ length: 25 }, (_, idx) => ({
    id: idx,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 15 + 8,
    delay: Math.random() * 5,
  }));

  return (
    <div
      id="splash-screen"
      className="relative flex flex-col justify-between items-center px-6 py-12 w-full h-full min-h-screen bg-neutral-950 font-sans text-white overflow-hidden"
    >
      {/* Background Matrix/Nebula Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-white/20 rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              boxShadow: p.size > 2 ? "0 0 8px rgba(167, 139, 250, 0.4)" : "none",
            }}
            animate={{
              y: ["0px", "-100px", "0px"],
              x: ["0px", "50px", "0px"],
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header element */}
      <div className="flex justify-between items-center w-full max-w-md z-10">
        <div className="flex items-center gap-1.5 font-mono text-xs text-purple-400">
          <Hourglass size={12} className="animate-spin" style={{ animationDuration: "6s" }} />
          <span>QUANTUM CHRONOLOGY v2.6.3</span>
        </div>
        <div className="px-2.5 py-0.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded-full">
          STABLE TIMELINE
        </div>
      </div>

      {/* Center Hero Logo/Title Block */}
      <div className="flex flex-col items-center text-center max-w-md z-10 my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mb-6"
        >
          {/* Logo Pulse Rings */}
          <div className="absolute inset-0 bg-purple-500/10 rounded-full scale-125 blur-md animate-pulse" />
          <div className="flex justify-center items-center w-20 h-20 bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 rounded-2xl shadow-lg shadow-purple-500/20">
            <Sparkles size={36} className="text-white animate-pulse" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-cyan-200"
        >
          Evolve AI
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-3 text-lg text-neutral-400 font-sans tracking-wide max-w-[280px]"
        >
          Your future successful self is waiting.
        </motion.p>

        {/* Cinematic progress bar/timeline marker */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "120px", opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 mt-6 rounded-full relative"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#22d3ee]" />
        </motion.div>
      </div>

      {/* Bottom Actions section */}
      <div className="flex flex-col items-center w-full max-w-md gap-4 z-10">
        <motion.button
          id="btn-begin-journey"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          onClick={onStart}
          whileTap={{ scale: 0.98 }}
          className="glow-btn flex justify-center items-center gap-2 w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium font-sans tracking-wide text-white shadow-lg overflow-hidden cursor-pointer"
        >
          <span>BEGIN TRANSFORMATION</span>
          <ArrowRight size={18} />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="text-[10px] font-mono text-white text-center max-w-[240px]"
        >
          BY ENTERING, YOU AUTHORIZE TEMPORAL COMMUNICATORS TO SYNCHRONIZE YOUR BIO-GOALS.
        </motion.p>
      </div>
    </div>
  );
}
