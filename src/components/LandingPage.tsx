import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Shield, Zap, ArrowRight, CheckCircle2, XCircle, 
  Sparkles, Lock, MessageSquare, ShieldCheck, ExternalLink,
  BarChart3, Quote, PlayCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface LandingPageProps {
  onStart: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  freeAttempts: number;
  isLoggedIn: boolean;
}

const FOUNDER_IMAGE = "https://storage.googleapis.com/applet-assets/ffdc433a-a909-4254-b30a-6a549152929b/input_file_0.png";

export function LandingPage({ onStart, theme, toggleTheme, freeAttempts, isLoggedIn }: LandingPageProps) {
  const [founderTab, setFounderTab] = React.useState<"Vision" | "Background" | "Philosophy">("Vision");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-navy dark:text-slate-200 selection:bg-gold/30 selection:text-navy transition-colors duration-500">
      {/* Navigation / Header */}
      <nav className="fixed top-0 z-50 w-full border-b border-navy/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-navy font-black shadow-lg shadow-gold/20">T</div>
            <span className="text-xl font-bold tracking-tight text-navy dark:text-white font-serif">ThinkTank</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-gold transition-colors">Features</a>
            <a href="#why" className="hover:text-gold transition-colors">Why T.T.</a>
            <a href="#founder" className="hover:text-gold transition-colors">Founder</a>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button 
              onClick={onStart}
              className="rounded-full bg-navy dark:bg-white px-6 py-2 text-sm font-bold text-white dark:text-navy transition-all hover:scale-105 active:scale-95 shadow-lg shadow-navy/10 dark:shadow-white/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="relative overflow-hidden pt-48 pb-32 px-6">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%" 
              }}
              animate={{ 
                opacity: [0, 0.2, 0],
                y: ["-10%", "110%"],
                x: (Math.random() - 0.5) * 20 + "%"
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
              className="absolute h-1 w-1 rounded-full bg-gold/40 blur-[1px]"
            />
          ))}
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Futuristic Background Images */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10, x: -100 }}
            animate={{ 
              opacity: 0.25, 
              scale: 1.1, 
              rotate: [-2, 2, -2], 
              x: 0,
              y: [0, 40, 0] 
            }}
            transition={{ 
              duration: 2, 
              delay: 0.5,
              rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 15, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-10 -left-20 w-[700px] h-[700px] opacity-20 dark:opacity-15"
          >
            <img 
              src="https://picsum.photos/seed/mind-ai-ultra/1000/1000" 
              alt="Futuristic Mind" 
              className="w-full h-full object-cover rounded-full blur-[1px] border-4 border-gold/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-transparent rounded-full mix-blend-overlay" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10, x: 100 }}
            animate={{ 
              opacity: 0.2, 
              scale: 1.05, 
              rotate: [2, -2, 2], 
              x: 0,
              y: [0, -50, 0]
            }}
            transition={{ 
              duration: 2, 
              delay: 0.8,
              rotate: { duration: 18, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 20, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/4 -right-40 w-[800px] h-[800px] opacity-20 dark:opacity-15"
          >
            <img 
              src="https://picsum.photos/seed/futuristic-brain-ultra/1000/1000" 
              alt="AI Design" 
              className="w-full h-full object-cover rounded-full blur-[3px] border-4 border-indigo-500/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/30 to-transparent rounded-full mix-blend-overlay" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ 
              opacity: 0.22, 
              scale: 1.15, 
              y: 0,
              x: [-20, 60, -20]
            }}
            transition={{ 
              duration: 2, 
              delay: 1.1,
              x: { duration: 25, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -bottom-40 left-1/4 w-[900px] h-[900px] opacity-20 dark:opacity-15"
          >
            <img 
              src="https://picsum.photos/seed/cybernetic-consciousness-ultra/1200/1200" 
              alt="Mind Kinematics" 
              className="w-full h-full object-cover rounded-full blur-[6px] border-4 border-emerald-500/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-transparent rounded-full mix-blend-overlay" />
          </motion.div>
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold mb-8"
          >
            <Sparkles size={14} />
            <span>Human Spark Validator</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-navy dark:text-white font-serif leading-[1.1]"
          >
            AI is powerful.<br />
            <span className="relative inline-block">
              But it doesn't think like you.
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gold/30 rounded-full" />
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            ThinkTank is the first quality layer that verifies your unique human insight — so you stay irreplaceable.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mt-4 text-sm font-medium text-slate-400 dark:text-slate-500"
          >
            Used by students, developers, and freelancers who refuse to become passive AI consumers.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={onStart}
              className="group relative flex flex-col items-center gap-1 overflow-hidden rounded-full bg-gold px-10 py-5 text-lg font-bold text-navy transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
            >
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <span>{isLoggedIn ? "Enter ThinkTank" : "Start Your Free Human Spark"}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.div>
              {!isLoggedIn && (
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                  {3 - freeAttempts} Free Attempts Remaining
                </span>
              )}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            </button>
            <button
              className="flex items-center gap-2 rounded-full border-2 border-navy dark:border-white px-10 py-5 text-lg font-bold text-navy dark:text-white transition-all hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy"
            >
              <PlayCircle size={20} />
              <span>Watch 2-Minute Demo</span>
            </button>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            className="mt-24 relative mx-auto max-w-4xl rounded-3xl border border-navy/5 bg-white dark:bg-slate-900 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] group"
          >
            <div className="overflow-hidden rounded-2xl border border-navy/5 relative">
              <motion.img 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.6 }}
                src="https://picsum.photos/seed/thinktank-hero/1200/700" 
                alt="ThinkTank Interface" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            {/* Floating Badge Mockup */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-1/4 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-xl border border-gold/20 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <ShieldCheck size={24} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gold">Verified</div>
                <div className="text-sm font-bold text-navy dark:text-white">Human Spark Active</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>      {/* Section 2: Deep Understanding - Why T.T. over other AI */}
      <section id="why" className="py-32 px-6 bg-slate-50 dark:bg-slate-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-navy dark:text-white font-serif mb-6"
            >
              Why ThinkTank?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
            >
              Most AI tools are designed to replace you. ThinkTank is designed to protect you.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-navy/5 shadow-2xl shadow-navy/5"
            >
              <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8">
                <XCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-navy dark:text-white mb-4">The "Other AI" Trap</h3>
              <ul className="space-y-4">
                {[
                  "Produces generic, detectable 'AI Slop'",
                  "Encourages cognitive laziness",
                  "Makes your work indistinguishable from millions of others",
                  "Creates a dependency that erodes your critical thinking"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-navy text-white shadow-2xl shadow-navy/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain size={120} />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gold/20 flex items-center justify-center text-gold mb-8">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">The ThinkTank Protocol</h3>
              <ul className="space-y-4">
                {[
                  "Verifies your unique Human Spark",
                  "Forces deep, socratic engagement with every output",
                  "Builds your 'Socratic Genome' to adapt to your thinking",
                  "Ensures your work is trusted, specific, and irreplaceable"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2.5: Feature Deep Dive with Images */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <Brain size={24} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-navy dark:text-white font-serif">The Socratic Interceptor</h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Unlike standard AI that just gives you an answer, ThinkTank intercepts the response and forces a moment of critical reflection. It identifies the "weakest link" in the AI's logic and asks you to strengthen it.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-gold">
                    <CheckCircle2 size={16} />
                    <span>Prevents AI Hallucinations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gold">
                    <CheckCircle2 size={16} />
                    <span>Forces Original Thought</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative rounded-[2rem] overflow-hidden border border-navy/5 shadow-2xl group"
              >
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  src="https://picsum.photos/seed/tt-socratic/800/600" 
                  alt="Socratic Interceptor" 
                  className="w-full h-auto transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500" />
              </motion.div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 relative rounded-[2rem] overflow-hidden border border-navy/5 shadow-2xl group"
              >
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  src="https://picsum.photos/seed/tt-genome/800/600" 
                  alt="Socratic Genome" 
                  className="w-full h-auto transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2 space-y-6"
              >
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-navy dark:text-white font-serif">The Socratic Genome</h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  ThinkTank learns how you think. It builds a persistent "Genome" of your cognitive strengths and biases, ensuring that every interrogation is tailored to push your specific intellectual boundaries.
                </p>
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-navy/5">
                    <Zap size={16} className="text-gold" />
                    <span className="text-xs font-bold text-navy dark:text-white">Adaptive Difficulty Scaling</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-navy/5">
                    <BarChart3 size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold text-navy dark:text-white">Cognitive Bias Detection</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <section id="founder" className="py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative aspect-square overflow-hidden rounded-[3rem] border-8 border-white dark:border-slate-900 shadow-2xl">
                <img 
                  src={FOUNDER_IMAGE} 
                  alt="ThinkTank Founder" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gold text-navy p-6 rounded-3xl shadow-xl">
                <div className="text-2xl font-black font-serif">Fayez Ayman</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Chief Architect & Founder</div>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold"
              >
                <Quote size={14} />
                <span>Know the Founder</span>
              </motion.div>

              {/* Founder Tabs */}
              <div className="flex gap-4 border-b border-navy/5 dark:border-white/5">
                {["Vision", "Background", "Philosophy"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFounderTab(tab as any)}
                    className={cn(
                      "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                      founderTab === tab ? "text-gold" : "text-slate-400 hover:text-navy dark:hover:text-white"
                    )}
                  >
                    {tab}
                    {founderTab === tab && (
                      <motion.div 
                        layoutId="founderTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                      />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={founderTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {founderTab === "Vision" && (
                    <>
                      <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white font-serif leading-tight">
                        "We are losing our ability to think. ThinkTank is the antidote."
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        I built ThinkTank because I saw my own critical thinking eroding as I leaned more on AI. I realized that if we don't build a quality layer between us and the machine, we'll eventually become nothing more than prompt-monkeys.
                      </p>
                    </>
                  )}
                  {founderTab === "Background" && (
                    <>
                      <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white font-serif leading-tight">
                        Built by a Socratic Architect.
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        With a background in cognitive psychology and distributed systems, Ayman M. has spent the last decade exploring the intersection of human intelligence and machine learning. ThinkTank is the culmination of that research.
                      </p>
                    </>
                  )}
                  {founderTab === "Philosophy" && (
                    <>
                      <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white font-serif leading-tight">
                        Dignity in the Age of Automation.
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        ThinkTank isn't just a tool; it's a protocol for human dignity. It's about ensuring that when you hit 'send', you actually know what you're sending. We believe AI should be a bicycle for the mind, not a replacement for it.
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user-${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-navy dark:text-white">
                  Join 12,000+ thinkers<br />
                  <span className="text-gold">Protecting their cognitive edge</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Cognitive Science Lab */}
      <section className="py-32 px-6 bg-slate-50 dark:bg-slate-900/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-gold/10 blur-3xl rounded-full" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold mb-6"
            >
              <BarChart3 size={14} />
              <span>The Science of Thought</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-navy dark:text-white font-serif leading-tight"
            >
              AI is a Mirror.<br />
              <span className="text-gold">You are the Source.</span>
            </motion.h2>
            <p className="mt-6 text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              ThinkTank is built on the latest cognitive research, protecting the "Human Spark" that AI can only mimic, never originate.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Research Card 1: Pattern Matching */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-navy/5 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.img 
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  whileHover={{ scale: 1.1, rotate: 1 }}
                  src="https://picsum.photos/seed/pattern-matching-ai/800/600" 
                  alt="Pattern Matching" 
                  className="w-full h-full object-cover transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Zap size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Research: Martha Lewis</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Pattern Matching vs. Understanding</h3>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  AI excels at identifying patterns in massive datasets, but lacks <strong>"zero-shot" learning</strong>—the ability to generalize rules from a single example.
                </p>
                <div className="pt-4 border-t border-navy/5 dark:border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Cognitive Depth</span>
                    <span className="text-rose-500">AI: Surface</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "35%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-rose-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Research Card 2: The Memory Paradox */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-navy text-white shadow-2xl shadow-navy/20"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.img 
                  animate={{ 
                    y: [0, 10, 0],
                    scale: [1, 1.03, 1]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  whileHover={{ scale: 1.1, rotate: -1 }}
                  src="https://picsum.photos/seed/memory-paradox-neuro/800/600" 
                  alt="Memory Paradox" 
                  className="w-full h-full object-cover opacity-60 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Brain size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Neuroscience Insight</span>
                  </div>
                  <h3 className="text-xl font-bold">The "Memory Paradox"</h3>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Habitual AI offloading erodes the memory skills essential for <strong>intuitive reasoning</strong>. ThinkTank forces active recall, keeping your neural pathways sharp.
                </p>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Neural Retention</span>
                    <span className="text-gold">T.T. Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                      className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Research Card 3: The Copy-Paste Trap */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-navy/5 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.img 
                  animate={{ 
                    x: [-5, 5, -5],
                    scale: [1, 1.04, 1]
                  }}
                  transition={{ 
                    duration: 12, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  whileHover={{ scale: 1.1, rotate: 1 }}
                  src="https://picsum.photos/seed/ai-copy-paste-trap/800/600" 
                  alt="Copy-Paste Trap" 
                  className="w-full h-full object-cover transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Shield size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">U.S. Copyright Office</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">The "Copy-Paste" Trap</h3>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  AI training creates "perfect copies." Humans retain <strong>imperfect impressions</strong> filtered through personality—the very source of creative genius.
                </p>
                <div className="pt-4 border-t border-navy/5 dark:border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Originality Index</span>
                    <span className="text-emerald-500">Human: Max</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "98%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.9 }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Peer Reviewed Section */}
          <div className="mt-32 pt-32 border-t border-navy/5 dark:border-white/5">
            <div className="text-center mb-16">
              <h3 className="text-2xl font-black text-navy dark:text-white font-serif">This isn't opinion. It's peer-reviewed.</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                source: "Harvard Gazette (2025)",
                quote: "Heavy AI use correlates with measurable decline in critical thinking.",
                link: "https://news.harvard.edu"
              },
              {
                source: "MIT Study (2024)",
                quote: "AI-augmented workers show reduced cognitive effort unless actively challenged.",
                link: "https://mit.edu"
              },
              {
                source: "ThinkTank Internal Validation",
                quote: "Users who add a Human Spark see 3x higher engagement on their work.",
                link: "#"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-3xl border border-navy/5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <Quote className="text-gold/20 mb-6" size={32} />
                <h4 className="text-lg font-bold text-navy dark:text-white mb-4">{card.source}</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  "{card.quote}"
                </p>
                <a href={card.link} className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline">
                  <span>Read Source</span>
                  <ExternalLink size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>

      {/* Section 4: How It Works */}
      <section className="py-32 px-6 bg-navy text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent" />
        </div>
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black font-serif">The Human-AI Handshake</h2>
            <p className="mt-4 text-slate-400">Three steps to cognitive dominance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                step: "01",
                title: "Intercept",
                desc: "T.T. lives inside your workflow. When AI responds, the output is temporarily paused for quality auditing.",
                icon: <Lock size={32} />
              },
              {
                step: "02",
                title: "Challenge",
                desc: "T.T. identifies logical gaps and asks one specific, contextual question about YOUR unique work.",
                icon: <MessageSquare size={32} />
              },
              {
                step: "03",
                title: "Validate",
                desc: "You answer with your Human Spark. T.T. verifies originality and unlocks your work with a Verified Badge.",
                icon: <ShieldCheck size={32} />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative space-y-6"
              >
                <div className="text-8xl font-black text-white/5 absolute -top-12 -left-4">{item.step}</div>
                <div className="h-16 w-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold relative z-10">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-bold font-serif relative z-10">{item.title}</h4>
                <p className="text-slate-400 leading-relaxed relative z-10">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-24 text-center">
            <button
              onClick={onStart}
              className="rounded-full bg-gold px-10 py-5 text-lg font-bold text-navy transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
            >
              Install ThinkTank for Free
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Live Quality Meter */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white font-serif">See your quality in real time.</h2>
          </div>
          
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-navy/5 bg-soft-gray dark:bg-slate-900 p-8 md:p-12 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-2xl bg-white dark:bg-slate-950 p-6 shadow-sm border border-navy/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-gold/10 border-2 border-gold p-6 shadow-lg"
                >
                  <p className="text-sm font-bold text-gold uppercase tracking-widest mb-2">Auditor Challenge</p>
                  <p className="text-navy dark:text-white font-medium">"This sounds generic. Add one specific detail from your experience."</p>
                  <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-950 border border-gold/20 text-navy dark:text-white text-sm italic">
                    "In our startup, the actual bottleneck was the Redis cache..."
                  </div>
                </motion.div>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative h-64 w-32 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-950 shadow-xl">
                  <motion.div
                    initial={{ height: "32%" }}
                    whileInView={{ height: "88%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute bottom-0 w-full bg-gold shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-navy dark:text-white mix-blend-difference">
                    88%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-navy dark:text-white">Human Pulse</div>
                  <div className="text-sm text-gold font-bold uppercase tracking-widest">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="py-32 px-6 bg-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black font-serif mb-8"
          >
            AI is the tool.<br />
            You are the thinker.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
          >
            Join thousands of professionals who protect their career with the Human Spark.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={onStart}
              className="rounded-full bg-gold px-12 py-6 text-xl font-bold text-navy transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-gold/30"
            >
              Start Your Human Spark — It's Free
            </button>
            <p className="mt-6 text-sm text-white/50">
              No credit card required. Uninstall in one click.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-navy/5 dark:border-white/5 text-center bg-white dark:bg-slate-950">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gold text-navy flex items-center justify-center font-black">
            T
          </div>
          <span className="text-lg font-bold text-navy dark:text-white font-serif">ThinkTank</span>
        </div>
        <p className="text-slate-500 text-sm">© 2026 ThinkTank (T.T.) Protocol. All rights reserved.</p>
        <div className="mt-6 flex justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-gold transition-colors">Privacy</a>
          <a href="#" className="hover:text-gold transition-colors">Terms</a>
          <a href="#" className="hover:text-gold transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
}
