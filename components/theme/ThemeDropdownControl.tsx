"use client";

// TODO: Mount ThemeDropdownControl inside the official Settings page once merged.
// The Navbar ThemeToggle remains the permanent quick-access control.

import type { ComponentType } from "react";
import { useTheme } from "@/lib/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export const runtime = "edge";

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeDropdownControl() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const active = (theme ?? resolvedTheme ?? "system") as ThemeOption["value"];
  const activeOption =
    themeOptions.find((option) => option.value === active) ?? themeOptions[2];
  const ActiveIcon = activeOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Theme selector"
          className="h-9 gap-2 px-3"
        >
          <ActiveIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{activeOption.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-1">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === active;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setTheme(option.value)}
              role="menuitemradio"
              aria-checked={isActive}
              className={isActive ? "font-semibold text-foreground" : ""}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-sm">{option.label}</span>
              <span
                aria-hidden="true"
                className={
                  isActive
                    ? "ml-2 h-2 w-2 rounded-full bg-primary"
                    : "ml-2 h-2 w-2 rounded-full border border-transparent"
                }
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeDropdownControl;
