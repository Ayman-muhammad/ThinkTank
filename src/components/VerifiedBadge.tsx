import { motion } from "motion/react";
import { CheckCircle2, ShieldCheck, Share2, Download } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface VerifiedBadgeProps {
  score: number;
  timestamp: string;
  className?: string;
}

export function VerifiedBadge({ score, timestamp, className }: VerifiedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur-xl overflow-hidden",
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Verified Human Thought
              <CheckCircle2 size={16} className="text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              ThinkTank Quality Standard • {timestamp}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
            {score}%
          </div>
          <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
            Elite Quality
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors">
          <Share2 size={14} />
          <span>Share Proof</span>
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors">
          <Download size={14} />
          <span>Download Certificate</span>
        </button>
      </div>
    </motion.div>
  );
}
