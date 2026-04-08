import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  User, 
  Brain, 
  ChevronRight, 
  X,
  Sparkles,
  GraduationCap,
  Code,
  PenTool,
  BarChart3,
  Users,
  Lightbulb,
  Compass,
  Microscope,
  Rocket
} from 'lucide-react';
import sparkTemplates from '../data/sparkTemplates.json';
import { cn } from '../lib/utils';

interface SparkTemplate {
  id: string;
  userType: string;
  challenge: string;
  label: string;
  template: string;
}

interface SparkLibraryProps {
  onSelect: (template: string) => void;
  onClose: () => void;
}

const USER_TYPE_ICONS: Record<string, any> = {
  Student: GraduationCap,
  Developer: Code,
  Writer: PenTool,
  Analyst: BarChart3,
  Leader: Users,
  Creative: Lightbulb,
  Educator: Compass,
  Philosopher: Brain,
  Scientist: Microscope,
  Entrepreneur: Rocket,
  General: Sparkles
};

export const SparkLibrary: React.FC<SparkLibraryProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(sparkTemplates.map(t => t.userType));
    return Array.from(cats);
  }, []);

  const filteredTemplates = useMemo(() => {
    return (sparkTemplates as SparkTemplate[]).filter(t => {
      const matchesSearch = 
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.challenge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.template.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || t.userType === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/10 text-gold">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Spark Library</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">50+ Elite Cognitive Templates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-6 space-y-4 bg-slate-900/30 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search challenges, keywords, or templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                !selectedCategory 
                  ? "bg-gold text-navy border-gold shadow-lg shadow-gold/20" 
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
              )}
            >
              All Types
            </button>
            {categories.map(cat => {
              const Icon = USER_TYPE_ICONS[cat] || Sparkles;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                    selectedCategory === cat
                      ? "bg-gold text-navy border-gold shadow-lg shadow-gold/20"
                      : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                  )}
                >
                  <Icon size={14} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((t, idx) => {
                const Icon = USER_TYPE_ICONS[t.userType] || Sparkles;
                return (
                  <motion.button
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => onSelect(t.template)}
                    className="group relative flex flex-col items-start text-left p-5 rounded-2xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-gold/30 transition-all"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/5 text-slate-400 group-hover:text-gold transition-colors">
                          <Icon size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
                          {t.userType} • {t.challenge}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-gold transition-all group-hover:translate-x-1" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2 group-hover:text-gold transition-colors">{t.label}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">"{t.template}"</p>
                    
                    <div className="absolute inset-0 rounded-2xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-full bg-white/5 text-slate-600 mb-4">
                <Search size={48} />
              </div>
              <h3 className="text-lg font-bold text-white">No templates found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5 flex justify-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Select a template to inject your Human Spark</p>
        </div>
      </div>
    </motion.div>
  );
};
