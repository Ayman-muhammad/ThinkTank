import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Building2, 
  MapPin, 
  GraduationCap, 
  X, 
  Search,
  Zap,
  TrendingUp,
  AlertTriangle,
  Skull
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  score: number;
  streak: number;
  organization: string;
}

interface SocialShameLeaderboardProps {
  onClose: () => void;
  currentUserUid?: string;
  userOrganization?: string;
}

export const SocialShameLeaderboard: React.FC<SocialShameLeaderboardProps> = ({ 
  onClose, 
  currentUserUid,
  userOrganization 
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'global' | 'org'>('global');
  const [orgFilter, setOrgFilter] = useState(userOrganization || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.error("Firestore database instance (db) is not initialized.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let q = query(collection(db, 'profiles'), orderBy('score', 'desc'), limit(50));

    if (filter === 'org' && orgFilter) {
      q = query(
        collection(db, 'profiles'), 
        where('organization', '==', orgFilter),
        orderBy('score', 'desc'), 
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      setEntries(newEntries);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [filter, orgFilter]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="text-gold" size={20} />;
      case 1: return <Trophy className="text-slate-300" size={18} />;
      case 2: return <Trophy className="text-amber-600" size={16} />;
      default: return <span className="text-xs font-black text-slate-500">#{index + 1}</span>;
    }
  };

  const getStatusLabel = (index: number, total: number) => {
    if (index === 0) return { label: "Socratic God", color: "text-gold bg-gold/10" };
    if (index < 3) return { label: "Elite Auditor", color: "text-indigo-400 bg-indigo-500/10" };
    if (index > total - 5 && total > 10) return { label: "Cognitive Slacker", color: "text-red-500 bg-red-500/10", icon: <Skull size={10} /> };
    return { label: "Thinker", color: "text-slate-400 bg-white/5" };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 shadow-lg shadow-red-500/5">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Social Shame <span className="text-red-500">Leaderboard</span></h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Leveraging pressure for cognitive growth</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white/5 text-slate-400 transition-all"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('global')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                filter === 'global' 
                  ? "bg-white text-navy border-white shadow-lg" 
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
              )}
            >
              <Users size={14} />
              <span>Global</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('org')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                filter === 'org' 
                  ? "bg-gold text-navy border-gold shadow-lg" 
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
              )}
            >
              <Building2 size={14} />
              <span>My Organization</span>
            </motion.button>
          </div>

          {filter === 'org' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="Filter by school, company, or region..."
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 transition-all"
              />
            </motion.div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Zap className="text-gold animate-pulse" size={48} />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Syncing Rankings...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <AlertTriangle className="text-slate-600" size={48} />
              <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No thinkers found in this sector</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const status = getStatusLabel(index, entries.length);
              const isCurrentUser = entry.uid === currentUserUid;

              return (
                <motion.div
                  key={entry.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-3xl border transition-all",
                    isCurrentUser 
                      ? "bg-gold/10 border-gold/30 shadow-lg shadow-gold/5" 
                      : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    
                    <div className="relative">
                      <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-gold/50 transition-all">
                        <img 
                          src={entry.photoURL || `https://picsum.photos/seed/${entry.uid}/100/100`} 
                          alt={entry.displayName} 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {entry.streak > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-[8px] font-black text-white shadow-lg">
                          <Zap size={8} />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-black tracking-tight",
                          isCurrentUser ? "text-gold" : "text-white"
                        )}>
                          {entry.displayName || "Anonymous Thinker"}
                        </span>
                        {isCurrentUser && <span className="text-[8px] font-black bg-gold text-navy px-1.5 py-0.5 rounded-full uppercase">You</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Building2 size={10} />
                          <span>{entry.organization || "Independent"}</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          status.color
                        )}>
                          {'icon' in status && status.icon}
                          <span>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-white tracking-tighter">{entry.score.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spark Score</div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-950/50 border-t border-white/5">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
            <AlertTriangle className="text-gold" size={16} />
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
              Social pressure is a feature, not a bug. <span className="text-gold">Cognitive Slacking</span> is detected and displayed to encourage immediate interrogation sprints.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
