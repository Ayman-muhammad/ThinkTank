import React from "react";
import { motion } from "motion/react";
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
}

export function LandingPage({ onStart, theme, toggleTheme }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-navy dark:text-slate-200 selection:bg-gold/30 selection:text-navy transition-colors duration-500">
      {/* Navigation / Header */}
      <nav className="fixed top-0 z-50 w-full border-b border-navy/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-navy font-black shadow-lg shadow-gold/20">T</div>
            <span className="text-xl font-bold tracking-tight text-navy dark:text-white font-serif">ThinkTank</span>
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
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gold px-10 py-5 text-lg font-bold text-navy transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
            >
              <span>Start Your Free Human Spark</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24 relative mx-auto max-w-4xl rounded-3xl border border-navy/5 bg-white dark:bg-slate-900 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)]"
          >
            <div className="overflow-hidden rounded-2xl border border-navy/5">
              <img 
                src="https://picsum.photos/seed/thinktank-hero/1200/700" 
                alt="ThinkTank Interface" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
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
      </section>

      {/* Section 2: The Problem */}
      <section className="py-32 px-6 bg-soft-gray dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Without ThinkTank */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 p-10 rounded-3xl border-l-4 border-rose-500 bg-white dark:bg-slate-950 shadow-sm"
            >
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-navy dark:text-white font-serif italic">AI alone = invisible</h3>
                <p className="text-slate-400">Generic. Forgettable. Easily replaced.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <p className="text-lg italic text-slate-400 dark:text-slate-500 leading-relaxed">
                  "We will leverage best-in-class solutions to drive measurable outcomes."
                </p>
              </div>
              <div className="flex items-center gap-2 text-rose-500 font-bold">
                <XCircle size={20} />
                <span>Standard AI Slop</span>
              </div>
            </motion.div>

            {/* With ThinkTank */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 p-10 rounded-3xl border-l-4 border-gold bg-white dark:bg-slate-950 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <Sparkles className="text-gold/20" size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-navy dark:text-white font-serif italic">AI + Human Spark = irreplaceable</h3>
                <p className="text-slate-400">Specific. Trusted. Human-verified.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gold/5 border border-gold/10">
                <p className="text-lg font-bold text-navy dark:text-white leading-relaxed">
                  "We will fix the payment gateway timeout that lost us 12 sales last week — I personally traced the bug to the Redis cache."
                </p>
              </div>
              <div className="flex items-center gap-2 text-gold font-bold">
                <CheckCircle2 size={20} />
                <span>Verified Human Insight</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: The Science */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block p-3 rounded-2xl bg-gold/10 text-gold mb-6"
            >
              <BarChart3 size={32} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-navy dark:text-white font-serif"
            >
              This isn't opinion. It's peer-reviewed.
            </motion.h2>
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
