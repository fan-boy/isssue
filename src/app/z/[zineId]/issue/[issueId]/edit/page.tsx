'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateId } from '@/lib/utils';
import type { Block, PageContent, ImageBlock, TextBlock, StickerBlock } from '@/lib/types';
import { BACKGROUND_COLORS, IMAGE_FRAMES, STICKERS, StickerCategory } from '@/lib/types';

// Constants
const initialContent: PageContent = {
  blocks: [],
  background: { type: 'color', value: '#FFFFFF' },
};

const FONT_STYLES = [
  { key: 'sans', label: 'Sans', fontFamily: 'system-ui, -apple-system, sans-serif' },
  { key: 'serif', label: 'Serif', fontFamily: 'Georgia, "Times New Roman", serif' },
  { key: 'handwritten', label: 'Hand', fontFamily: '"Segoe Script", "Bradley Hand", cursive' },
  { key: 'typewriter', label: 'Mono', fontFamily: '"SF Mono", "Courier New", monospace' },
] as const;

const FONT_SIZES = [
  { key: 'sm', label: 'S', size: '14px' },
  { key: 'md', label: 'M', size: '18px' },
  { key: 'lg', label: 'L', size: '24px' },
  { key: 'xl', label: 'XL', size: '36px' },
] as const;

const TEXT_ALIGNMENTS = [
  { key: 'left', icon: '⬅' },
  { key: 'center', icon: '⬌' },
  { key: 'right', icon: '➡' },
] as const;

const PROMPTS = [
  "What made you smile this month?",
  "A photo that tells a story...",
  "Something you learned recently",
  "A place you visited or want to visit",
  "What you're grateful for right now",
  "Something you made or created",
  "A moment you want to remember",
  "What's inspiring you lately?",
];

const MAX_HISTORY = 50;

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  const issueId = params.issueId as string;

  // State
  const [zineName, setZineName] = useState('');
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<'draft' | 'ready'>('draft');
  const [content, setContent] = useState<PageContent>(initialContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [stickerCategory, setStickerCategory] = useState<StickerCategory>('emotions');
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  
  // History for undo/redo
  const [history, setHistory] = useState<PageContent[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load page data
  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: zine } = await supabase.from('zines').select('name').eq('id', zineId).single();
      if (zine) setZineName(zine.name);

      const { data: page } = await supabase.from('pages').select('*').eq('issue_id', issueId).eq('user_id', user.id).single();
      if (page) {
        setPageId(page.id);
        setPageStatus(page.status || 'draft');
        if (page.content && typeof page.content === 'object') {
          const loadedContent = page.content as PageContent;
          setContent(loadedContent);
          setHistory([loadedContent]);
          setHistoryIndex(0);
        }
      }
    }
    loadData();
  }, [zineId, issueId, router]);

  // Update content with history
  const updateContent = useCallback((newContent: PageContent | ((prev: PageContent) => PageContent)) => {
    setContent(prev => {
      const updated = typeof newContent === 'function' ? newContent(prev) : newContent;
      
      if (!isUndoRedo.current) {
        setHistory(h => {
          const newHistory = h.slice(0, historyIndex + 1);
          newHistory.push(updated);
          if (newHistory.length > MAX_HISTORY) newHistory.shift();
          return newHistory;
        });
        setHistoryIndex(i => Math.min(i + 1, MAX_HISTORY - 1));
      }
      
      return updated;
    });
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      setHistoryIndex(i => i - 1);
      setContent(history[historyIndex - 1]);
      setTimeout(() => { isUndoRedo.current = false; }, 0);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex(i => i + 1);
      setContent(history[historyIndex + 1]);
      setTimeout(() => { isUndoRedo.current = false; }, 0);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Auto-save
  const saveContent = useCallback(async () => {
    if (!pageId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('pages').update({ content }).eq('id', pageId);
    setLastSaved(new Date());
    setSaving(false);
  }, [pageId, content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageId) saveContent();
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, pageId, saveContent]);

  const selectedBlock = content.blocks.find(b => b.id === selectedBlockId) || null;

  // Update a block
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    updateContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === blockId ? { ...b, ...updates } as Block : b
      ),
    }));
  }, [updateContent]);

  // Add text block
  const addTextBlock = (initialText?: string) => {
    const newBlock: TextBlock = {
      id: generateId('text'),
      type: 'text',
      content: initialText || 'Double-click to edit',
      style: 'sans',
      size: 'md',
      color: '#1A1A1A',
      align: 'left',
      position: { x: 50 + Math.random() * 150, y: 50 + Math.random() * 150 },
      rotation: 0,
      zIndex: content.blocks.length + 1,
    };
    updateContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
    if (initialText) setEditingBlockId(newBlock.id);
  };

  // Add image block
  const addImageBlock = async (file?: File) => {
    let imageUrl = '';
    if (file) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${generateId('img')}.${ext}`;
      const { data, error } = await supabase.storage.from('page-images').upload(path, file);
      if (error) { console.error('Upload error:', error); return; }
      const { data: urlData } = supabase.storage.from('page-images').getPublicUrl(data.path);
      imageUrl = urlData.publicUrl;
    }

    const newBlock: ImageBlock = {
      id: generateId('image'),
      type: 'image',
      src: imageUrl,
      size: { width: 200, height: 250 },
      position: { x: 80 + Math.random() * 100, y: 80 + Math.random() * 100 },
      rotation: 0,
      zIndex: content.blocks.length + 1,
      frame: 'polaroid',
    };
    updateContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
  };

  // Add sticker
  const addSticker = (emoji: string) => {
    const newBlock: StickerBlock = {
      id: generateId('sticker'),
      type: 'sticker',
      stickerId: emoji,
      scale: 1,
      position: { x: 100 + Math.random() * 150, y: 100 + Math.random() * 150 },
      rotation: 0,
      zIndex: content.blocks.length + 1,
    };
    updateContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
    setShowStickers(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImageBlock(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setBackground = (color: string) => {
    updateContent(prev => ({ ...prev, background: { type: 'color', value: color } }));
  };

  const deleteBlock = (id: string) => {
    updateContent(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
    setSelectedBlockId(null);
    setEditingBlockId(null);
  };

  const handleDone = async () => {
    await saveContent();
    router.push(`/z/${zineId}`);
  };

  const togglePageStatus = async () => {
    if (!pageId) return;
    const newStatus = pageStatus === 'draft' ? 'ready' : 'draft';
    const supabase = createClient();
    await supabase.from('pages').update({ status: newStatus }).eq('id', pageId);
    setPageStatus(newStatus);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <main className="h-screen h-[100dvh] bg-[#0a0a0a] flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Header */}
      <header className="bg-[#141414] border-b border-white/10 flex-shrink-0">
        <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link href={`/z/${zineId}`} className="text-white/50 hover:text-white text-sm flex-shrink-0">←</Link>
            <span className="text-white/80 text-sm truncate hidden sm:block">{zineName}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 mr-1 sm:mr-2">
              <button 
                onClick={undo} 
                disabled={!canUndo}
                className="p-1.5 sm:p-2 rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo (⌘Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 014 4v2M3 10l4-4M3 10l4 4" />
                </svg>
              </button>
              <button 
                onClick={redo} 
                disabled={!canRedo}
                className="p-1.5 sm:p-2 rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (⌘⇧Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a4 4 0 00-4 4v2M21 10l-4-4M21 10l-4 4" />
                </svg>
              </button>
            </div>
            
            <span className="text-white/40 text-xs hidden sm:block">
              {saving ? 'Saving...' : lastSaved ? '✓ Saved' : ''}
            </span>
            <button 
              onClick={togglePageStatus} 
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                pageStatus === 'ready' 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {pageStatus === 'ready' ? '✓ Ready' : 'Ready'}
            </button>
            <button onClick={handleDone} className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-white text-black rounded-lg text-xs md:text-sm font-medium hover:bg-white/90">
              Done
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Toolbar - Desktop sidebar */}
        <div className="hidden md:flex w-14 bg-[#141414] border-r border-white/10 flex-col items-center py-4 gap-2">
          <ToolBtn onClick={() => addTextBlock()} icon="T" label="Text" />
          <ToolBtn onClick={() => fileInputRef.current?.click()} icon="🖼" label="Image" />
          <ToolBtn onClick={() => setShowStickers(!showStickers)} icon="😊" label="Stickers" active={showStickers} />
          <div className="w-6 h-px bg-white/10 my-2" />
          <ToolBtn onClick={() => setShowPrompts(!showPrompts)} icon="💡" label="Ideas" active={showPrompts} />
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-8 pb-20 md:pb-8 overflow-auto relative bg-[#1a1a1a]">
          {/* Prompts Panel */}
          <AnimatePresence>
            {showPrompts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-4 w-64 sm:w-72 bg-[#242424] border border-white/10 rounded-xl p-4 sm:p-5 z-30"
              >
                <p className="text-sm text-white/50 mb-2">Need inspiration?</p>
                <p className="text-base sm:text-lg text-white mb-4">&quot;{PROMPTS[promptIndex]}&quot;</p>
                <div className="flex gap-2">
                  <button onClick={() => setPromptIndex((i) => (i + 1) % PROMPTS.length)} className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/5">
                    Another
                  </button>
                  <button onClick={() => { addTextBlock(PROMPTS[promptIndex]); setShowPrompts(false); }} className="flex-1 px-3 py-2 bg-white text-black rounded-lg text-sm font-medium">
                    Use This
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stickers Panel */}
          <AnimatePresence>
            {showStickers && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-4 md:left-20 w-64 sm:w-72 bg-[#242424] border border-white/10 rounded-xl p-4 z-30"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/50">Stickers</p>
                  <button onClick={() => setShowStickers(false)} className="text-white/40 hover:text-white">✕</button>
                </div>
                
                {/* Category tabs */}
                <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                  {(Object.keys(STICKERS) as StickerCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setStickerCategory(cat)}
                      className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                        stickerCategory === cat 
                          ? 'bg-white text-black' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Sticker grid */}
                <div className="grid grid-cols-5 gap-1">
                  {STICKERS[stickerCategory].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addSticker(emoji)}
                      className="aspect-square flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Canvas */}
          <div
            ref={canvasRef}
            className="w-full max-w-[85vw] sm:max-w-md md:max-w-lg lg:max-w-xl aspect-[3/4] rounded-lg shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: content.background.value }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedBlockId(null);
                setEditingBlockId(null);
              }
            }}
          >
            {content.blocks.map((block) => (
              <BlockComponent
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                isEditing={editingBlockId === block.id}
                canvasRef={canvasRef}
                onSelect={() => { setSelectedBlockId(block.id); setEditingBlockId(null); }}
                onStartEdit={() => setEditingBlockId(block.id)}
                onStopEdit={() => setEditingBlockId(null)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
              />
            ))}

            {content.blocks.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-8">
                <p className="text-2xl mb-2">📝</p>
                <p className="text-base sm:text-lg font-medium text-gray-500 mb-1">Your page is empty</p>
                <p className="text-xs sm:text-sm text-gray-400">Add text, images, or stickers</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-56 lg:w-64 bg-[#141414] border-l border-white/10 p-3 sm:p-4 overflow-y-auto hidden md:block">
          {/* Background */}
          <div className="mb-6">
            <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Background</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackground(color)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    content.background.value === color ? 'border-white scale-90' : 'border-transparent hover:border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Text Properties */}
          {selectedBlock?.type === 'text' && (
            <TextProperties 
              block={selectedBlock} 
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
              onDelete={() => deleteBlock(selectedBlock.id)}
            />
          )}

          {/* Image Properties */}
          {selectedBlock?.type === 'image' && (
            <ImageProperties 
              block={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
              onDelete={() => deleteBlock(selectedBlock.id)}
            />
          )}

          {/* Sticker Properties */}
          {selectedBlock?.type === 'sticker' && (
            <StickerProperties 
              block={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
              onDelete={() => deleteBlock(selectedBlock.id)}
            />
          )}
        </div>

        {/* Mobile Bottom Toolbar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-white/10 px-4 py-2.5 flex justify-center gap-3 z-20">
          <ToolBtn onClick={() => addTextBlock()} icon="T" label="Text" />
          <ToolBtn onClick={() => fileInputRef.current?.click()} icon="🖼" label="Image" />
          <ToolBtn onClick={() => setShowStickers(!showStickers)} icon="😊" label="Stickers" active={showStickers} />
          <ToolBtn onClick={() => setShowPrompts(!showPrompts)} icon="💡" label="Ideas" active={showPrompts} />
        </div>
      </div>
    </main>
  );
}

// Tool Button
function ToolBtn({ onClick, icon, label, active = false }: { onClick: () => void; icon: string; label: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg transition-colors ${
        active ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
    </button>
  );
}

// Text Properties Panel
function TextProperties({ 
  block, 
  onUpdate, 
  onDelete 
}: { 
  block: TextBlock;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="w-full h-px bg-white/10 mb-4" />
      <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Text Style</h3>
      
      {/* Font Style */}
      <div className="mb-4">
        <label className="text-xs text-white/40 block mb-2">Font</label>
        <div className="grid grid-cols-2 gap-1">
          {FONT_STYLES.map((style) => (
            <button
              key={style.key}
              onClick={() => onUpdate({ style: style.key as TextBlock['style'] })}
              className={`py-1.5 px-2 text-xs rounded transition-all ${
                block.style === style.key
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Font Size */}
      <div className="mb-4">
        <label className="text-xs text-white/40 block mb-2">Size</label>
        <div className="flex gap-1">
          {FONT_SIZES.map((size) => (
            <button
              key={size.key}
              onClick={() => onUpdate({ size: size.key as TextBlock['size'] })}
              className={`flex-1 py-1.5 text-xs rounded transition-all ${
                block.size === size.key
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div className="mb-4">
        <label className="text-xs text-white/40 block mb-2">Alignment</label>
        <div className="flex gap-1">
          {TEXT_ALIGNMENTS.map((align) => (
            <button
              key={align.key}
              onClick={() => onUpdate({ align: align.key as TextBlock['align'] })}
              className={`flex-1 py-1.5 text-xs rounded transition-all ${
                (block.align || 'left') === align.key
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {align.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-full py-2 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

// Image Properties Panel
function ImageProperties({ 
  block, 
  onUpdate, 
  onDelete 
}: { 
  block: ImageBlock;
  onUpdate: (updates: Partial<ImageBlock>) => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="w-full h-px bg-white/10 mb-4" />
      <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Image Frame</h3>
      
      {/* Frame Style */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-1">
          {IMAGE_FRAMES.map((frame) => (
            <button
              key={frame.key}
              onClick={() => onUpdate({ frame: frame.key as ImageBlock['frame'] })}
              className={`py-2 px-1 text-xs rounded transition-all flex flex-col items-center gap-1 ${
                (block.frame || 'polaroid') === frame.key
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <span>{frame.icon}</span>
              <span className="text-[10px]">{frame.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-full py-2 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

// Sticker Properties Panel
function StickerProperties({ 
  block, 
  onUpdate, 
  onDelete 
}: { 
  block: StickerBlock;
  onUpdate: (updates: Partial<StickerBlock>) => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="w-full h-px bg-white/10 mb-4" />
      <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Sticker</h3>
      
      {/* Scale */}
      <div className="mb-4">
        <label className="text-xs text-white/40 block mb-2">Size</label>
        <div className="flex gap-1">
          {[0.5, 0.75, 1, 1.5, 2].map((scale) => (
            <button
              key={scale}
              onClick={() => onUpdate({ scale })}
              className={`flex-1 py-1.5 text-xs rounded transition-all ${
                block.scale === scale
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {scale === 1 ? 'M' : scale < 1 ? 'S' : scale === 1.5 ? 'L' : 'XL'}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-full py-2 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

// Block Component
function BlockComponent({
  block,
  isSelected,
  isEditing,
  canvasRef,
  onSelect,
  onStartEdit,
  onStopEdit,
  onUpdate,
}: {
  block: Block;
  isSelected: boolean;
  isEditing: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localText, setLocalText] = useState(block.type === 'text' ? block.content : '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (block.type === 'text' && !isEditing) {
      setLocalText(block.content);
    }
  }, [block.type === 'text' ? block.content : '', isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = blockRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setIsDragging(true);
    onSelect();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width - 60, e.clientX - canvas.left - dragStart.x));
      const y = Math.max(0, Math.min(canvas.height - 60, e.clientY - canvas.top - dragStart.y));
      onUpdate({ position: { x, y } });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, canvasRef, onUpdate]);

  const handleTextBlur = () => {
    if (block.type === 'text') {
      onUpdate({ content: localText });
    }
    onStopEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleTextBlur();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTextBlur();
  };

  const getFontFamily = () => {
    if (block.type !== 'text') return 'inherit';
    return FONT_STYLES.find(s => s.key === block.style)?.fontFamily || 'inherit';
  };

  const getFontSize = () => {
    if (block.type !== 'text') return '18px';
    return FONT_SIZES.find(s => s.key === block.size)?.size || '18px';
  };

  const getTextAlign = () => {
    if (block.type !== 'text') return 'left';
    return block.align || 'left';
  };

  // Render frame styles for images
  const renderImageFrame = (imageBlock: ImageBlock) => {
    const frame = imageBlock.frame || 'polaroid';
    const { width = 200, height = 250 } = imageBlock.size || {};
    
    const frameStyles: Record<string, { container: string; inner: string }> = {
      none: { container: '', inner: 'rounded' },
      polaroid: { container: 'bg-white p-2 pb-8 shadow-lg rounded', inner: '' },
      rounded: { container: 'shadow-lg', inner: 'rounded-xl' },
      film: { container: 'bg-[#1a1a1a] p-1 shadow-lg', inner: 'border-2 border-[#333]' },
      torn: { container: 'bg-white p-2 shadow-lg', inner: 'border-4 border-white' },
    };
    
    const style = frameStyles[frame];
    
    return (
      <div className={style.container} style={frame === 'polaroid' || frame === 'torn' ? { width: width + 16 } : undefined}>
        {imageBlock.src ? (
          <img
            src={imageBlock.src}
            alt=""
            className={`object-cover pointer-events-none ${style.inner}`}
            style={{ width, height }}
            draggable={false}
          />
        ) : (
          <div
            className={`bg-gray-100 flex items-center justify-center text-gray-400 text-2xl ${style.inner}`}
            style={{ width, height }}
          >
            🖼
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={blockRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (block.type === 'text') onStartEdit();
      }}
      className={`absolute select-none ${isEditing ? 'cursor-text' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: block.position.x,
        top: block.position.y,
        transform: `rotate(${block.rotation}deg)`,
        zIndex: isSelected ? 100 : block.zIndex,
        outline: isSelected && !isEditing ? '2px solid #6366f1' : 'none',
        outlineOffset: '3px',
        borderRadius: '4px',
      }}
    >
      {block.type === 'text' && (
        isEditing ? (
          <textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleTextBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="bg-white border-2 border-indigo-500 p-3 min-w-[200px] min-h-[100px] resize outline-none rounded"
            style={{
              color: block.color,
              fontSize: getFontSize(),
              fontFamily: getFontFamily(),
              textAlign: getTextAlign(),
            }}
          />
        ) : (
          <div
            className="p-3 min-w-[60px] rounded hover:bg-black/5 whitespace-pre-wrap transition-colors"
            style={{
              color: block.color,
              fontSize: getFontSize(),
              fontFamily: getFontFamily(),
              textAlign: getTextAlign(),
            }}
          >
            {block.content}
          </div>
        )
      )}

      {block.type === 'image' && renderImageFrame(block)}

      {block.type === 'sticker' && (
        <div 
          className="select-none"
          style={{ 
            fontSize: `${3 * (block.scale || 1)}rem`,
            lineHeight: 1,
          }}
        >
          {block.stickerId}
        </div>
      )}
    </div>
  );
}
