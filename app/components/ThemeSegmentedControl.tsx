"use client";

import type React from "react";
import { useMemo } from "react";
import { useTheme } from "@/lib/hooks/useTheme";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * Segmented control for theme preference using shadcn ToggleGroup.
 * Reads and writes to global theme via useTheme().
 */
export function ThemeSegmentedControl() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const value = useMemo(() => theme ?? (resolvedTheme as string) ?? "system", [theme, resolvedTheme]);

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && setTheme(v)}
      className="justify-start"
      aria-label="Theme preference"
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <Sun className="mr-2 h-4 w-4" /> Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <Moon className="mr-2 h-4 w-4" /> Dark
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System preference">
        <Monitor className="mr-2 h-4 w-4" /> System
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default ThemeSegmentedControl;



