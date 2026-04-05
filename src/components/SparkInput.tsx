import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface SparkInputProps {
  onSpark: (spark: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export function SparkInput({ onSpark, isLoading, className, placeholder = "Add your Human Spark..." }: SparkInputProps) {
  const [spark, setSpark] = useState("");

  const handleSubmit = () => {
    if (spark.trim() && !isLoading) {
      onSpark(spark);
      setSpark("");
    }
  };

  return (
    <div className={cn("relative w-full space-y-4", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-1 backdrop-blur-xl shadow-2xl focus-within:border-indigo-500/50 transition-colors">
        <textarea
          value={spark}
          onChange={(e) => setSpark(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[120px] bg-transparent p-4 text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
        />
        
        <div className="flex items-center justify-between p-3 border-t border-white/5 bg-slate-900/80">
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            <Sparkles size={12} />
            <span>Human Insight Required</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!spark.trim() || isLoading}
            className={cn(
              "flex h-10 items-center gap-2 rounded-xl px-6 text-xs font-bold transition-all",
              spark.trim() && !isLoading
                ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Verify Quality</span>
                <Send size={14} />
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      <p className="text-[10px] text-center text-slate-600 font-medium">
        ThinkTank will analyze your spark for original thought. Generic AI responses will be rejected.
      </p>
    </div>
  );
}
