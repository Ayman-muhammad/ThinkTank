import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Shield, 
  MessageSquare, 
  ArrowRight, 
  RefreshCcw,
  Clipboard,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { gemini, type CriticResponse, type MergeResponse } from "./services/gemini";
import { PulseMeter } from "./components/PulseMeter";
import { SocraticBox } from "./components/SocraticBox";
import { SparkInput } from "./components/SparkInput";
import { VerifiedBadge } from "./components/VerifiedBadge";
import { cn } from "./lib/utils";

type Step = "input" | "auditing" | "interrogation" | "merging" | "verified";

export default function App() {
  const [step, setStep] = useState<Step>("input");
  const [aiText, setAiText] = useState("");
  const [critic, setCritic] = useState<CriticResponse | null>(null);
  const [mergeResult, setMergeResult] = useState<MergeResponse | null>(null);
  const [pulseScore, setPulseScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAudit = async () => {
    if (!aiText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setStep("auditing");
    
    try {
      const result = await gemini.auditAIText(aiText);
      setCritic(result);
      setPulseScore(100 - result.pulse_deduction);
      setStep("interrogation");
    } catch (err) {
      setError("Failed to audit text. Please check your API key.");
      setStep("input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpark = async (spark: string) => {
    setIsLoading(true);
    setError(null);
    setStep("merging");
    
    try {
      const result = await gemini.mergeSpark(aiText, spark);
      setMergeResult(result);
      setPulseScore(result.quality_score);
      setStep("verified");
    } catch (err) {
      setError("Failed to merge spark. Please try again.");
      setStep("interrogation");
    } finally {
      setIsLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (mergeResult) {
      navigator.clipboard.writeText(mergeResult.refined_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setStep("input");
    setAiText("");
    setCritic(null);
    setMergeResult(null);
    setPulseScore(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 lg:py-24 space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">ThinkTank <span className="text-indigo-500">(T.T.)</span></h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Human Insight Protocol</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Zap size={12} className="text-yellow-500" />
              <span>2026 Standard</span>
            </div>
            {step !== "input" && (
              <button 
                onClick={reset}
                className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCcw size={18} />
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.section
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
                  Stop the <span className="text-indigo-500">Cognitive Atrophy.</span>
                </h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  Paste your AI-generated content below. ThinkTank will audit it for generic slop and challenge you to add your unique human spark.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-emerald-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-2 backdrop-blur-xl">
                  <textarea
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    placeholder="Paste AI text here (e.g., from ChatGPT)..."
                    className="w-full min-h-[240px] bg-transparent p-6 text-slate-200 placeholder-slate-600 focus:outline-none resize-none text-lg leading-relaxed"
                  />
                  <div className="flex items-center justify-between p-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Clipboard size={14} />
                      <span>Source: AI Engine</span>
                    </div>
                    <button
                      onClick={handleStartAudit}
                      disabled={!aiText.trim() || isLoading}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-black transition-all",
                        aiText.trim() && !isLoading
                          ? "bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      <span>Audit Quality</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
            </motion.section>
          )}

          {step === "auditing" && (
            <motion.section
              key="auditing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-8 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse" />
                <div className="relative h-24 w-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center">
                  <Shield size={48} className="text-indigo-500 animate-bounce" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Auditing AI Slop...</h2>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Principal Architect is scanning for logical gaps</p>
              </div>
            </motion.section>
          )}

          {step === "interrogation" && critic && (
            <motion.section
              key="interrogation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <PulseMeter score={pulseScore} />
              
              <div className="grid gap-8">
                <SocraticBox 
                  weakPoint={critic.weak_point}
                  fluffDetected={critic.fluff_detected}
                  socraticHit={critic.socratic_hit}
                />
                
                <SparkInput 
                  onSpark={handleSpark}
                  isLoading={isLoading}
                  placeholder="Defend your logic. Add your Human Spark here..."
                />
              </div>
            </motion.section>
          )}

          {step === "merging" && (
            <motion.section
              key="merging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-8 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse" />
                <div className="relative h-24 w-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center">
                  <Sparkles size={48} className="text-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Merging Human Spark...</h2>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Synthesizing Elite Quality Output</p>
              </div>
            </motion.section>
          )}

          {step === "verified" && mergeResult && (
            <motion.section
              key="verified"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <VerifiedBadge 
                score={pulseScore} 
                timestamp={new Date().toLocaleTimeString()} 
              />
              
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <MessageSquare size={14} />
                  <span>Elite Output</span>
                </div>
                
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-strong:text-indigo-400">
                  <ReactMarkdown>{mergeResult.refined_text}</ReactMarkdown>
                </div>
                
                <div className="pt-6 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]",
                      copied ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-500"
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} />
                        <span>Copy Elite Output</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            © 2026 ThinkTank Protocol • Human-First Intelligence
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">Documentation</a>
            <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">API</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
