import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// lib/helper_functions/truncate.ts
export function truncateWords(text: string, count: number): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= count) return text;
  return words.slice(0, count).join(" ") + "…";
}
