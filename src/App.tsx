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
  CheckCircle2,
  LogIn,
  LogOut,
  History,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Image as ImageIcon,
  Mic,
  FileText,
  Mail,
  Lock as LockIcon,
  UserPlus,
  Plus,
  File as FileIcon,
  Video,
  Send,
  Share2,
  Twitter,
  Instagram,
  MessageCircle,
  MoreHorizontal,
  Award,
  Calendar,
  Hash,
  Download,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { gemini, type CriticResponse, type MergeResponse, type ReconResponse, type AudioAnalysis, type DefaultSpark } from "./services/gemini";
import { PulseMeter } from "./components/PulseMeter";
import { SocraticBox } from "./components/SocraticBox";
import { SparkInput } from "./components/SparkInput";
import { VerifiedBadge } from "./components/VerifiedBadge";
import { ShadowContainer } from "./components/ShadowContainer";
import { SparkCertificate } from "./components/SparkCertificate";
import { Leaderboard } from "./components/Leaderboard";
import { Trophy } from "lucide-react";
import { cn } from "./lib/utils";
import { auth, loginWithGoogle, logout, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

type Step = "input" | "auditing" | "interrogation" | "merging" | "verified";
type Theme = "light" | "dark";
type ThinkingModel = "Standard" | "Deep Dive" | "Creative Flow" | "Technical Precision";

interface ThoughtRecord {
  id: string;
  originalText: string;
  refinedText: string;
  pulseScore: number;
  createdAt: any;
}

import { LandingPage } from "./components/LandingPage";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("tt-theme") as Theme;
      if (saved) return saved;
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch (e) {
      console.warn("Theme initialization error:", e);
    }
    return "light";
  });

  const [thinkingModel, setThinkingModel] = useState<ThinkingModel>("Standard");
  const [step, setStep] = useState<Step>("input");
  const [aiText, setAiText] = useState("");
  const [critic, setCritic] = useState<CriticResponse | null>(null);
  const [reconData, setReconData] = useState<ReconResponse | null>(null);
  const [mergeResult, setMergeResult] = useState<MergeResponse | null>(null);
  const [pulseScore, setPulseScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ThoughtRecord[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "image" | "voice" | "pdf" | "video">("text");
  const [showInputMenu, setShowInputMenu] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<string[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isEmailAuth, setIsEmailAuth] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);
  const [defaultSparks, setDefaultSparks] = useState<DefaultSpark[]>([]);
  const [userStats, setUserStats] = useState({ 
    streak: 0, 
    totalSparks: 0, 
    lastSparkDate: "", 
    score: 0, 
    organization: "" 
  });
  const [showCertificate, setShowCertificate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastHumanSpark, setLastHumanSpark] = useState("");
  const [orgInput, setOrgInput] = useState("");
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Theme Persistence & OS Preference Listener
  useEffect(() => {
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Persist to localStorage
    try {
      localStorage.setItem("tt-theme", theme);
    } catch (e) {
      console.warn("Failed to save theme to localStorage:", e);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only follow system theme if user hasn't manually set one in this session's localStorage
      const hasManualPreference = localStorage.getItem("tt-theme");
      if (!hasManualPreference) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        setIsAuthReady(true);
        
        if (currentUser) {
          // Sync user profile
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: 'user',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            const data = userSnap.data();
            const stats = {
              streak: data.streak || 0,
              totalSparks: data.totalSparks || 0,
              lastSparkDate: data.lastSparkDate || "",
              score: data.score || 0,
              organization: data.organization || ""
            };
            setUserStats(stats);
            setOrgInput(data.organization || "");
            
            // Sync public profile
            await setDoc(doc(db, 'profiles', currentUser.uid), {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              streak: stats.streak,
              score: stats.score,
              organization: stats.organization,
              updatedAt: serverTimestamp()
            }, { merge: true });

            await setDoc(userRef, {
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // History Listener
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'thoughts'),
      where('ownerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ThoughtRecord[];
      setHistory(records);
    }, (err) => {
      console.error("History listener error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStartAudit = async () => {
    if (!aiText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setStep("auditing");
    
    try {
      // Phase 1: Autonomous Reconnaissance
      const recon = await gemini.autonomousRecon(aiText);
      setReconData(recon);
      
      // Phase 2: Strategic Audit
      const result = await gemini.auditAIText(aiText, thinkingModel, recon);
      setCritic(result);
      setPulseScore(100 - result.pulse_deduction);
      
      // Phase 3: Generate Default Sparks (Laziness Engineering)
      const sparks = await gemini.generateDefaultSparks(aiText);
      setDefaultSparks(sparks);
      
      setStep("interrogation");
    } catch (err) {
      console.error("Audit failed:", err);
      setError("Failed to audit text. Please check your API key.");
      setStep("input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpark = async (spark: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setLastHumanSpark(spark);
    
    try {
      const result = await gemini.mergeSpark(aiText, spark, thinkingModel, dialogueHistory);
      
      if (result.socratic_follow_up) {
        // Socratic Loop: AI asks a follow-up
        setDialogueHistory(prev => [...prev, `User: ${spark}`, `AI: ${result.socratic_follow_up}`]);
        setCritic(prev => prev ? { ...prev, socratic_hit: result.socratic_follow_up! } : null);
        // Stay in interrogation step
      } else if (result.refined_text) {
        // Final Output
        setStep("merging");
        setMergeResult(result);
        setPulseScore(result.quality_score);
        
        // Update Streak & Stats
        const today = new Date().toISOString().split('T')[0];
        let newStreak = userStats.streak;
        
        // Check if streak should reset or increment
        if (userStats.lastSparkDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (userStats.lastSparkDate === yesterdayStr) {
            newStreak += 1;
          } else if (userStats.lastSparkDate === "") {
            newStreak = 1;
          } else {
            // Missed a day - reset streak
            newStreak = 1;
          }
        }
        
        // Calculate Score Gain
        // Base: 100, Streak Bonus: streak * 50, Quality Bonus: pulse * 2
        const scoreGain = 100 + (newStreak * 50) + (result.quality_score * 2);
        
        const newStats = {
          streak: newStreak,
          totalSparks: userStats.totalSparks + 1,
          lastSparkDate: today,
          score: (userStats.score || 0) + scoreGain,
          organization: userStats.organization || ""
        };
        setUserStats(newStats);

        // Persist to Firestore
        const userRef = doc(db, 'users', user.uid);
        const profileRef = doc(db, 'profiles', user.uid);
        
        await setDoc(userRef, newStats, { merge: true });
        await setDoc(profileRef, {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          streak: newStats.streak,
          score: newStats.score,
          organization: newStats.organization,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        await gemini.saveThought({
          ownerUid: user.uid,
          originalText: aiText,
          socraticQuestion: critic?.socratic_hit || "",
          humanSpark: spark,
          refinedText: result.refined_text,
          pulseScore: result.quality_score,
          isPublic: true
        });
        
        setStep("verified");
      }
    } catch (err) {
      setError("Failed to process spark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (mergeResult) {
      try {
        await navigator.clipboard.writeText(mergeResult.refined_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn("Clipboard copy failed", err);
        setError("Failed to copy to clipboard. Please select and copy manually.");
      }
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.warn("Login failed or cancelled", err);
      setError("Login failed. Please try again.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (authMode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        // Profile sync happens in auth listener
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setStep("input");
      setAiText("");
      setCritic(null);
      setMergeResult(null);
    } catch (err) {
      console.warn("Logout failed", err);
    }
  };

  const handleQuickVerify = async () => {
    if (!aiText.trim()) return;
    setIsLoading(true);
    try {
      const spark = await gemini.quickVerify(aiText);
      await handleSpark(spark);
    } catch (err) {
      setError("Quick verify failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          setIsLoading(true);
          try {
            const analysis = await gemini.analyzeAudio(base64);
            setAudioAnalysis(analysis);
            setAiText(analysis.transcription);
            setInputMode("text");
          } catch (err) {
            setError("Audio analysis failed.");
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
      setRecorder(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const result = await gemini.processFile(base64, file.type, thinkingModel);
        setAiText(result);
        setInputMode("text");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File processing error:", err);
      setError("Failed to process file. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUpdateOrg = async () => {
    if (!user || !orgInput.trim()) return;
    setIsUpdatingOrg(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { organization: orgInput.trim() }, { merge: true });
      await setDoc(doc(db, 'profiles', user.uid), { organization: orgInput.trim(), updatedAt: serverTimestamp() }, { merge: true });
      setUserStats(prev => ({ ...prev, organization: orgInput.trim() }));
    } catch (err) {
      console.error("Failed to update organization:", err);
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const getBadge = (streak: number) => {
    if (streak >= 30) return { icon: Award, color: "text-gold", label: "Gold" };
    if (streak >= 7) return { icon: Award, color: "text-slate-300", label: "Silver" };
    if (streak >= 3) return { icon: Award, color: "text-amber-600", label: "Bronze" };
    return null;
  };

  const reset = () => {
    setStep("input");
    setAiText("");
    setCritic(null);
    setMergeResult(null);
    setPulseScore(0);
    setError(null);
    setDialogueHistory([]);
    setReconData(null);
  };

  const loadFromHistory = (record: ThoughtRecord) => {
    setAiText(record.originalText);
    setMergeResult({
      refined_text: record.refinedText,
      quality_score: record.pulseScore,
      human_spark_detected: true
    });
    setPulseScore(record.pulseScore);
    setStep("verified");
    setIsSidebarOpen(false);
  };

  const badge = getBadge(userStats.streak);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Brain size={48} className="text-indigo-500 animate-pulse" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Initializing Protocol...</p>
        </div>
      </div>
    );
  }

  if (showLanding && !user) {
    return <LandingPage onStart={() => setShowLanding(false)} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-navy dark:text-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-8 transition-colors duration-500">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gold/5 blur-[120px]" />
          <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-navy/5 blur-[120px]" />
        </div>
        
        <div className="relative z-10 space-y-6 w-full max-w-md">
          <button 
            onClick={toggleTheme}
            className="absolute -top-20 right-0 p-3 rounded-full bg-navy/5 dark:bg-white/5 text-navy dark:text-white"
          >
            {theme === "dark" ? <Sun size={20} className="text-gold" /> : <Moon size={20} />}
          </button>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gold text-navy shadow-[0_0_50px_rgba(212,175,55,0.3)] mx-auto"
          >
            <Brain size={40} />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-navy dark:text-white font-serif">ThinkTank <span className="text-gold">(T.T.)</span></h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">
              The elite standard for human-verified intelligence.
            </p>
          </div>
          
          <div className="pt-4 space-y-6">
            {!isEmailAuth ? (
              <div className="space-y-4">
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-navy dark:bg-white px-8 py-4 text-white dark:text-navy font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <LogIn size={20} />
                  <span>Login with Google</span>
                </button>
                <button 
                  onClick={() => setIsEmailAuth(true)}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-navy/10 dark:border-white/10 px-8 py-4 text-navy dark:text-white font-bold hover:bg-navy/5 dark:hover:bg-white/5 transition-all"
                >
                  <Mail size={20} />
                  <span>Use Email & Password</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-navy dark:text-white">{authMode === 'login' ? 'Login' : 'Register'}</h2>
                  <button 
                    type="button"
                    onClick={() => setIsEmailAuth(false)}
                    className="text-xs font-bold text-slate-400 hover:text-navy dark:hover:text-white"
                  >
                    Back
                  </button>
                </div>
                
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-navy/5 dark:bg-white/5 border border-transparent focus:border-gold outline-none text-navy dark:text-white transition-all"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-navy/5 dark:bg-white/5 border border-transparent focus:border-gold outline-none text-navy dark:text-white transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-navy/5 dark:bg-white/5 border border-transparent focus:border-gold outline-none text-navy dark:text-white transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-4 text-navy font-black shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCcw size={20} className="animate-spin" />
                  ) : (
                    <>
                      {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                      <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="ml-1 font-bold text-gold hover:underline"
                  >
                    {authMode === 'login' ? 'Register Now' : 'Login Here'}
                  </button>
                </p>
              </form>
            )}

            <button 
              onClick={() => setShowLanding(true)}
              className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-navy dark:hover:text-white transition-colors"
            >
              Back to Landing Page
            </button>
          </div>
          
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300 dark:text-slate-700 pt-8">
            Principal Architect Access Only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-navy dark:text-slate-200 selection:bg-gold/30 font-sans flex transition-colors duration-500">
      {/* Sidebar - Thinking History */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-indigo-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">Thinking History</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500">
                  <ChevronLeft size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                      <Zap size={24} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">No verified thoughts yet.<br/>Start your first audit.</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => loadFromHistory(record)}
                      className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{record.pulseScore}% Pulse</span>
                        <span className="text-[10px] text-slate-600">
                          {record.createdAt?.toDate ? new Date(record.createdAt.toDate()).toLocaleDateString() : 'Pending...'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                        {record.originalText}
                      </p>
                    </button>
                  ))
                )}
              </div>
              
              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 mb-4">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-10 w-10 rounded-xl border border-white/10" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{userStats.organization || 'Independent Thinker'}</p>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sector Assignment</p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={orgInput}
                      onChange={(e) => setOrgInput(e.target.value)}
                      placeholder="School, Company, Region"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                    />
                    <button 
                      onClick={handleUpdateOrg}
                      disabled={isUpdatingOrg || orgInput === userStats.organization}
                      className="px-3 py-2 rounded-xl bg-gold text-navy text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {isUpdatingOrg ? "..." : "Set"}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative">
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
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-slate-400 hover:text-navy dark:hover:text-white transition-colors"
              >
                <History size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-navy shadow-lg shadow-gold/20">
                  <Brain size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter text-navy dark:text-white font-serif">ThinkTank <span className="text-gold">(T.T.)</span></h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Human Insight Protocol</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-slate-400 hover:text-navy dark:hover:text-white transition-all"
              >
                <Trophy size={12} className="text-gold" />
                <span className="hidden sm:inline">Rankings</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Zap size={12} className={cn("text-gold", userStats.streak > 0 && "animate-pulse")} />
                <span>{userStats.streak} Day Streak</span>
                {badge && (
                  <div className={cn("flex items-center gap-1 ml-1", badge.color)}>
                    <badge.icon size={10} />
                  </div>
                )}
              </div>
              {step !== "input" && (
                <button 
                  onClick={reset}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-slate-400 hover:text-navy dark:hover:text-white transition-colors"
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
                  <h2 className="text-4xl font-black tracking-tight text-navy dark:text-white leading-tight font-serif">
                    Stop the <span className="text-gold">Cognitive Atrophy.</span>
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Paste your AI-generated content below. ThinkTank will audit it for generic slop and challenge you to add your unique human spark.
                  </p>
                </div>

                {/* Thinking Model Selector */}
                <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-navy/5 dark:bg-white/5 border border-navy/5 dark:border-white/5 w-fit">
                  {["Standard", "Deep Dive", "Creative Flow", "Technical Precision"].map((model) => (
                    <button
                      key={model}
                      onClick={() => setThinkingModel(model as ThinkingModel)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        thinkingModel === model 
                          ? "bg-gold text-navy shadow-lg shadow-gold/20" 
                          : "text-slate-400 hover:text-navy dark:hover:text-white"
                      )}
                    >
                      {model}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-gold to-navy rounded-3xl blur opacity-5 group-focus-within:opacity-10 transition duration-1000" />
                  <div className="relative rounded-3xl border border-navy/5 dark:border-white/10 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm overflow-hidden">
                    
                    {audioAnalysis && inputMode === "text" && (
                      <div className="px-6 pt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                          <CheckCircle2 size={12} />
                          <span>Clarity: {audioAnalysis.clarity_score}%</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                          <MessageSquare size={12} />
                          <span>Sentiment: {audioAnalysis.sentiment}</span>
                        </div>
                        <button 
                          onClick={() => setAudioAnalysis(null)}
                          className="ml-auto text-[10px] font-bold text-slate-400 hover:text-red-400 uppercase tracking-widest"
                        >
                          Clear Analysis
                        </button>
                      </div>
                    )}

                    {inputMode === "text" ? (
                      <textarea
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        placeholder="Paste AI text here (e.g., from ChatGPT)..."
                        className="w-full min-h-[240px] bg-transparent p-6 text-navy dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none resize-none text-lg leading-relaxed"
                      />
                    ) : inputMode === "image" ? (
                      <div className="w-full min-h-[240px] flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-gold/10 flex items-center justify-center text-gold">
                          <ImageIcon size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-navy dark:text-white">Upload Screenshot of AI Text</p>
                          <p className="text-xs text-slate-500">T.T. will extract the logical structure</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          id="image-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <label 
                          htmlFor="image-upload"
                          className={cn(
                            "px-8 py-3 rounded-xl bg-navy dark:bg-white text-white dark:text-navy text-xs font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all shadow-lg",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? "Processing..." : "Select Image"}
                        </label>
                      </div>
                    ) : inputMode === "pdf" ? (
                      <div className="w-full min-h-[240px] flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-gold/10 flex items-center justify-center text-gold">
                          <FileIcon size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-navy dark:text-white">Upload PDF Document</p>
                          <p className="text-xs text-slate-500">T.T. will audit the document's logic</p>
                        </div>
                        <input 
                          type="file" 
                          accept=".pdf"
                          className="hidden" 
                          id="pdf-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <label 
                          htmlFor="pdf-upload"
                          className={cn(
                            "px-8 py-3 rounded-xl bg-navy dark:bg-white text-white dark:text-navy text-xs font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all shadow-lg",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? "Processing..." : "Select PDF"}
                        </label>
                      </div>
                    ) : inputMode === "video" ? (
                      <div className="w-full min-h-[240px] flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-gold/10 flex items-center justify-center text-gold">
                          <Video size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-navy dark:text-white">Upload Video Source</p>
                          <p className="text-xs text-slate-500">T.T. will analyze the transcript and visual cues</p>
                        </div>
                        <input 
                          type="file" 
                          accept="video/*"
                          className="hidden" 
                          id="video-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <label 
                          htmlFor="video-upload"
                          className={cn(
                            "px-8 py-3 rounded-xl bg-navy dark:bg-white text-white dark:text-navy text-xs font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all shadow-lg",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? "Processing..." : "Select Video"}
                        </label>
                      </div>
                    ) : (
                      <div className="w-full min-h-[240px] flex flex-col items-center justify-center p-12 space-y-4">
                        <motion.div 
                          animate={isRecording ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={cn(
                            "h-16 w-16 rounded-3xl flex items-center justify-center text-gold transition-colors",
                            isRecording ? "bg-red-500/10 text-red-500" : "bg-gold/10"
                          )}
                        >
                          <Mic size={32} />
                        </motion.div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-navy dark:text-white">
                            {isRecording ? "Listening to AI Output..." : "Dictate AI Content"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isRecording ? "T.T. is capturing the audio stream" : "Speak the AI output to audit it"}
                          </p>
                        </div>
                        <button 
                          onClick={isRecording ? stopRecording : startRecording}
                          className={cn(
                            "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg",
                            isRecording ? "bg-red-500 text-white" : "bg-gold text-navy"
                          )}
                        >
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-6 border-t border-navy/5 dark:border-white/5 bg-navy/[0.02] dark:bg-white/[0.02]">
                      <div className="relative">
                        <button
                          onClick={() => setShowInputMenu(!showInputMenu)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 dark:bg-white/5 text-slate-400 hover:text-gold transition-all"
                        >
                          <Plus size={20} className={cn("transition-transform", showInputMenu && "rotate-45")} />
                        </button>
                        
                        <AnimatePresence>
                          {showInputMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-4 w-48 bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                            >
                              {[
                                { id: "text", icon: FileText, label: "Text Audit" },
                                { id: "image", icon: ImageIcon, label: "Image Recon" },
                                { id: "pdf", icon: FileIcon, label: "PDF Document" },
                                { id: "video", icon: Video, label: "Video Source" },
                                { id: "voice", icon: Mic, label: "Voice Capture" }
                              ].map((mode) => (
                                <button
                                  key={mode.id}
                                  onClick={() => {
                                    setInputMode(mode.id as any);
                                    setShowInputMenu(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all",
                                    inputMode === mode.id 
                                      ? "bg-gold/10 text-gold" 
                                      : "text-slate-500 hover:bg-navy/5 dark:hover:bg-white/5 hover:text-navy dark:hover:text-white"
                                  )}
                                >
                                  <mode.icon size={16} />
                                  <span>{mode.label}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Zap size={14} className="text-gold" />
                          <span>Protocol: {thinkingModel}</span>
                        </div>
                        <button
                          onClick={handleStartAudit}
                          disabled={!aiText.trim() || isLoading}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl px-10 py-4 text-sm font-black transition-all",
                            aiText.trim() && !isLoading
                              ? "bg-gold text-navy shadow-xl shadow-gold/20 hover:scale-105 active:scale-95"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          <span>Audit Quality</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
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
                  <div className="absolute inset-0 bg-gold/20 blur-3xl animate-pulse" />
                  <div className="relative h-24 w-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center">
                    <History size={48} className="text-gold animate-spin-slow" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white dark:text-white">Autonomous Reconnaissance...</h2>
                  <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">T.T. is verifying claims and searching for logical gaps</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-1/2 bg-gold"
                    />
                  </div>
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
                <ShadowContainer className="space-y-8" theme={theme}>
                  <PulseMeter score={pulseScore} />
                  
                  {/* Recon Findings */}
                  {reconData && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Zap size={14} className="text-gold" />
                        <span>Autonomous Recon Findings</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-navy/5 dark:border-white/5 space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grounding Summary</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{reconData.summary}</p>
                        </div>
                        
                        {reconData.contradictions.length > 0 && (
                          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2">
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Hallucinations Detected</p>
                            <ul className="space-y-1">
                              {reconData.contradictions.map((c, i) => (
                                <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                                  <span className="mt-1 h-1 w-1 rounded-full bg-red-400 shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {reconData.sources.map((source, i) => (
                          <a 
                            key={i}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                          >
                            <History size={12} />
                            <span>{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-8">
                    <div className="space-y-6">
                      <SocraticBox 
                        weakPoint={critic.weak_point}
                        fluffDetected={critic.fluff_detected}
                        socraticHit={critic.socratic_hit}
                      />

                      {/* Default Sparks (Laziness Engineering) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Sparks (Lazy Path)</p>
                          <button 
                            onClick={handleQuickVerify}
                            disabled={isLoading}
                            className="text-[10px] font-black uppercase tracking-widest text-gold hover:underline disabled:opacity-50"
                          >
                            Quick Verify (1-Click)
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {defaultSparks.map((spark, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSpark(spark.template)}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-xl bg-navy/5 dark:bg-white/5 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-navy dark:text-white hover:bg-gold hover:text-navy transition-all"
                            >
                              {spark.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <SparkInput 
                      onSpark={handleSpark}
                      isLoading={isLoading}
                      placeholder="Defend your logic. Add your Human Spark here..."
                    />
                  </div>
                </ShadowContainer>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <VerifiedBadge 
                    score={pulseScore} 
                    timestamp={new Date().toLocaleTimeString()} 
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopy}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg",
                        copied ? "bg-emerald-600 text-white" : "bg-navy/5 dark:bg-white/5 text-slate-500 hover:text-gold"
                      )}
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    
                    <button 
                      onClick={() => setShowCertificate(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy/5 dark:bg-white/5 text-slate-500 hover:text-gold transition-all text-xs font-bold shadow-lg"
                    >
                      <Shield size={16} />
                      <span>Certificate</span>
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-navy hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-gold/20"
                      >
                        <Send size={16} />
                        <span>Send</span>
                      </button>
                      
                      <AnimatePresence>
                        {showShareMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                          >
                            {[
                              { id: "whatsapp", icon: MessageCircle, label: "WhatsApp", color: "text-emerald-500" },
                              { id: "telegram", icon: Send, label: "Telegram", color: "text-sky-500" },
                              { id: "instagram", icon: Instagram, label: "Instagram", color: "text-pink-500" },
                              { id: "email", icon: Mail, label: "Email", color: "text-amber-500" }
                            ].map((platform) => (
                              <button
                                key={platform.id}
                                onClick={() => {
                                  const text = encodeURIComponent(mergeResult.refined_text);
                                  let url = "";
                                  if (platform.id === "whatsapp") url = `https://wa.me/?text=${text}`;
                                  if (platform.id === "telegram") url = `https://t.me/share/url?url=${text}`;
                                  if (platform.id === "instagram") {
                                    alert("Instagram direct sharing is limited. Text copied to clipboard for your story/post.");
                                    handleCopy();
                                    return;
                                  }
                                  if (platform.id === "email") url = `mailto:?subject=ThinkTank Elite Output&body=${text}`;
                                  
                                  if (url) window.open(url, "_blank");
                                  setShowShareMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-500 hover:bg-navy/5 dark:hover:bg-white/5 hover:text-navy dark:hover:text-white transition-all"
                              >
                                <platform.icon size={16} className={platform.color} />
                                <span>{platform.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                
                <div className="relative rounded-3xl border border-emerald-500/20 bg-slate-900/40 p-8 backdrop-blur-2xl space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.05),inset_0_0_20px_rgba(16,185,129,0.02)] overflow-hidden group">
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
                  <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
                      <MessageSquare size={14} />
                      <span>Elite Output</span>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <Sparkles size={12} />
                    </div>
                  </div>
                  
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-strong:text-emerald-400 relative z-10">
                    <ReactMarkdown>{mergeResult.refined_text}</ReactMarkdown>
                  </div>
                </div>

                {/* Strategic Foresight Engine */}
                {mergeResult.foresight && (
                  <div className="space-y-6 pt-8 border-t border-navy/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                        <Zap size={18} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-navy dark:text-white">Strategic Foresight Engine</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <ArrowRight size={14} />
                          <span>Next Moves</span>
                        </div>
                        <ul className="space-y-2">
                          {mergeResult.foresight.next_moves.map((move, i) => (
                            <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              {move}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
                          <AlertCircle size={14} />
                          <span>Potential Risks</span>
                        </div>
                        <ul className="space-y-2">
                          {mergeResult.foresight.potential_risks.map((risk, i) => (
                            <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                              <span className="text-red-500 font-bold">•</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 rounded-2xl bg-gold/5 border border-gold/10 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest">
                          <Shield size={14} />
                          <span>Requirements</span>
                        </div>
                        <ul className="space-y-2">
                          {mergeResult.foresight.resource_requirements.map((req, i) => (
                            <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                              <span className="text-gold font-bold">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl border border-navy/10 dark:border-white/10 text-slate-400 hover:text-navy dark:hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    <RefreshCcw size={16} />
                    <span>New Audit Protocol</span>
                  </button>
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
          {/* Certificate Modal */}
          <AnimatePresence>
            {showCertificate && mergeResult && (
              <SparkCertificate 
                user={user}
                originalText={aiText}
                humanSpark={lastHumanSpark}
                refinedText={mergeResult.refined_text}
                qualityScore={mergeResult.quality_score}
                onClose={() => setShowCertificate(false)}
              />
            )}
          </AnimatePresence>

          {/* Leaderboard Modal */}
          <AnimatePresence>
            {showLeaderboard && (
              <Leaderboard 
                onClose={() => setShowLeaderboard(false)} 
                currentUserId={user?.uid} 
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
