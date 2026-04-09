import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Sparkles, Loader2, Zap, Undo2, Redo2 } from "lucide-react";
import { cn } from "../lib/utils";

interface SparkInputProps {
  onSpark: (spark: string, isFinalize?: boolean) => void;
  onQuickVerify?: () => void;
  onShowLibrary?: () => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  defaultSparks?: { label: string, template: string }[];
}

export function SparkInput({ 
  onSpark, 
  onQuickVerify, 
  onShowLibrary,
  isLoading, 
  className, 
  placeholder = "Add your Human Spark...", 
  value, 
  onChange,
  defaultSparks = []
}: SparkInputProps) {
  const [internalSpark, setInternalSpark] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [lastPushedValue, setLastPushedValue] = useState(value || "");

  const spark = value !== undefined ? value : internalSpark;
  const setSpark = onChange || setInternalSpark;

  const addToUndo = (val: string) => {
    if (val === lastPushedValue) return;
    setUndoStack(prev => [...prev.slice(-49), lastPushedValue]);
    setRedoStack([]);
    setLastPushedValue(val);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(prevRedo => [...prevRedo, spark]);
    setUndoStack(prevUndo => prevUndo.slice(0, -1));
    setLastPushedValue(prev);
    setSpark(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prevUndo => [...prevUndo, spark]);
    setRedoStack(prevRedo => prevRedo.slice(0, -1));
    setLastPushedValue(next);
    setSpark(next);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (spark !== lastPushedValue) {
        addToUndo(spark);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [spark, lastPushedValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  const handleSubmit = (isFinalize: boolean = false) => {
    if (spark.trim() && !isLoading) {
      onSpark(spark, isFinalize);
      if (!onChange) setInternalSpark("");
    }
  };

  return (
    <div className={cn("relative w-full space-y-4", className)}>
      {defaultSparks.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gold animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suggested Human Sparks</p>
            </div>
            <p className="text-[8px] font-bold text-slate-600 italic">Select to populate & refine</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {defaultSparks.map((s, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  addToUndo(spark);
                  setSpark(s.template);
                  // Focus the textarea after populating
                  setTimeout(() => {
                    const textarea = document.getElementById("spark-input-textarea") as HTMLTextAreaElement;
                    if (textarea) {
                      textarea.focus();
                      // Move cursor to the blank if it exists
                      const blankIndex = s.template.indexOf("______");
                      if (blankIndex !== -1) {
                        textarea.setSelectionRange(blankIndex, blankIndex + 6);
                      }
                    }
                  }, 50);
                }}
                disabled={isLoading}
                title={s.template}
                className="group relative px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-gold hover:border-gold/30 transition-all disabled:opacity-50 overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <Sparkles size={10} className="text-gold/50 group-hover:text-gold transition-colors" />
                  {s.label}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-1 backdrop-blur-xl shadow-2xl focus-within:border-indigo-500/50 transition-colors">
        <textarea
          id="spark-input-textarea"
          value={spark}
          onChange={(e) => setSpark(e.target.value)}
          onBlur={(e) => addToUndo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[120px] bg-transparent p-4 text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
        />
        
        <div className="flex items-center justify-between p-3 border-t border-white/5 bg-slate-900/80">
          <div className="flex items-center gap-2">
            {onShowLibrary && (
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.25)" }}
                whileTap={{ scale: 0.9 }}
                onClick={onShowLibrary}
                className="flex h-8 items-center gap-2 rounded-lg px-3 text-[10px] font-bold bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
              >
                <Zap size={12} />
                <span>Library</span>
              </motion.button>
            )}
            
            <div className="flex items-center gap-1 ml-2">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Undo (Ctrl+Z)"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Undo2 size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo (Ctrl+Y)"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Redo2 size={14} />
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onQuickVerify && (
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.25)" }}
                whileTap={{ scale: 0.9 }}
                onClick={onQuickVerify}
                disabled={isLoading}
                className="flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all disabled:opacity-50"
              >
                <Zap size={14} />
                <span>Quick Verify</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSubmit(true)}
              disabled={!spark.trim() || isLoading}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-bold transition-all border",
                spark.trim() && !isLoading
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-slate-800 text-slate-500 border-transparent cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                {isLoading && <Loader2 size={12} className="animate-spin" />}
                <span>Finalize</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSubmit(false)}
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
      </div>
      
      <p className="text-[10px] text-center text-slate-600 font-medium">
        ThinkTank will analyze your spark for original thought. Generic AI responses will be rejected.
      </p>
    </div>
  );
}
