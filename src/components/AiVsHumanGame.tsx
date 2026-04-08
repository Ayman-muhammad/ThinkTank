import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap,
  RotateCcw,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { gemini, type GameChallenge } from '../services/gemini';
import { cn } from '../lib/utils';

interface AiVsHumanGameProps {
  onClose: () => void;
  onUpdateScore: (score: number) => void;
}

export const AiVsHumanGame: React.FC<AiVsHumanGameProps> = ({ onClose, onUpdateScore }) => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [challenge, setChallenge] = useState<GameChallenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const newChallenge = await gemini.generateChallenge();
      setChallenge(newChallenge);
      setTimeLeft(30);
      setSelectedOption(null);
      setIsCorrect(null);
    } catch (error) {
      console.error("Failed to fetch challenge", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(1);
    fetchChallenge();
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null || timeLeft === 0) return;
    
    setSelectedOption(index);
    const correct = index === challenge?.correct_index;
    setIsCorrect(correct);
    
    if (correct) {
      const points = Math.ceil(timeLeft * 10);
      setScore(prev => prev + points);
    }
  };

  const nextRound = () => {
    if (round >= 5) {
      setGameState('result');
      onUpdateScore(score);
    } else {
      setRound(prev => prev + 1);
      fetchChallenge();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && selectedOption === null) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedOption === null && gameState === 'playing') {
      setIsCorrect(false);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedOption]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/10 text-gold">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest">AI vs Human</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Flaw Detection Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {gameState === 'lobby' && (
              <motion.div 
                key="lobby"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8 py-12"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
                  <Trophy size={80} className="text-gold relative z-10 mx-auto" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ready for the Audit?</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                    Identify the logical fallacy in the AI-generated text before the timer runs out. 
                    Faster audits earn higher scores.
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-12 py-4 rounded-2xl bg-gold text-navy font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20"
                >
                  Initiate Audit
                </motion.button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Bar */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                      <Timer size={14} className={cn(timeLeft < 10 ? "text-red-500 animate-pulse" : "text-gold")} />
                      <span className={cn("text-xs font-black tabular-nums", timeLeft < 10 ? "text-red-500" : "text-white")}>
                        00:{timeLeft.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Round <span className="text-white">{round}</span>/5
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-gold" />
                    <span className="text-xs font-black text-white tabular-nums">{score}</span>
                  </div>
                </div>

                {/* Challenge Text */}
                <div className="relative p-8 rounded-3xl bg-slate-950/50 border border-white/5 min-h-[160px] flex items-center justify-center text-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="text-gold animate-spin" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Generating Flawed Logic...</p>
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-slate-200 leading-relaxed italic">
                      "{challenge?.flawed_text}"
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenge?.options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={selectedOption !== null || timeLeft === 0 || isLoading}
                      onClick={() => handleOptionClick(idx)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group",
                        selectedOption === null 
                          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-gold/30" 
                          : idx === challenge.correct_index 
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : selectedOption === idx 
                              ? "bg-red-500/20 border-red-500/50 text-red-400"
                              : "bg-white/5 border-white/10 opacity-40"
                      )}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-bold uppercase tracking-wide">{option}</span>
                        {selectedOption !== null && idx === challenge.correct_index && (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        )}
                        {selectedOption === idx && idx !== challenge.correct_index && (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback & Next */}
                <AnimatePresence>
                  {(selectedOption !== null || timeLeft === 0) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {isCorrect ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-white">
                            {isCorrect ? "Audit Successful" : timeLeft === 0 ? "Time Expired" : "Audit Failed"}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {challenge?.explanation}
                          </p>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={nextRound}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-navy font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
                      >
                        <span>{round >= 5 ? "Finalize Audit" : "Next Challenge"}</span>
                        <ArrowRight size={14} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-12"
              >
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Audit Complete</p>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Final Score: {score}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Accuracy</p>
                    <p className="text-xl font-black text-white">80%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-xl font-black text-white">Elite</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    <RotateCcw size={18} />
                    <span>Retry Audit</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gold text-navy font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20"
                  >
                    <span>Return to Base</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center">
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">ThinkTank Adversarial Training Module v1.0</p>
        </div>
      </motion.div>
    </div>
  );
};
