import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Classname utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation Transitions (per Adi's notes)
export const transitions = {
  // Ease-out-quint - use for most UI interactions
  easeOutQuint: {
    type: 'tween' as const,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    duration: 0.4,
  },

  // Page turn - paper feel
  pageTurn: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },

  // Sticker drop - playful bounce
  stickerDrop: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
  },

  // Quick snap
  snap: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 35,
  },
};

// Page flip variants for Framer Motion
export const pageVariants = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    rotateY: direction < 0 ? 90 : -90,
    opacity: 0,
  }),
};

// Generate unique ID
export function generateId(prefix: string = 'block'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Snap rotation to nearest preset
export function snapRotation(rotation: number, snaps: number[] = [0, 2, -2, 5, -5, 12, -12, 45, -45, 90, -90]): number {
  const threshold = 3; // degrees
  for (const snap of snaps) {
    if (Math.abs(rotation - snap) < threshold) {
      return snap;
    }
  }
  return rotation;
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Format date for display
export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Generate a random pleasing color for new users
export function generateUserColor(): string {
  const colors = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd',
    '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
    '#4db6ac', '#81c784', '#aed581', '#dce775',
    '#fff176', '#ffd54f', '#ffb74d', '#ff8a65',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate next release date from release_day (1-28)
export function getNextReleaseDate(releaseDay: number): Date {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), releaseDay);
  
  if (thisMonth > now) {
    return thisMonth;
  }
  // Next month
  return new Date(now.getFullYear(), now.getMonth() + 1, releaseDay);
}

// Format relative release date (e.g., "Mar 15" or "in 3 days")
export function formatReleaseDate(releaseDay: number): string {
  const releaseDate = getNextReleaseDate(releaseDay);
  const now = new Date();
  const diffDays = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `in ${diffDays} days`;
  
  return releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
