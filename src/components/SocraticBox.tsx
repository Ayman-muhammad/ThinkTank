import { motion } from "motion/react";
import { MessageSquare, AlertTriangle, Search, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface SocraticBoxProps {
  weakPoint: string;
  fluffDetected: string[];
  socraticHit: string;
  className?: string;
}

export function SocraticBox({ weakPoint, fluffDetected, socraticHit, className }: SocraticBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative w-full space-y-6 rounded-2xl border border-indigo-500/20 bg-slate-900/60 p-6 backdrop-blur-2xl shadow-[0_0_40px_rgba(79,70,229,0.05)] overflow-hidden group",
        className
      )}
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
      
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">ThinkTank Auditor</h3>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Principal Architect Analysis</p>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">
            <AlertTriangle size={14} />
            <span>Logical Weak Point Detected</span>
          </div>
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-500/30 rounded-full" />
            <p className="text-lg font-medium leading-relaxed text-slate-200 pl-4 py-1 italic">
              "{weakPoint}"
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {fluffDetected.map((word, i) => (
            <span
              key={i}
              className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400 border border-white/5 uppercase tracking-wider"
            >
              #{word}
            </span>
          ))}
        </div>

        <div className="rounded-[2rem] bg-indigo-500/10 p-8 border border-indigo-500/20 relative overflow-hidden group/box">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/box:opacity-10 transition-opacity">
            <MessageSquare size={80} />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
            <MessageSquare size={14} />
            <span>Socratic Interrogation</span>
          </div>
          <p className="text-xl font-black leading-tight text-white tracking-tight">
            {socraticHit}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 relative z-10">
        <Search size={10} />
        <span>Searching for Human Spark...</span>
      </div>
    </motion.div>
  );
}
