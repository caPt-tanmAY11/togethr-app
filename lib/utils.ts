import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')                // Separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // Remove the accents
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/[^\w-]+/g, '')         // Remove all non-word chars
    .replace(/--+/g, '-')            // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start
    .replace(/-+$/, '');             // Trim - from end
}

// lib/utils.ts

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function getRandomColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
  ];

  // A simple hash to ensure the same name always gets the same color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function formatHackathonDates(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dayFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
  });

  const monthYearFormatter = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  });

  // same month & year
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${dayFormatter.format(startDate)}–${dayFormatter.format(
      endDate
    )} ${monthYearFormatter.format(startDate)}`;
  }

  // different months or years
  return `${dayFormatter.format(startDate)} ${monthYearFormatter.format(
    startDate
  )} – ${dayFormatter.format(endDate)} ${monthYearFormatter.format(endDate)}`;
}
