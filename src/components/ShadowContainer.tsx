import * as React from "react";
const { useEffect, useRef, useState } = React;
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";

interface ShadowContainerProps {
  children: React.ReactNode;
  className?: string;
  theme?: "light" | "dark";
}

/**
 * ShadowContainer encapsulates its children within a Shadow DOM.
 * This prevents host website styles from leaking in and T.T. styles from leaking out.
 */
export function ShadowContainer({ children, className, theme }: ShadowContainerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRoot) {
      try {
        // Check if shadow root already exists to prevent re-attachment error
        let root = hostRef.current.shadowRoot;
        if (!root) {
          root = hostRef.current.attachShadow({ mode: "open" });
        }
        
        // Inject global styles into the shadow root
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((style) => {
          try {
            root.appendChild(style.cloneNode(true));
          } catch (e) {
            console.warn("Failed to clone style node", e);
          }
        });

        setShadowRoot(root);
      } catch (err) {
        console.error("Shadow DOM initialization failed", err);
      }
    }
  }, [shadowRoot]);

  return (
    <div ref={hostRef}>
      {shadowRoot && createPortal(
        <div className={cn(className, theme === "dark" && "dark")}>
          {children}
        </div>, 
        shadowRoot
      )}
    </div>
  );
}
