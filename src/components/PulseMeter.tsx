import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface PulseMeterProps {
  score: number;
  label?: string;
  className?: string;
}

export function PulseMeter({ score, label = "Human Pulse", className }: PulseMeterProps) {
  const getStatusColor = (s: number) => {
    if (s < 40) return "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
    if (s < 75) return "bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]";
    return "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
  };

  const getStatusText = (s: number) => {
    if (s < 40) return "Robot Slop Detected";
    if (s < 75) return "Generic AI Content";
    return "Elite Human Insight";
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
          {label}
        </span>
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-full",
          score < 40 ? "text-red-400 bg-red-400/10" : 
          score < 75 ? "text-yellow-400 bg-yellow-400/10" : 
          "text-emerald-400 bg-emerald-400/10"
        )}>
          {getStatusText(score)}
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800/50 backdrop-blur-sm border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative h-full transition-colors duration-500",
            getStatusColor(score)
          )}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
               style={{ backgroundSize: '200% 100%' }} />
        </motion.div>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-600">
        <span>0%</span>
        <span className="text-slate-400 font-bold">{score}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
