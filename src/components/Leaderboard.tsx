import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Users, Globe, Building2, School, X, ArrowUpRight, Zap, Award } from "lucide-react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../lib/utils";

interface LeaderboardUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  streak: number;
  score: number;
  organization?: string;
}

interface LeaderboardProps {
  onClose: () => void;
  currentUserId?: string;
}

type FilterType = "global" | "organization";

export function Leaderboard({ onClose, currentUserId }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<FilterType>("global");
  const [isLoading, setIsLoading] = useState(true);
  const [userOrg, setUserOrg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        let q = query(
          collection(db, "profiles"),
          orderBy("score", "desc"),
          limit(10)
        );

        if (filter === "organization" && userOrg) {
          q = query(
            collection(db, "profiles"),
            where("organization", "==", userOrg),
            orderBy("score", "desc"),
            limit(10)
          );
        }

        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as LeaderboardUser[];
        
        setUsers(fetchedUsers);

        // Find current user's org if not set
        if (!userOrg && currentUserId) {
          const currentUser = fetchedUsers.find(u => u.uid === currentUserId);
          if (currentUser?.organization) {
            setUserOrg(currentUser.organization);
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [filter, userOrg, currentUserId]);

  const getBadge = (streak: number) => {
    if (streak >= 30) return { icon: Award, color: "text-gold", label: "Gold" };
    if (streak >= 7) return { icon: Award, color: "text-slate-300", label: "Silver" };
    if (streak >= 3) return { icon: Award, color: "text-amber-600", label: "Bronze" };
    return null;
  };

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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-navy/5 dark:border-white/10"
      >
        <div className="p-8 sm:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-navy dark:bg-white text-white dark:text-navy flex items-center justify-center shadow-lg">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-navy dark:text-white font-serif">Thinker Rankings</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Survival of the Sharpest</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-navy/5 dark:hover:bg-white/5 text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-1 rounded-2xl bg-navy/5 dark:bg-white/5 border border-navy/5 dark:border-white/5 w-fit">
            <button
              onClick={() => setFilter("global")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === "global" ? "bg-white dark:bg-slate-800 text-navy dark:text-white shadow-sm" : "text-slate-400"
              )}
            >
              <Globe size={14} />
              <span>Global</span>
            </button>
            <button
              onClick={() => setFilter("organization")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === "organization" ? "bg-white dark:bg-slate-800 text-navy dark:text-white shadow-sm" : "text-slate-400"
              )}
            >
              <Building2 size={14} />
              <span>{userOrg || "Organization"}</span>
            </button>
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Neural Networks...</p>
              </div>
            ) : users.length > 0 ? (
              users.map((user, index) => {
                const badge = getBadge(user.streak);
                const isCurrentUser = user.uid === currentUserId;

                return (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group flex items-center gap-4 p-4 rounded-2xl border transition-all",
                      isCurrentUser 
                        ? "bg-gold/5 border-gold/20" 
                        : "bg-white dark:bg-slate-800/50 border-navy/5 dark:border-white/5 hover:border-gold/20"
                    )}
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-navy/5 dark:bg-white/5 text-xs font-black text-slate-400">
                      #{index + 1}
                    </div>
                    
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-navy/5 dark:border-white/10">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-navy dark:text-white font-black">
                          {user.displayName?.[0] || user.email?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-navy dark:text-white truncate">
                          {user.displayName || user.email.split('@')[0]}
                        </p>
                        {badge && (
                          <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5", badge.color)}>
                            <badge.icon size={10} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">{badge.label}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {user.organization || "Independent Thinker"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-gold">
                        <Zap size={14} />
                        <span className="text-sm font-black">{user.score}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {user.streak} Day Streak
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-4">
                <Users size={48} className="text-slate-200 dark:text-slate-800 mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Thinkers Found in this Sector</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-navy/5 dark:bg-white/5 border border-navy/5 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <ArrowUpRight size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-navy dark:text-white">Social Pressure Protocol</p>
                <p className="text-[10px] text-slate-500">Don't let your peers out-think you. Every spark counts.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
