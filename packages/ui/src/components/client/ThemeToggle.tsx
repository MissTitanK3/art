// components/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Laptop, Moon, MoonStar, Sun, SunDim } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

export const THEME_OPTIONS = [
  { value: 'system', label: 'System', Icon: Laptop },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'lofi', label: 'Lo-Fi', Icon: SunDim },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'dim', label: 'Dim', Icon: MoonStar },
] as const;

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // avoid hydration mismatch

  const normalizedTheme = theme ?? 'system';
  const iconKey =
    normalizedTheme === 'system' ? resolvedTheme ?? 'system' : normalizedTheme;
  const ActiveIcon =
    THEME_OPTIONS.find((option) => option.value === iconKey)?.Icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn('h-9 w-9 rounded-2xl', className)}
          aria-label="Select theme"
        >
          <ActiveIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[9000] w-48">
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {theme === value ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
