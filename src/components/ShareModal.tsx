import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Clipboard, 
  CheckCircle2,
  ArrowRight,
  Share2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ShareModalProps {
  text: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ text, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: "",
    subject: "ThinkTank Elite Output"
  });

  const [instagramCopied, setInstagramCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToInstagram = () => {
    handleCopy();
    setInstagramCopied(true);
    setTimeout(() => setInstagramCopied(false), 4000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${emailData.recipient}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(text)}`;
    window.open(mailtoUrl, "_blank");
    setShowEmailForm(false);
  };

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
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/10 text-gold">
              <Share2 size={20} />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Share Elite Output</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-2 gap-4"
              >
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
                >
                  <MessageCircle className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-xs font-bold text-white">WhatsApp</span>
                </button>

                <button
                  onClick={shareToTelegram}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all group"
                >
                  <Send className="text-sky-500 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-xs font-bold text-white">Telegram</span>
                </button>

                <button
                  onClick={shareToInstagram}
                  className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all group overflow-hidden"
                >
                  <Instagram className="text-pink-500 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-xs font-bold text-white">Instagram</span>
                  
                  <AnimatePresence>
                    {instagramCopied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-pink-600 text-[10px] font-black text-white p-2 text-center leading-tight"
                      >
                        COPIED! PASTE IN APP
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
                >
                  <Mail className="text-amber-500 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-xs font-bold text-white">Email</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  {copied ? (
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : (
                    <Clipboard className="text-slate-400 group-hover:text-white transition-colors" size={20} />
                  )}
                  <span className="text-xs font-bold text-white">{copied ? "Copied to Clipboard" : "Copy to Clipboard"}</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recipient Email</label>
                  <input 
                    required
                    type="email"
                    placeholder="colleague@example.com"
                    value={emailData.recipient}
                    onChange={(e) => setEmailData(prev => ({ ...prev, recipient: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</label>
                  <input 
                    required
                    type="text"
                    placeholder="ThinkTank Elite Output"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-xs hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Prepare Email</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Elite Synthesis Sharing Protocol Active</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
