import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  className?: string;
}

export function ThemeToggle({ theme, toggleTheme, className }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
        "bg-white dark:bg-slate-900 border border-navy/5 dark:border-white/5",
        "text-slate-400 hover:text-navy dark:hover:text-white",
        "hover:scale-110 active:scale-95",
        className
      )}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-gold" />
          ) : (
            <Moon size={20} className="text-navy" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
