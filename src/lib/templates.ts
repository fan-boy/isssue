// Page Templates for Simple Mode

export interface TemplateSlot {
  id: string;
  type: 'image' | 'text' | 'title';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  placeholder: string;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    align?: 'left' | 'center' | 'right';
    color?: string;
  };
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // emoji or icon
  background: string;
  slots: TemplateSlot[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'hero-photo',
    name: 'Hero Photo',
    description: 'One big photo with a caption',
    preview: '🖼️',
    background: '#FFFFFF',
    slots: [
      {
        id: 'main-image',
        type: 'image',
        position: { x: 40, y: 40 },
        size: { width: 320, height: 300 },
        placeholder: 'Tap to add photo',
      },
      {
        id: 'title',
        type: 'title',
        position: { x: 40, y: 360 },
        placeholder: 'Add a title',
        style: { fontSize: '28px', fontFamily: 'Georgia, serif', align: 'left' },
      },
      {
        id: 'caption',
        type: 'text',
        position: { x: 40, y: 400 },
        placeholder: 'Write your story here...',
        style: { fontSize: '16px', fontFamily: 'system-ui', align: 'left', color: '#666' },
      },
    ],
  },
  {
    id: 'photo-grid',
    name: 'Photo Grid',
    description: 'Four photos in a grid',
    preview: '🎞️',
    background: '#F5F3EB',
    slots: [
      {
        id: 'photo-1',
        type: 'image',
        position: { x: 30, y: 40 },
        size: { width: 150, height: 150 },
        placeholder: '+ Photo',
      },
      {
        id: 'photo-2',
        type: 'image',
        position: { x: 200, y: 40 },
        size: { width: 150, height: 150 },
        placeholder: '+ Photo',
      },
      {
        id: 'photo-3',
        type: 'image',
        position: { x: 30, y: 210 },
        size: { width: 150, height: 150 },
        placeholder: '+ Photo',
      },
      {
        id: 'photo-4',
        type: 'image',
        position: { x: 200, y: 210 },
        size: { width: 150, height: 150 },
        placeholder: '+ Photo',
      },
      {
        id: 'caption',
        type: 'text',
        position: { x: 30, y: 390 },
        placeholder: 'Add a caption for your photos...',
        style: { fontSize: '16px', fontFamily: 'system-ui', align: 'center', color: '#666' },
      },
    ],
  },
  {
    id: 'journal',
    name: 'Journal Entry',
    description: 'Classic journal with date and text',
    preview: '📝',
    background: '#FFFEF5',
    slots: [
      {
        id: 'date',
        type: 'title',
        position: { x: 40, y: 40 },
        placeholder: 'March 2026',
        style: { fontSize: '14px', fontFamily: 'system-ui', align: 'left', color: '#999' },
      },
      {
        id: 'title',
        type: 'title',
        position: { x: 40, y: 70 },
        placeholder: 'Title of your entry',
        style: { fontSize: '32px', fontFamily: 'Georgia, serif', align: 'left' },
      },
      {
        id: 'body',
        type: 'text',
        position: { x: 40, y: 120 },
        placeholder: 'Write about your month, what happened, how you\'re feeling, what you\'re looking forward to...',
        style: { fontSize: '18px', fontFamily: 'Georgia, serif', align: 'left', color: '#333' },
      },
      {
        id: 'small-image',
        type: 'image',
        position: { x: 240, y: 350 },
        size: { width: 120, height: 120 },
        placeholder: '+ Photo',
      },
    ],
  },
  {
    id: 'polaroid-stack',
    name: 'Polaroid Stack',
    description: 'Scattered polaroids with captions',
    preview: '📸',
    background: '#1A1A1A',
    slots: [
      {
        id: 'polaroid-1',
        type: 'image',
        position: { x: 40, y: 50 },
        size: { width: 140, height: 160 },
        placeholder: '+ Photo',
      },
      {
        id: 'polaroid-2',
        type: 'image',
        position: { x: 200, y: 80 },
        size: { width: 140, height: 160 },
        placeholder: '+ Photo',
      },
      {
        id: 'polaroid-3',
        type: 'image',
        position: { x: 100, y: 260 },
        size: { width: 140, height: 160 },
        placeholder: '+ Photo',
      },
      {
        id: 'caption',
        type: 'text',
        position: { x: 40, y: 450 },
        placeholder: 'What\'s the story?',
        style: { fontSize: '18px', fontFamily: '"Segoe Script", cursive', align: 'center', color: '#FFF' },
      },
    ],
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'A quote or thought that resonated',
    preview: '💬',
    background: '#F0EFEC',
    slots: [
      {
        id: 'quote',
        type: 'title',
        position: { x: 40, y: 150 },
        placeholder: '"Write your quote here..."',
        style: { fontSize: '28px', fontFamily: 'Georgia, serif', align: 'center' },
      },
      {
        id: 'attribution',
        type: 'text',
        position: { x: 40, y: 350 },
        placeholder: '— Author or Source',
        style: { fontSize: '16px', fontFamily: 'system-ui', align: 'center', color: '#888' },
      },
      {
        id: 'reflection',
        type: 'text',
        position: { x: 40, y: 420 },
        placeholder: 'Why this resonated with you...',
        style: { fontSize: '14px', fontFamily: 'system-ui', align: 'center', color: '#666' },
      },
    ],
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Photo on top, story below',
    preview: '📖',
    background: '#FFFFFF',
    slots: [
      {
        id: 'main-image',
        type: 'image',
        position: { x: 20, y: 20 },
        size: { width: 360, height: 220 },
        placeholder: 'Add your photo',
      },
      {
        id: 'title',
        type: 'title',
        position: { x: 30, y: 260 },
        placeholder: 'Give it a title',
        style: { fontSize: '24px', fontFamily: 'Georgia, serif', align: 'left' },
      },
      {
        id: 'story',
        type: 'text',
        position: { x: 30, y: 300 },
        placeholder: 'Tell the story behind this photo...',
        style: { fontSize: '16px', fontFamily: 'system-ui', align: 'left', color: '#444' },
      },
    ],
  },
  {
    id: 'list',
    name: 'List',
    description: 'A list of things (favorites, goals, etc)',
    preview: '📋',
    background: '#FFF8E7',
    slots: [
      {
        id: 'list-title',
        type: 'title',
        position: { x: 40, y: 50 },
        placeholder: 'This Month\'s...',
        style: { fontSize: '28px', fontFamily: 'Georgia, serif', align: 'left' },
      },
      {
        id: 'list-items',
        type: 'text',
        position: { x: 40, y: 100 },
        placeholder: '1. First thing\n2. Second thing\n3. Third thing\n4. Fourth thing\n5. Fifth thing',
        style: { fontSize: '18px', fontFamily: 'system-ui', align: 'left', color: '#333' },
      },
      {
        id: 'note',
        type: 'text',
        position: { x: 40, y: 400 },
        placeholder: 'Any extra thoughts...',
        style: { fontSize: '14px', fontFamily: '"Segoe Script", cursive', align: 'left', color: '#888' },
      },
    ],
  },
  {
    id: 'freeform',
    name: 'Blank Canvas',
    description: 'Start from scratch (Advanced)',
    preview: '✨',
    background: '#FFFFFF',
    slots: [],
  },
];
