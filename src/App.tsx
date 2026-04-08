import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence, stagger, useAnimate } from "motion/react";
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
  ShieldCheck,
  ShieldAlert,
  Loader2,
  LogIn,
  LogOut,
  History,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
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
  Trophy,
  Calendar,
  Hash,
  Download,
  X,
  BookOpen,
  Volume2,
  Settings,
  Play,
  Pause,
  Filter,
  Clock,
  Save,
  Trash2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { gemini, type CriticResponse, type MergeResponse, type ReconResponse, type AudioAnalysis, type DefaultSpark, type SocraticGenome, type ChatMessage } from "./services/gemini";
import { PulseMeter } from "./components/PulseMeter";
import { SocraticBox } from "./components/SocraticBox";
import { SparkInput } from "./components/SparkInput";
import { VerifiedBadge } from "./components/VerifiedBadge";
import { ShadowContainer } from "./components/ShadowContainer";
import { cn } from "./lib/utils";
import { auth, loginWithGoogle, logout, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, updateUserGenome } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, getDoc, serverTimestamp, limit, getDocs } from "firebase/firestore";
import { ThemeToggle } from "./components/ThemeToggle";

// Lazy Loaded Components for Performance
const LandingPage = lazy(() => import("./components/LandingPage").then(m => ({ default: m.LandingPage })));
const SparkLibrary = lazy(() => import("./components/SparkLibrary").then(m => ({ default: m.SparkLibrary })));
const ShareModal = lazy(() => import("./components/ShareModal").then(m => ({ default: m.ShareModal })));
const SparkCertificate = lazy(() => import("./components/SparkCertificate").then(m => ({ default: m.SparkCertificate })));
const Leaderboard = lazy(() => import("./components/Leaderboard").then(m => ({ default: m.Leaderboard })));
const SettingsModal = lazy(() => import("./components/SettingsModal").then(m => ({ default: m.SettingsModal })));
const AiVsHumanGame = lazy(() => import("./components/AiVsHumanGame").then(m => ({ default: m.AiVsHumanGame })));
const SocialShameLeaderboard = lazy(() => import("./components/SocialShameLeaderboard").then(m => ({ default: m.SocialShameLeaderboard })));

type Step = "input" | "auditing" | "interrogation" | "merging" | "review" | "verified";
type Theme = "light" | "dark";
type ThinkingModel = "Standard" | "Deep Dive" | "Creative Flow" | "Technical Precision";

interface ThoughtRecord {
  id: string;
  originalText: string;
  refinedText: string;
  pulseScore: number;
  createdAt: any;
}

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

  const [freeAttempts, setFreeAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("tt-free-attempts");
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
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
  const [showShareModal, setShowShareModal] = useState(false);
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
    organization: "",
    socraticGenome: null as SocraticGenome | null
  });
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const [showStreakReset, setShowStreakReset] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };
  const [lastHumanSpark, setLastHumanSpark] = useState("");
  const [sparkInput, setSparkInput] = useState("");
  const [showSparkLibrary, setShowSparkLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [organization, setOrganization] = useState("");
  const [ttsVoice, setTtsVoice] = useState("Kore");
  const [ttsAudio, setTtsAudio] = useState<string | null>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [orgInput, setOrgInput] = useState("");
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [useGrounding, setUseGrounding] = useState(false);
  const [chatFileData, setChatFileData] = useState<string | null>(null);
  const [chatFileMimeType, setChatFileMimeType] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [auditPhase, setAuditPhase] = useState<"recon" | "audit" | "sparks" | "idle">("idle");

  useEffect(() => {
    const draft = localStorage.getItem("tt-draft");
    if (draft) {
      setHasDraft(true);
    }
  }, []);

  const saveDraft = () => {
    const draftData = {
      step,
      aiText,
      critic,
      reconData,
      mergeResult,
      pulseScore,
      sparkInput,
      thinkingModel,
      useHighThinking,
      dialogueHistory,
      lastHumanSpark,
      inputMode,
      fileData,
      fileMimeType,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem("tt-draft", JSON.stringify(draftData));
    setHasDraft(true);
    // Optional: Show a brief toast or notification
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("tt-draft");
    if (draft) {
      const data = JSON.parse(draft);
      setStep(data.step);
      setAiText(data.aiText);
      setCritic(data.critic);
      setReconData(data.reconData);
      setMergeResult(data.mergeResult);
      setPulseScore(data.pulseScore);
      setSparkInput(data.sparkInput);
      setThinkingModel(data.thinkingModel);
      setUseHighThinking(data.useHighThinking);
      setDialogueHistory(data.dialogueHistory);
      setLastHumanSpark(data.lastHumanSpark);
      setInputMode(data.inputMode);
      setFileData(data.fileData);
      setFileMimeType(data.fileMimeType);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("tt-draft");
    setHasDraft(false);
  };
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);

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
              organization: data.organization || "",
              socraticGenome: data.socraticGenome || null
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
      orderBy('createdAt', 'desc'),
      limit(20)
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

    if (!user && freeAttempts >= 3) {
      setError("Free trial limit reached. Please create an account to continue.");
      setAuthMode("register");
      setIsEmailAuth(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStep("auditing");
    setAuditPhase("recon");
    setDefaultSparks([]);
    
    try {
      // Phase 1: Autonomous Reconnaissance
      const recon = await gemini.autonomousRecon(aiText);
      setReconData(recon);
      
      setAuditPhase("audit");
      // Phase 2: Strategic Audit with Socratic Genome
      const result = await gemini.auditAIText(aiText, thinkingModel, recon, userStats.socraticGenome || undefined, useHighThinking);
      setCritic(result);
      setPulseScore(100 - result.pulse_deduction);
      
      setAuditPhase("sparks");
      // Phase 3: Generate Default Sparks (Laziness Engineering)
      const sparks = await gemini.generateDefaultSparks(aiText, result.weak_point, result.socratic_hit);
      setDefaultSparks(sparks);
      
      setStep("interrogation");
      setAuditPhase("idle");
    } catch (err) {
      console.error("Audit failed:", err);
      setError("Failed to audit text. Please check your API key.");
      setStep("input");
      setAuditPhase("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpark = async (spark: string, isFinalize: boolean = false) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setLastHumanSpark(spark);
    
    try {
      const finalSpark = isFinalize ? `${spark} (Finalize this now, no more questions)` : spark;
      const result = await gemini.mergeSpark(
        aiText, 
        finalSpark, 
        thinkingModel, 
        dialogueHistory, 
        userStats.socraticGenome || undefined,
        inputMode,
        fileData || undefined,
        fileMimeType || undefined,
        isFinalize,
        useHighThinking
      );
      
      if (result.socratic_follow_up && !isFinalize) {
        // Socratic Loop: AI asks a follow-up
        setDialogueHistory(prev => [...prev, `User: ${spark}`, `AI: ${result.socratic_follow_up}`]);
        setCritic(prev => prev ? { ...prev, socratic_hit: result.socratic_follow_up! } : null);
        setSparkInput(""); // Clear input after successful spark
        // Stay in interrogation step
      } else if (result.refined_text) {
        // Show for review
        setMergeResult(result);
        setPulseScore(result.quality_score);
        setStep("review");
        
        // Generate Media if requested or relevant
        if (inputMode === "video" || inputMode === "image") {
          setIsGeneratingMedia(true);
          try {
            if (inputMode === "video") {
              const videoUrl = await gemini.generateVideo(result.refined_text, fileData || undefined, fileMimeType || undefined);
              setGeneratedVideoUrl(videoUrl);
            } else {
              const imageUrl = await gemini.generateImage(result.refined_text, fileData || undefined, fileMimeType || undefined);
              setGeneratedMusicUrl(imageUrl); // Reusing state for simplicity
            }
          } catch (e) {
            console.error("Media generation error:", e);
          } finally {
            setIsGeneratingMedia(false);
          }
        }

        // Auto-generate TTS in background
        try {
          const audio = await gemini.generateTTS(result.refined_text, ttsVoice);
          setTtsAudio(audio);
        } catch (e) {
          console.warn("TTS generation failed", e);
        }
      }
    } catch (err) {
      setError("Failed to process spark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() && !chatFileData) return;
    
    const userMessage: ChatMessage = { 
      role: "user", 
      text: text || (chatFileData ? "Analyze this file." : ""),
      inlineData: chatFileData && chatFileMimeType ? {
        data: chatFileData,
        mimeType: chatFileMimeType
      } : undefined
    };

    const newMessages: ChatMessage[] = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setIsChatLoading(true);
    setChatFileData(null);
    setChatFileMimeType(null);
    
    try {
      const response = await gemini.chat(newMessages, useHighThinking, useGrounding);
      setChatMessages(prev => [...prev, { role: "model", text: response }]);
    } catch (err) {
      setError("Chat connection lost.");
    } finally {
      setIsChatLoading(false);
    }
  };
  const handleChatFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      setChatFileData(base64);
      setChatFileMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmVerified = async () => {
    if (!user || !mergeResult) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update Streak & Stats
      const today = new Date().toISOString().split('T')[0];
      let newStreak = userStats.streak;
      let streakWasBroken = false;
      
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
          if (userStats.streak > 0) {
            streakWasBroken = true;
          }
          newStreak = 1;
        }
      }

      // Check for milestones
      if (newStreak === 3 && userStats.streak < 3) {
        setMilestoneMessage("Bronze Milestone Reached! 🥉");
        setTimeout(() => setMilestoneMessage(null), 4000);
      } else if (newStreak === 7 && userStats.streak < 7) {
        setMilestoneMessage("Silver Milestone Reached! 🥈");
        setTimeout(() => setMilestoneMessage(null), 4000);
      } else if (newStreak === 30 && userStats.streak < 30) {
        setMilestoneMessage("Gold Milestone Reached! 🥇");
        setTimeout(() => setMilestoneMessage(null), 4000);
      }

      if (streakWasBroken) {
        setShowStreakReset(true);
        setTimeout(() => setShowStreakReset(false), 2000);
      }
      
      // Calculate Score Gain
      const scoreGain = 100 + (newStreak * 50) + (mergeResult.quality_score * 2);
      const newTotalSparks = userStats.totalSparks + 1;

      // Socratic Genome Analysis (Every 5 verifications)
      let updatedGenome = userStats.socraticGenome;
      if (newTotalSparks >= 5 && newTotalSparks % 5 === 0) {
        try {
          const recentHistory = [...history, {
            id: 'temp',
            originalText: aiText,
            refinedText: mergeResult.refined_text,
            pulseScore: mergeResult.quality_score,
            createdAt: new Date()
          }].slice(-10); // Analyze last 10 for better context
          
          updatedGenome = await gemini.analyzeGenome(recentHistory);
          await updateUserGenome(user.uid, updatedGenome);
        } catch (e) {
          console.warn("Genome analysis failed", e);
        }
      }

      const newStats = {
        streak: newStreak,
        totalSparks: newTotalSparks,
        lastSparkDate: today,
        score: (userStats.score || 0) + scoreGain,
        organization: userStats.organization || "",
        socraticGenome: updatedGenome
      };
      setUserStats(newStats);

      // Persist to Firestore
      const userRef = doc(db, 'users', user.uid);
      const profileRef = doc(db, 'profiles', user.uid);
      
      await setDoc(userRef, { ...newStats, updatedAt: serverTimestamp() }, { merge: true });
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
        humanSpark: lastHumanSpark,
        refinedText: mergeResult.refined_text,
        pulseScore: mergeResult.quality_score,
        isPublic: true
      });
      
      setStep("verified");
      
      if (!user) {
        const newFreeAttempts = freeAttempts + 1;
        setFreeAttempts(newFreeAttempts);
        localStorage.setItem("tt-free-attempts", newFreeAttempts.toString());
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError("Failed to verify and save thought.");
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingTts(false);

    if (ttsAudio && ttsAudio.startsWith('data:')) {
      try {
        const parts = ttsAudio.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'audio/mpeg';
        const b64 = parts[1];
        const binaryString = window.atob(b64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        const url = URL.createObjectURL(blob);
        setTtsAudioUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error("Failed to create blob URL from TTS data:", e);
        setTtsAudioUrl(ttsAudio); // Fallback to data URL
      }
    } else {
      setTtsAudioUrl(ttsAudio);
    }
  }, [ttsAudio]);

  const handlePlayTts = () => {
    if (!ttsAudioUrl) return;

    if (isPlayingTts && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingTts(false);
    } else {
      if (!audioRef.current || audioRef.current.src !== ttsAudioUrl) {
        audioRef.current = new Audio(ttsAudioUrl);
        audioRef.current.onended = () => setIsPlayingTts(false);
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e);
          setIsPlayingTts(false);
        };
      }
      audioRef.current.play().catch(err => {
        console.error("Audio play failed:", err);
        setIsPlayingTts(false);
      });
      setIsPlayingTts(true);
    }
  };

  const handleUpdateGameScore = async (gameScore: number) => {
    if (!user) return;
    const newTotalScore = (userStats.score || 0) + gameScore;
    const updatedStats = { ...userStats, score: newTotalScore };
    setUserStats(updatedStats);
    
    const userRef = doc(db, 'users', user.uid);
    const profileRef = doc(db, 'profiles', user.uid);
    
    const updateData = { score: newTotalScore, updatedAt: serverTimestamp() };
    
    await Promise.all([
      setDoc(userRef, updateData, { merge: true }),
      setDoc(profileRef, {
        score: newTotalScore,
        updatedAt: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        organization: organization,
        streak: userStats.streak
      }, { merge: true })
    ]);
  };

  const handleUpdateOrganization = async (newOrg: string) => {
    if (!user) return;
    setOrganization(newOrg);
    
    const userRef = doc(db, 'users', user.uid);
    const profileRef = doc(db, 'profiles', user.uid);
    
    const updateData = { organization: newOrg, updatedAt: serverTimestamp() };
    
    await Promise.all([
      setDoc(userRef, updateData, { merge: true }),
      setDoc(profileRef, { 
        organization: newOrg, 
        updatedAt: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        score: userStats.score,
        streak: userStats.streak
      }, { merge: true })
    ]);
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
      await handleSpark(spark, true);
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
          setFileData(base64);
          setFileMimeType("audio/webm");
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
        setFileData(base64);
        setFileMimeType(file.type);
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
    setLastHumanSpark("");
    setSparkInput("");
    setTtsAudio(null);
    setIsPlayingTts(false);
    setMilestoneMessage(null);
    setShowStreakReset(false);
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

  if (showLanding) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Brain size={48} className="text-indigo-500 animate-pulse" />
        </div>
      }>
        <LandingPage 
          onStart={() => setShowLanding(false)} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          freeAttempts={freeAttempts}
          isLoggedIn={!!user}
        />
      </Suspense>
    );
  }

  if (!user && freeAttempts >= 3) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-navy dark:text-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-8 transition-colors duration-500">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gold/5 blur-[120px]" />
          <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-navy/5 blur-[120px]" />
        </div>
        
        <div className="relative z-10 space-y-6 w-full max-w-md">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="h-20 w-20 rounded-3xl bg-gold flex items-center justify-center text-navy shadow-2xl shadow-gold/20 mx-auto">
              <LockIcon size={40} />
            </div>
            <h2 className="text-3xl font-black font-serif">Free Trial Limit Reached</h2>
            <p className="text-slate-500 font-medium">You've used your 3 free Human Sparks. Create an account to unlock the full ThinkTank Protocol and build your Socratic Genome.</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-navy dark:bg-white px-8 py-4 text-white dark:text-navy font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="h-5 w-5" />
              <span>Continue with Google</span>
            </button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy/5 dark:border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400"><span className="bg-white dark:bg-slate-950 px-4">Or use email</span></div>
            </div>

            {!isEmailAuth ? (
              <button 
                onClick={() => setIsEmailAuth(true)}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-navy/10 dark:border-white/10 px-8 py-4 text-navy dark:text-white font-bold hover:bg-navy/5 dark:hover:bg-white/5 transition-all"
              >
                <Mail size={20} />
                <span>Use Email & Password</span>
              </button>
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
                  className="w-full rounded-2xl bg-gold py-4 text-sm font-black text-navy shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (authMode === 'login' ? 'Login to ThinkTank' : 'Create Your Account')}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-gold transition-colors"
                >
                  {authMode === 'login' ? "Need an account? Register" : "Already have an account? Login"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
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
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-24 w-24 rounded-full border-t-2 border-r-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="text-gold animate-pulse" size={32} />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center space-y-2"
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">Socratic Interceptor Active</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auditing Cognitive Integrity...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
              className="fixed inset-y-0 left-0 w-85 bg-slate-900/98 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <History size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Thought Vault</h2>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Socratic History</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* History Search */}
              <div className="px-6 py-4 border-b border-white/5">
                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" />
                  <input 
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search your sparks..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
              
              {/* History List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-600">
                        <Zap size={32} className="opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Vault Empty</p>
                        <p className="text-[10px] text-slate-600 font-medium">Your elite audits will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    // Grouping logic could be added here, but for now let's focus on visual catchiness
                      <div className="space-y-3">
                        {history
                          .filter(record => 
                            record.originalText.toLowerCase().includes(historySearch.toLowerCase()) ||
                            record.refinedText.toLowerCase().includes(historySearch.toLowerCase())
                          )
                          .map((record, index) => (
                          <motion.button
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => loadFromHistory(record)}
                            className="w-full text-left p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all group relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                  record.pulseScore > 90 ? "bg-emerald-500 shadow-emerald-500/50" : record.pulseScore > 70 ? "bg-gold shadow-gold/50" : "bg-red-500 shadow-red-500/50"
                                )} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{record.pulseScore}% Pulse</span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600">
                                <Clock size={10} />
                                <span>
                                  {record.createdAt?.toDate ? new Date(record.createdAt.toDate()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed group-hover:text-slate-200 transition-colors">
                              {record.originalText}
                            </p>
                            <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-gold uppercase tracking-widest">Restore Protocol</span>
                                <ArrowRight size={10} className="text-gold" />
                              </div>
                              {record.refinedText && (
                                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
                                  <CheckCircle2 size={8} />
                                  <span>Refined</span>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                        
                        {history.length >= 20 && (
                          <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-gold hover:border-gold/30 transition-all"
                          >
                            Access Full Vault History
                          </motion.button>
                        )}
                      </div>
                  )}
                </div>
              </div>
              
              {/* Sidebar Footer / Profile */}
              <div className="p-6 border-t border-white/5 bg-black/40 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-12 w-12 rounded-2xl border-2 border-white/10 shadow-xl" />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center text-white shadow-xl">
                        <UserIcon size={24} />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate tracking-tight">{user.displayName || user.email?.split('@')[0] || 'Elite User'}</p>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={10} className="text-gold" />
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{userStats.organization || 'Independent Thinker'}</p>
                    </div>
                  </div>
                </div>

                {/* Socratic Genome Bento */}
                {userStats.socraticGenome && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Socratic Genome</p>
                      <div className="px-2 py-0.5 rounded-md bg-gold/10 text-gold text-[8px] font-black uppercase tracking-widest">Level {Math.floor(userStats.score / 1000) + 1}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Fortitude</p>
                        <div className="flex flex-wrap gap-1">
                          {userStats.socraticGenome.strengths.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-400 truncate w-full">• {s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">Blindspots</p>
                        <div className="flex flex-wrap gap-1">
                          {userStats.socraticGenome.weaknesses.slice(0, 2).map((w, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-400 truncate w-full">• {w}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGame(true)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold transition-all"
                  >
                    <ShieldAlert size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Audit Game</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowLeaderboard(true);
                      setIsSidebarOpen(false);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold transition-all"
                  >
                    <Trophy size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Rankings</span>
                  </motion.button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-500/5 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-emerald-500/5 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              opacity: [0.05, 0.1, 0.05],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-gold/5 blur-[100px]" 
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 lg:py-24 space-y-12">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-slate-400 hover:text-navy dark:hover:text-white transition-colors"
              >
                <History size={20} />
              </motion.button>
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-navy shadow-lg shadow-gold/20"
                >
                  <Brain size={24} />
                </motion.div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter text-navy dark:text-white font-serif">ThinkTank <span className="text-gold">(T.T.)</span></h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Human Insight Protocol</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-slate-400 hover:text-navy dark:hover:text-white transition-all"
              >
                <MessageSquare size={12} className="text-gold" />
                <span className="hidden sm:inline">Cognitive Chat</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-slate-400 hover:text-navy dark:hover:text-white transition-all"
              >
                <Trophy size={12} className="text-gold" />
                <span className="hidden sm:inline">Rankings</span>
              </motion.button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {showStreakReset ? (
                    <motion.div
                      key="reset"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2 text-red-500"
                    >
                      <Zap size={12} />
                      <span>Streak Broken!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="streak"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Zap size={12} className={cn("text-gold", userStats.streak > 0 && "animate-pulse")} />
                      <span>{userStats.streak} Day Streak</span>
                      {badge && (
                        <motion.div 
                          key={badge.label}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          className={cn("flex items-center gap-1 ml-1", badge.color)}
                        >
                          <badge.icon size={10} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {step !== "input" && (
                <motion.button 
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={reset}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5 text-slate-400 hover:text-navy dark:hover:text-white transition-colors"
                >
                  <RefreshCcw size={18} />
                </motion.button>
              )}
            </div>
          </header>

          <AnimatePresence>
            {milestoneMessage && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gold text-navy font-black uppercase tracking-widest shadow-2xl shadow-gold/40 flex items-center gap-3"
              >
                <Award size={20} />
                {milestoneMessage}
              </motion.div>
            )}
          </AnimatePresence>

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
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-navy/5 dark:bg-white/5 border border-navy/5 dark:border-white/5 w-fit">
                    {["Standard", "Deep Dive", "Creative Flow", "Technical Precision"].map((model) => (
                      <motion.button
                        key={model}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setThinkingModel(model as ThinkingModel)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          thinkingModel === model 
                            ? "bg-gold text-navy shadow-lg shadow-gold/20" 
                            : "text-slate-400 hover:text-navy dark:hover:text-white"
                        )}
                      >
                        {model}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setUseHighThinking(!useHighThinking)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      useHighThinking 
                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                    )}
                  >
                    <Brain size={14} className={cn(useHighThinking && "animate-pulse")} />
                    <span>High Thinking Mode</span>
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      useHighThinking ? "bg-indigo-400 animate-pulse" : "bg-slate-600"
                    )} />
                  </motion.button>

                  {hasDraft && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadDraft}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg"
                      >
                        <History size={14} />
                        <span>Restore Draft</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearDraft}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shadow-lg"
                        title="Clear Draft"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  )}
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
                        <motion.label 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          htmlFor="image-upload"
                          className={cn(
                            "px-8 py-3 rounded-xl bg-navy dark:bg-white text-white dark:text-navy text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? "Processing..." : "Select Image"}
                        </motion.label>
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
                        <motion.label 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          htmlFor="pdf-upload"
                          className={cn(
                            "px-8 py-3 rounded-xl bg-navy dark:bg-white text-white dark:text-navy text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? "Processing..." : "Select PDF"}
                        </motion.label>
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
                        <motion.label 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          htmlFor="video-upload"
                          className={cn(
                            "px-8 py-3 rounded-xl bg-navy dark:bg-white text-white dark:text-navy text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? "Processing..." : "Select Video"}
                        </motion.label>
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
                        <motion.button
                          whileHover={aiText.trim() && !isLoading ? { scale: 1.05 } : {}}
                          whileTap={aiText.trim() && !isLoading ? { scale: 0.95 } : {}}
                          onClick={handleQuickVerify}
                          disabled={!aiText.trim() || isLoading}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl px-6 py-4 text-xs font-black transition-all border",
                            aiText.trim() && !isLoading
                              ? "bg-gold/10 text-gold border-gold/20 hover:bg-gold/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed"
                          )}
                        >
                          <Zap size={16} />
                          <span>Quick Verify</span>
                        </motion.button>

                        <motion.button
                          whileHover={aiText.trim() && !isLoading ? { scale: 1.05 } : {}}
                          whileTap={aiText.trim() && !isLoading ? { scale: 0.95 } : {}}
                          onClick={handleStartAudit}
                          disabled={!aiText.trim() || isLoading}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl px-10 py-4 text-sm font-black transition-all",
                            aiText.trim() && !isLoading
                              ? "bg-gold text-navy shadow-xl shadow-gold/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          <span>Audit Strategy</span>
                          <ArrowRight size={18} />
                        </motion.button>
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
                className="flex flex-col items-center justify-center py-24 space-y-12 text-center max-w-2xl mx-auto"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/20 blur-[100px] animate-pulse" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="relative h-32 w-32 rounded-[2.5rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl shadow-gold/10"
                  >
                    <Brain size={48} className={cn("text-gold", auditPhase !== "idle" && "animate-pulse")} />
                    
                    {/* Orbiting particles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                      >
                        <div 
                          className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                          style={{ transform: `translateY(-20px)` }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <div className="space-y-8 w-full">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">ThinkTank Protocol Active</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Adversarial Logic Interception in Progress</p>
                  </div>

                  <div className="grid gap-4 w-full">
                    {/* Phase 1: Recon */}
                    <div className={cn(
                      "p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group",
                      auditPhase === "recon" ? "bg-gold/5 border-gold/30 shadow-lg shadow-gold/5" : "bg-white/5 border-white/5 opacity-40"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl transition-colors", auditPhase === "recon" ? "bg-gold/20 text-gold" : "bg-white/10 text-slate-500")}>
                            <Search size={16} />
                          </div>
                          <span className={cn("text-xs font-black uppercase tracking-widest", auditPhase === "recon" ? "text-white" : "text-slate-500")}>Autonomous Reconnaissance</span>
                        </div>
                        <motion.div 
                          animate={auditPhase === "recon" ? { opacity: [0.4, 1, 0.4] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={cn("text-[10px] font-black uppercase tracking-widest", auditPhase === "recon" ? "text-gold" : "text-slate-600")}
                        >
                          {auditPhase === "recon" ? "Verifying Claims..." : auditPhase === "idle" ? "Pending" : "Complete"}
                        </motion.div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: auditPhase === "recon" ? "70%" : (auditPhase === "audit" || auditPhase === "sparks") ? "100%" : "0%" }}
                          transition={{ duration: 10, ease: "linear" }}
                          className={cn("h-full transition-all duration-500", auditPhase === "recon" ? "bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]" : "bg-emerald-500")}
                        />
                      </div>
                    </div>

                    {/* Phase 2: Audit */}
                    <div className={cn(
                      "p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group",
                      auditPhase === "audit" ? "bg-indigo-500/5 border-indigo-500/30 shadow-lg shadow-indigo-500/5" : "bg-white/5 border-white/5 opacity-40"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl transition-colors", auditPhase === "audit" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-slate-500")}>
                            <ShieldCheck size={16} />
                          </div>
                          <span className={cn("text-xs font-black uppercase tracking-widest", auditPhase === "audit" ? "text-white" : "text-slate-500")}>Strategic Audit</span>
                        </div>
                        <motion.div 
                          animate={auditPhase === "audit" ? { opacity: [0.4, 1, 0.4] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={cn("text-[10px] font-black uppercase tracking-widest", auditPhase === "audit" ? "text-indigo-400" : "text-slate-600")}
                        >
                          {auditPhase === "audit" ? "Detecting Flaws..." : (auditPhase === "sparks") ? "Complete" : "Pending"}
                        </motion.div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: auditPhase === "audit" ? "70%" : auditPhase === "sparks" ? "100%" : "0%" }}
                          transition={{ duration: 10, ease: "linear" }}
                          className={cn("h-full transition-all duration-500", auditPhase === "audit" ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : (auditPhase === "sparks") ? "bg-emerald-500" : "bg-slate-700")}
                        />
                      </div>
                    </div>

                    {/* Phase 3: Sparks */}
                    <div className={cn(
                      "p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group",
                      auditPhase === "sparks" ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5" : "bg-white/5 border-white/5 opacity-40"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl transition-colors", auditPhase === "sparks" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-500")}>
                            <Sparkles size={16} />
                          </div>
                          <span className={cn("text-xs font-black uppercase tracking-widest", auditPhase === "sparks" ? "text-white" : "text-slate-500")}>Laziness Engineering</span>
                        </div>
                        <motion.div 
                          animate={auditPhase === "sparks" ? { opacity: [0.4, 1, 0.4] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={cn("text-[10px] font-black uppercase tracking-widest", auditPhase === "sparks" ? "text-emerald-400" : "text-slate-600")}
                        >
                          {auditPhase === "sparks" ? "Generating Templates..." : "Pending"}
                        </motion.div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: auditPhase === "sparks" ? "100%" : "0%" }}
                          transition={{ duration: 5, ease: "linear" }}
                          className={cn("h-full transition-all duration-500", auditPhase === "sparks" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-700")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
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
                  <div className="flex items-center justify-between">
                    <PulseMeter score={pulseScore} />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveDraft}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold shadow-lg"
                    >
                      <Save size={16} />
                      <span>Save Draft</span>
                    </motion.button>
                  </div>
                  
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

                  {/* Strategic Audit Summary */}
                  <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      <ShieldCheck size={14} />
                      <span>Strategic Audit Summary</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Logic Summary</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{critic.summary}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Arguments</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {critic.core_arguments.map((arg, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                              <p className="text-xs text-slate-400 leading-relaxed">{arg}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    <div className="space-y-6">
                      <SocraticBox 
                        weakPoint={critic.weak_point}
                        fluffDetected={critic.fluff_detected}
                        socraticHit={critic.socratic_hit}
                      />

                      {defaultSparks.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suggested Human Sparks</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {defaultSparks.map((spark, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSparkInput(spark.template)}
                                className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-left space-y-1 group transition-all hover:border-gold/30"
                              >
                                <p className="text-[9px] font-black text-gold uppercase tracking-widest group-hover:text-gold transition-colors">{spark.label}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-200 transition-colors">{spark.template}</p>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      <SparkInput 
                        onSpark={handleSpark}
                        onQuickVerify={handleQuickVerify}
                        onShowLibrary={() => setShowSparkLibrary(true)}
                        isLoading={isLoading}
                        value={sparkInput}
                        onChange={setSparkInput}
                        defaultSparks={defaultSparks}
                        placeholder="Defend your logic. Add your Human Spark here..."
                      />

                      {dialogueHistory.length > 0 && (
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleSpark(lastHumanSpark, true)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                          >
                            <ShieldCheck size={16} />
                            <span>Confirm & Finalize Output</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}
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

            {step === "review" && mergeResult && (
              <motion.section
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-black text-white font-serif">Review Elite Output</h2>
                  <p className="text-slate-500 font-medium">Confirm the synthesis before final verification.</p>
                </div>

                <div className="relative rounded-3xl border border-gold/20 bg-slate-900/40 p-8 backdrop-blur-2xl space-y-6 shadow-2xl">
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-strong:text-gold">
                    <ReactMarkdown>{mergeResult.refined_text}</ReactMarkdown>
                  </div>
                  
                  {isGeneratingMedia && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <Loader2 className="animate-spin text-gold" size={32} />
                      <p className="text-xs font-black uppercase tracking-widest text-gold">Generating Multimodal Synthesis...</p>
                      <p className="text-[10px] text-slate-500 font-medium">This may take a moment for high-quality video</p>
                    </div>
                  )}

                  {generatedVideoUrl && (
                    <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <video src={generatedVideoUrl} controls className="w-full h-auto" />
                    </div>
                  )}

                  {generatedMusicUrl && (
                    <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img src={generatedMusicUrl} alt="Refined Synthesis" className="w-full h-auto" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={saveDraft}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 transition-all"
                  >
                    <Save size={18} />
                    <span>Save Draft</span>
                  </button>
                  <button
                    onClick={() => setStep("interrogation")}
                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 transition-all"
                  >
                    Back to Interrogation
                  </button>
                  <button
                    onClick={handleConfirmVerified}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 px-12 py-4 rounded-2xl bg-gold text-navy font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                    <span>Confirm & Verify</span>
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
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
                    {ttsAudio && (
                      <button 
                        onClick={handlePlayTts}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-bold shadow-lg"
                      >
                        {isPlayingTts ? <Pause size={14} /> : <Play size={14} />}
                        <span>{isPlayingTts ? "Stop" : "Listen"}</span>
                      </button>
                    )}
                    
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
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={saveDraft}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold shadow-lg"
                        title="Save Draft"
                      >
                        <Save size={16} />
                        <span>Save Draft</span>
                      </button>

                      <button 
                        onClick={() => setShowCertificate(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy/5 dark:bg-white/5 text-slate-500 hover:text-gold transition-all text-xs font-bold shadow-lg"
                      >
                        <Shield size={16} />
                        <span>Certificate</span>
                      </button>

                    <button 
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const url = await gemini.generateMusic(`An epic, cinematic anthem about: ${mergeResult.refined_text.slice(0, 100)}`);
                          setGeneratedMusicUrl(url);
                        } catch (e) {
                          console.error("Music generation failed", e);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-bold shadow-lg"
                    >
                      <Volume2 size={16} />
                      <span>Generate Anthem</span>
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-navy hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-gold/20"
                      >
                        <Send size={16} />
                        <span>Send</span>
                      </button>
                    </div>
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

                  {generatedVideoUrl && (
                    <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-2xl">
                      <video src={generatedVideoUrl} controls className="w-full h-auto" />
                    </div>
                  )}

                  {generatedMusicUrl && (
                    <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-4 relative z-10">
                      <div className="flex items-center gap-3 text-gold">
                        <Volume2 size={24} className="animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest">Socratic Anthem Generated</span>
                      </div>
                      <audio src={generatedMusicUrl} controls className="w-full" />
                    </div>
                  )}
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
          <Suspense fallback={null}>
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
          </Suspense>

          {/* Leaderboard Modal */}
          <Suspense fallback={null}>
            <AnimatePresence>
              {showLeaderboard && (
                <Leaderboard 
                  onClose={() => setShowLeaderboard(false)} 
                  currentUserId={user?.uid} 
                />
              )}
            </AnimatePresence>
          </Suspense>

          <Suspense fallback={null}>
            <AnimatePresence>
              {showSparkLibrary && (
                <SparkLibrary 
                  onSelect={(template) => {
                    setSparkInput(template);
                    setShowSparkLibrary(false);
                  }}
                  onClose={() => setShowSparkLibrary(false)}
                />
              )}
            </AnimatePresence>
          </Suspense>

          <Suspense fallback={null}>
            <AnimatePresence>
              {showShareModal && mergeResult && (
                <ShareModal 
                  text={mergeResult.refined_text}
                  onClose={() => setShowShareModal(false)}
                />
              )}
            </AnimatePresence>
          </Suspense>

          <Suspense fallback={null}>
            <AnimatePresence>
              {showGame && (
                <AiVsHumanGame 
                  onClose={() => setShowGame(false)} 
                  onUpdateScore={handleUpdateGameScore}
                />
              )}
            </AnimatePresence>
          </Suspense>

          <Suspense fallback={null}>
            <AnimatePresence>
              {showSettings && (
                <SettingsModal 
                  onClose={() => setShowSettings(false)}
                  theme={theme}
                  setTheme={setTheme}
                  ttsVoice={ttsVoice}
                  setTtsVoice={setTtsVoice}
                  organization={organization}
                  setOrganization={handleUpdateOrganization}
                  isInstallable={isInstallable}
                  onInstall={handleInstallApp}
                />
              )}
            </AnimatePresence>
          </Suspense>

          <Suspense fallback={null}>
            <AnimatePresence>
              {showLeaderboard && (
                <SocialShameLeaderboard 
                  onClose={() => setShowLeaderboard(false)}
                  currentUserUid={user?.uid}
                  userOrganization={organization}
                />
              )}
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
      {/* Cognitive Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl h-[80vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gold/10 text-gold">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Cognitive Assistant</h2>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Multi-Turn Socratic Dialogue</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setUseGrounding(!useGrounding)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border",
                      useGrounding ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-slate-500"
                    )}
                  >
                    <Search size={10} />
                    <span>Grounding</span>
                  </button>
                  <button onClick={() => setShowChat(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Brain size={48} className="text-slate-600" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Assistant Ready</p>
                      <p className="text-[10px] font-medium text-slate-500">Ask me anything to refine your thinking.</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col max-w-[85%] space-y-2",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {msg.inlineData && (
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5 overflow-hidden max-w-[200px]">
                          {msg.inlineData.mimeType.startsWith("image/") ? (
                            <img 
                              src={`data:${msg.inlineData.mimeType};base64,${msg.inlineData.data}`} 
                              alt="Uploaded" 
                              className="w-full h-auto rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 text-[10px] font-bold text-slate-400">
                              <FileIcon size={14} />
                              <span className="truncate">{msg.inlineData.mimeType}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user" 
                          ? "bg-gold text-navy font-medium rounded-tr-none" 
                          : "bg-white/5 border border-white/5 text-slate-300 rounded-tl-none"
                      )}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                        {msg.role === "user" ? "Human" : "T.T. Assistant"}
                      </p>
                    </motion.div>
                  ))
                )}
                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-gold"
                  >
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Assistant is thinking...</span>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-white/5 bg-black/40 space-y-4">
                {chatFileData && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 w-fit">
                    {chatFileMimeType?.startsWith("image/") ? (
                      <img 
                        src={`data:${chatFileMimeType};base64,${chatFileData}`} 
                        alt="Preview" 
                        className="h-10 w-10 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-400">
                        <FileIcon size={16} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attachment Ready</span>
                      <button 
                        onClick={() => {
                          setChatFileData(null);
                          setChatFileMimeType(null);
                        }}
                        className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 text-left"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem("chat-input") as HTMLInputElement;
                    if (input.value.trim() || chatFileData) {
                      handleSendMessage(input.value);
                      input.value = "";
                    }
                  }}
                  className="relative flex items-center gap-3"
                >
                  <div className="relative flex-1 group">
                    <input 
                      name="chat-input"
                      type="text"
                      placeholder="Refine your thought protocol..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-14 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all"
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <input 
                        type="file" 
                        id="chat-file-upload" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChatFileUpload(file);
                        }}
                      />
                      <label 
                        htmlFor="chat-file-upload"
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-500 hover:text-gold hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Plus size={18} />
                      </label>
                    </div>
                    <button 
                      type="submit"
                      disabled={isChatLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-gold text-navy shadow-lg shadow-gold/20 hover:scale-105 active:scale-0.95 transition-all disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
