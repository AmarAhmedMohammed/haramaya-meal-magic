import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert 24-hour time string (HH:MM) to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || typeof time24 !== 'string') return '';
  
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 0 becomes 12
  
  return `${hours}:${minutes} ${ampm}`;
}
