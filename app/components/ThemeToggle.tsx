"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { useTheme } from "@/lib/hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Hover-expand theme toggle: shows active icon; on hover reveals 3 options.
 * Edge-safe client component; no localStorage reads (handled by next-themes).
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [dir, setDir] = useState<"left" | "right">("left"); // auto-flip on small viewports
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Show a neutral shell until the component is mounted to avoid
  // SSR/client icon or label mismatch.
  useEffect(() => setMounted(true), []);

  // Compute theme-dependent values only after mount.
  const active = mounted ? (theme ?? resolvedTheme ?? "system") : "system";

  const items: Array<{
    key: "light" | "dark" | "system";
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { key: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { key: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  const activeIcon = mounted
    ? active === "dark"
      ? <Moon className="h-4 w-4" />
      : active === "light"
        ? <Sun className="h-4 w-4" />
        : <Monitor className="h-4 w-4" />
    : null;

  function handleEnter() {
    // Compute available space; flip to right if not enough space on the left
    const el = rootRef.current;
    if (el && typeof window !== "undefined") {
      const rect = el.getBoundingClientRect();
      const optionSize = 32; // h-8 w-8
      const gap = 4; // ~gap-1
      const count = items.length;
      const margin = 8; // mr-1
      const needed = count * optionSize + (count - 1) * gap + margin;
      if (rect.left < needed) {
        setDir("right");
      } else if (window.innerWidth - rect.right < needed) {
        setDir("left");
      } else {
        setDir("left");
      }
    }
    setExpanded(true);
  }

  // Neutral shell on SSR and first hydration tick: no theme-specific icon/label.
  if (!mounted) {
    return (
      <div className="relative inline-flex items-center">
        <Button type="button" variant="ghost" size="icon" aria-label="Theme" className="shrink-0">
          <span className="inline-block h-4 w-4 opacity-0" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setExpanded(false)}
    >
      {/*
        Collapsed trigger.
        - added type="button" to avoid form submits.
        - Shows the current theme icon. No navigation or refresh.
      */}
      <Button type="button" variant="ghost" size="icon" aria-label={`Theme: ${active}`} className="shrink-0">
        {activeIcon}
      </Button>

      {/* Hover options. Client-only to avoid hydration issues. */}
      <div className="relative">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: dir === "left" ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir === "left" ? -8 : 8 }}
              transition={{ type: "tween", duration: 0.15 }}
              className={
                dir === "left"
                  ? "absolute right-full mr-1 top-1/2 -translate-y-1/2 flex gap-1"
                  : "absolute left-full ml-1 top-1/2 -translate-y-1/2 flex gap-1"
              } // expand left by default; flip when constrained
              role="menu"
              aria-label="Theme options"
            >
              {items.map((it) => (
                <Button
                  key={it.key}
                  variant={active === it.key ? "default" : "outline"}
                  size="icon"
                  aria-pressed={active === it.key}
                  aria-label={it.label}
                  type="button"
                  onClick={() => setTheme(it.key)}
                  className="h-8 w-8"
                >
                  {it.icon}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ThemeToggle;


