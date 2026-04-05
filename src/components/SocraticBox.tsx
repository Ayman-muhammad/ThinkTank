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

      <div className="space-y-4 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-wider">
            <AlertTriangle size={12} />
            <span>Logical Weak Point Detected</span>
          </div>
          <p className="text-sm italic leading-relaxed text-slate-300 border-l-2 border-red-500/30 pl-4 py-1">
            "{weakPoint}"
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {fluffDetected.map((word, i) => (
            <span
              key={i}
              className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-medium text-slate-400 border border-white/5"
            >
              #{word}
            </span>
          ))}
        </div>

        <div className="rounded-xl bg-indigo-500/10 p-4 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <MessageSquare size={12} />
            <span>Socratic Interrogation</span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-indigo-100">
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
