import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export const createSlug = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function timeAgo(date: Date | string | number) {
  const d = new Date(date);
  const now = new Date();

  const diff = (now.getTime() - d.getTime()) / 1000;
  const dayInSeconds = 60 * 60 * 24;

  // If more than 7 days old → return date
  if (diff > 7 * dayInSeconds) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Otherwise → relative time
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * dayInSeconds],
    ['month', 30 * dayInSeconds],
    ['week', 7 * dayInSeconds],
    ['day', dayInSeconds],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    const amount = Math.floor(diff / secondsInUnit);
    if (Math.abs(amount) >= 1) {
      return rtf.format(-amount, unit);
    }
  }

  return 'just now';
}
