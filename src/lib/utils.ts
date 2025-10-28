import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(input: string | null | undefined): string {
  if (!input || !input.trim()) {
    return '?';
  }

  return input
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
