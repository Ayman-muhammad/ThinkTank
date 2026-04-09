import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Download, Share2, X, CheckCircle2, Award, User as UserIcon, Calendar, Hash } from "lucide-react";
import { cn } from "../lib/utils";
import type { User } from "firebase/auth";

interface SparkCertificateProps {
  user: User;
  originalText: string;
  humanSpark: string;
  refinedText: string;
  qualityScore: number;
  onClose: () => void;
}

export function SparkCertificate({ user, originalText, humanSpark, refinedText, qualityScore, onClose }: SparkCertificateProps) {
  const certificateId = Math.random().toString(36).substring(2, 15).toUpperCase();
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gold/20"
      >
        {/* Certificate Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-gold/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-8 sm:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gold flex items-center justify-center text-navy shadow-lg shadow-gold/20">
                <Award size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tighter text-navy dark:text-white font-serif">Human Spark Certificate</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">ThinkTank Verified Intelligence</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-navy/5 dark:hover:bg-white/5 text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 py-4 border-y border-navy/5 dark:border-white/5">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Thinker</p>
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-gold" />
                  <p className="text-sm font-bold text-navy dark:text-white">{user.displayName || user.email?.split('@')[0]}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Date</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gold" />
                  <p className="text-sm font-bold text-navy dark:text-white">{date}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certificate ID</p>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gold" />
                  <p className="text-sm font-mono font-bold text-navy dark:text-white">{certificateId}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quality Pulse</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-500">{qualityScore}% Verified</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">The Human Spark (Original Insight)</p>
              <div className="p-4 rounded-2xl bg-navy/5 dark:bg-white/5 border border-navy/5 dark:border-white/5 italic text-sm text-navy dark:text-slate-300 leading-relaxed">
                "{humanSpark || "Direct Socratic Verification"}"
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Output Summary</p>
              <p className="text-sm text-navy dark:text-slate-400 leading-relaxed line-clamp-3">
                {refinedText}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-navy dark:bg-white px-8 py-4 text-white dark:text-navy font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
            <button 
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gold px-8 py-4 text-navy font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Share2 size={20} />
              <span>Share Verification</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">
            <Shield size={12} />
            <span>Blockchain Secured Protocol</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
