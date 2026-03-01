// Core Types for Zine App

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  color: string; // hex color for annotations
  created_at: string;
}

export interface Zine {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  release_day: number; // 1-28
}

export interface Membership {
  zine_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface Issue {
  id: string;
  zine_id: string;
  issue_number: number;
  month: string; // "2026-03"
  status: 'draft' | 'locked' | 'published';
  edit_deadline: string;
  release_date: string;
  created_at: string;
  cover_url?: string | null; // AI-generated cover
}

export interface Page {
  id: string;
  issue_id: string;
  user_id: string;
  page_number: number;
  content: PageContent;
  updated_at: string;
  status: 'draft' | 'ready';
}

export interface Annotation {
  id: string;
  page_id: string;
  user_id: string;
  type: 'highlight' | 'pen';
  path_data: string; // SVG path or point array
  color: string;
  created_at: string;
}

// Page Content Structure (stored as JSONB)
export interface PageContent {
  blocks: Block[];
  background: Background;
}

export type Block = ImageBlock | TextBlock | StickerBlock;

interface BaseBlock {
  id: string;
  position: { x: number; y: number };
  rotation: number;
  zIndex: number;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  size: { width: number; height: number };
  filter?: 'none' | 'bw' | 'warm' | 'faded';
  frame?: 'none' | 'polaroid';
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  style: 'sans' | 'serif' | 'handwritten' | 'typewriter';
  size: 'sm' | 'md' | 'lg' | 'xl';
  color: string;
}

export interface StickerBlock extends BaseBlock {
  type: 'sticker';
  stickerId: string;
  scale: number;
}

export interface Background {
  type: 'color' | 'texture' | 'gradient';
  value: string;
}

// Preset rotation snaps
export const ROTATION_SNAPS = [0, 2, -2, 5, -5, 12, -12, 45, -45, 90, -90];

// Font presets
export const TEXT_STYLES = {
  sans: { fontFamily: 'var(--font-sans)', label: 'Clean' },
  serif: { fontFamily: 'var(--font-serif)', label: 'Serif' },
  handwritten: { fontFamily: 'var(--font-hand)', label: 'Handwritten' },
  typewriter: { fontFamily: 'var(--font-mono)', label: 'Typewriter' },
} as const;

// Size presets
export const TEXT_SIZES = {
  sm: '0.875rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2.5rem',
} as const;

// Background palette options
export const BACKGROUND_COLORS = [
  '#f5f3eb', // warm white
  '#faf8f5', // cream
  '#e8e4dc', // kraft
  '#f0e6d3', // parchment
  '#e6ebe7', // sage tint
  '#e8e6ef', // lavender tint
  '#f5e6e0', // blush
  '#2d2d2d', // dark
] as const;
