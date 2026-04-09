import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Volume2, 
  Palette, 
  User, 
  Moon, 
  Sun, 
  Monitor,
  Check,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  onClose: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  ttsVoice: string;
  setTtsVoice: (voice: string) => void;
  organization: string;
  setOrganization: (org: string) => void;
  isInstallable?: boolean;
  onInstall?: () => void;
}

const VOICES = [
  { id: "Kore", label: "Kore (Authoritative)" },
  { id: "Puck", label: "Puck (Playful)" },
  { id: "Charon", label: "Charon (Deep)" },
  { id: "Fenrir", label: "Fenrir (Bold)" },
  { id: "Zephyr", label: "Zephyr (Calm)" }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  theme, 
  setTheme, 
  ttsVoice, 
  setTtsVoice,
  organization,
  setOrganization,
  isInstallable,
  onInstall
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Settings size={20} />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">System Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Appearance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Palette size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Appearance</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  theme === "light" 
                    ? "bg-indigo-500/10 border-indigo-500/50 text-white" 
                    : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <Sun size={18} />
                  <span className="text-sm font-bold">Light Mode</span>
                </div>
                {theme === "light" && <Check size={16} className="text-indigo-400" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  theme === "dark" 
                    ? "bg-indigo-500/10 border-indigo-500/50 text-white" 
                    : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <Moon size={18} />
                  <span className="text-sm font-bold">Dark Mode</span>
                </div>
                {theme === "dark" && <Check size={16} className="text-indigo-400" />}
              </motion.button>
            </div>
          </section>

          {/* Voice Synthesis */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Voice Synthesis</h3>
            </div>
            
            <div className="space-y-2">
              {VOICES.map((voice) => (
                <motion.button
                  key={voice.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setTtsVoice(voice.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                    ttsVoice === voice.id 
                      ? "bg-gold/10 border-gold/50 text-white" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                  )}
                >
                  <span className="text-sm font-bold">{voice.label}</span>
                  {ttsVoice === voice.id && <Check size={16} className="text-gold" />}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Social Shame Organization */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Social Shame Sector</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization (School, Company, or Region)</p>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  placeholder="e.g. Harvard, Google, London..."
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Specify your sector to compete in localized leaderboards. Social pressure is the ultimate cognitive motivator.
              </p>
            </div>
          </section>

          {/* User Profile */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <User size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Cognitive Profile</h3>
            </div>
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Your Socratic Genome is analyzed every 5 verified thoughts. This adapts the AI's interrogation style to your specific cognitive patterns.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <Monitor size={12} />
                <span>Active Learning Enabled</span>
              </div>
            </div>
          </section>

          {/* PWA Install */}
          {isInstallable && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Monitor size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Application Access</h3>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onInstall}
                className="w-full flex items-center justify-between p-6 rounded-2xl bg-gold text-navy border border-gold/50 shadow-xl shadow-gold/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-navy/10">
                    <Monitor size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-widest">Install ThinkTank</p>
                    <p className="text-[10px] font-bold opacity-70">Add to home screen for elite access</p>
                  </div>
                </div>
                <Check size={20} />
              </motion.button>
            </section>
          )}
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-white/5 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
