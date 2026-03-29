'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateId } from '@/lib/utils';
import type { Block, PageContent, ImageBlock, TextBlock, StickerBlock } from '@/lib/types';
import { BACKGROUND_COLORS, IMAGE_FRAMES, STICKERS, StickerCategory } from '@/lib/types';

// Layout definitions
const LAYOUTS = [
  { id: 'freeform', name: 'Blank', slots: [] as const },
  { id: 'hero', name: 'Hero', slots: [
    { type: 'image', x: 10, y: 8, w: 80, h: 50 },
    { type: 'title', x: 10, y: 62, w: 80, h: 8 },
    { type: 'text', x: 10, y: 72, w: 80, h: 20 },
  ]},
  { id: 'two-photos', name: 'Side by Side', slots: [
    { type: 'image', x: 8, y: 8, w: 40, h: 45 },
    { type: 'image', x: 52, y: 8, w: 40, h: 45 },
    { type: 'text', x: 8, y: 58, w: 84, h: 35 },
  ]},
  { id: 'grid', name: 'Grid', slots: [
    { type: 'image', x: 8, y: 8, w: 40, h: 28 },
    { type: 'image', x: 52, y: 8, w: 40, h: 28 },
    { type: 'image', x: 8, y: 40, w: 40, h: 28 },
    { type: 'image', x: 52, y: 40, w: 40, h: 28 },
    { type: 'text', x: 8, y: 72, w: 84, h: 20 },
  ]},
  { id: 'journal', name: 'Journal', slots: [
    { type: 'title', x: 10, y: 10, w: 80, h: 10 },
    { type: 'text', x: 10, y: 22, w: 80, h: 55 },
    { type: 'image', x: 60, y: 70, w: 30, h: 22 },
  ]},
  { id: 'polaroids', name: 'Collage', slots: [
    { type: 'image', x: 10, y: 10, w: 35, h: 35, rotate: -5 },
    { type: 'image', x: 50, y: 15, w: 35, h: 35, rotate: 4 },
    { type: 'image', x: 28, y: 48, w: 35, h: 35, rotate: -2 },
    { type: 'text', x: 10, y: 85, w: 80, h: 10 },
  ]},
  { id: 'story', name: 'Story', slots: [
    { type: 'image', x: 5, y: 5, w: 90, h: 40 },
    { type: 'title', x: 8, y: 48, w: 84, h: 8 },
    { type: 'text', x: 8, y: 58, w: 84, h: 35 },
  ]},
];

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

type SidePanel = 'layouts' | 'text' | 'photos' | 'stickers' | null;

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  const issueId = params.issueId as string;

  const [zineName, setZineName] = useState('');
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<'draft' | 'ready'>('draft');
  const [content, setContent] = useState<PageContent>({ blocks: [], background: { type: 'color', value: '#FFFFFF' } });
  const [selectedLayout, setSelectedLayout] = useState('freeform');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activePanel, setActivePanel] = useState<SidePanel>('layouts');
  const [stickerCategory, setStickerCategory] = useState<StickerCategory>('emotions');
  
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
          if ((loadedContent as any).layoutId) setSelectedLayout((loadedContent as any).layoutId);
        }
      }
    }
    loadData();
  }, [zineId, issueId, router]);

  const updateContent = useCallback((newContent: PageContent | ((prev: PageContent) => PageContent)) => {
    setContent(prev => {
      const updated = typeof newContent === 'function' ? newContent(prev) : newContent;
      if (!isUndoRedo.current) {
        setHistory(h => [...h.slice(0, historyIndex + 1), updated].slice(-50));
        setHistoryIndex(i => Math.min(i + 1, 49));
      }
      return updated;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      setHistoryIndex(i => i - 1);
      setContent(history[historyIndex - 1]);
      setTimeout(() => { isUndoRedo.current = false; }, 0);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex(i => i + 1);
      setContent(history[historyIndex + 1]);
      setTimeout(() => { isUndoRedo.current = false; }, 0);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
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
    await supabase.from('pages').update({ content: { ...content, layoutId: selectedLayout } }).eq('id', pageId);
    setLastSaved(new Date());
    setSaving(false);
  }, [pageId, content, selectedLayout]);

  useEffect(() => {
    const timer = setTimeout(() => { if (pageId) saveContent(); }, 1500);
    return () => clearTimeout(timer);
  }, [content, pageId, saveContent]);

  // Apply layout with content preservation
  const applyLayout = (layoutId: string) => {
    setSelectedLayout(layoutId);
    const layout = LAYOUTS.find(l => l.id === layoutId);
    if (!layout || layoutId === 'freeform') return;

    const canvasWidth = 400, canvasHeight = 533;
    const existingImages = content.blocks.filter(b => b.type === 'image' && (b as ImageBlock).src);
    const existingTexts = content.blocks.filter(b => b.type === 'text' && !['Add title', 'Add text...', 'Double-click to edit'].includes((b as TextBlock).content));
    const existingStickers = content.blocks.filter(b => b.type === 'sticker');

    const newBlocks: Block[] = [];
    let imgIdx = 0, txtIdx = 0;

    layout.slots.forEach((slot, i) => {
      const x = (slot.x / 100) * canvasWidth, y = (slot.y / 100) * canvasHeight;
      const w = (slot.w / 100) * canvasWidth, h = (slot.h / 100) * canvasHeight;

      if (slot.type === 'image') {
        if (imgIdx < existingImages.length) {
          newBlocks.push({ ...existingImages[imgIdx++], position: { x, y }, size: { width: w, height: h }, rotation: (slot as any).rotate || 0, zIndex: i + 1 } as ImageBlock);
        } else {
          newBlocks.push({ id: generateId('img'), type: 'image', src: '', size: { width: w, height: h }, position: { x, y }, rotation: (slot as any).rotate || 0, zIndex: i + 1, frame: 'polaroid' } as ImageBlock);
        }
      } else {
        if (txtIdx < existingTexts.length) {
          newBlocks.push({ ...existingTexts[txtIdx++], position: { x, y }, zIndex: i + 1 } as TextBlock);
        } else {
          newBlocks.push({ id: generateId('txt'), type: 'text', content: slot.type === 'title' ? 'Add title' : 'Add text...', style: slot.type === 'title' ? 'serif' : 'sans', size: slot.type === 'title' ? 'lg' : 'md', color: '#1A1A1A', align: 'left', position: { x, y }, rotation: 0, zIndex: i + 1 } as TextBlock);
        }
      }
    });

    // Keep remaining content
    existingImages.slice(imgIdx).forEach((img, i) => newBlocks.push({ ...img, position: { x: 20 + i * 30, y: canvasHeight - 100 }, zIndex: newBlocks.length + 1 } as ImageBlock));
    existingTexts.slice(txtIdx).forEach((txt, i) => newBlocks.push({ ...txt, position: { x: 20, y: canvasHeight - 60 + i * 30 }, zIndex: newBlocks.length + 1 } as TextBlock));
    existingStickers.forEach(s => newBlocks.push({ ...s, zIndex: newBlocks.length + 1 } as StickerBlock));

    updateContent(prev => ({ ...prev, blocks: newBlocks, layoutId } as PageContent));
  };

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    updateContent(prev => ({ ...prev, blocks: prev.blocks.map(b => b.id === blockId ? { ...b, ...updates } as Block : b) }));
  }, [updateContent]);

  const addTextBlock = (size: 'lg' | 'md' | 'sm' = 'md') => {
    const labels = { lg: 'Add a heading', md: 'Add body text', sm: 'Add caption' };
    const newBlock: TextBlock = {
      id: generateId('text'), type: 'text', content: labels[size],
      style: size === 'lg' ? 'serif' : 'sans', size, color: '#1A1A1A', align: 'left',
      position: { x: 40, y: 200 + Math.random() * 100 }, rotation: 0, zIndex: content.blocks.length + 1,
    };
    updateContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
    setEditingBlockId(newBlock.id);
  };

  const addImageBlock = async (file?: File) => {
    let imageUrl = '';
    if (file) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const path = `${user.id}/${generateId('img')}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage.from('page-images').upload(path, file);
      if (error) return;
      imageUrl = supabase.storage.from('page-images').getPublicUrl(data.path).data.publicUrl;
    }

    const emptySlot = content.blocks.find(b => b.type === 'image' && !b.src);
    if (emptySlot && imageUrl) { updateBlock(emptySlot.id, { src: imageUrl }); return; }

    const newBlock: ImageBlock = {
      id: generateId('image'), type: 'image', src: imageUrl,
      size: { width: 200, height: 250 }, position: { x: 80 + Math.random() * 80, y: 80 + Math.random() * 80 },
      rotation: 0, zIndex: content.blocks.length + 1, frame: 'polaroid',
    };
    updateContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
  };

  const addSticker = (emoji: string) => {
    const newBlock: StickerBlock = {
      id: generateId('sticker'), type: 'sticker', stickerId: emoji, scale: 1,
      position: { x: 100 + Math.random() * 150, y: 100 + Math.random() * 150 }, rotation: 0, zIndex: content.blocks.length + 1,
    };
    updateContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    updateContent(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
    setSelectedBlockId(null);
  };

  const handleDone = async () => { await saveContent(); router.push(`/z/${zineId}`); };
  const togglePanel = (panel: SidePanel) => setActivePanel(activePanel === panel ? null : panel);
  const selectedBlock = content.blocks.find(b => b.id === selectedBlockId) || null;
  const isMobile = useIsMobile();
  const [mobileSheet, setMobileSheet] = useState<SidePanel>(null);

  return (
    <main className="h-screen h-[100dvh] bg-[#0a0a0a] flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) addImageBlock(e.target.files[0]); e.target.value = ''; }} className="hidden" />

      {/* Header */}
      <header className="bg-[#141414] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/z/${zineId}`} className="text-white/50 hover:text-white">←</Link>
          <span className="text-white/70 text-sm hidden sm:block">{zineName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-white/50 hover:text-white disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 014 4v2M3 10l4-4M3 10l4 4" /></svg></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-white/50 hover:text-white disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a4 4 0 00-4 4v2M21 10l-4-4M21 10l-4 4" /></svg></button>
          <span className="text-white/40 text-xs mx-2">{saving ? 'Saving...' : lastSaved ? '✓' : ''}</span>
          <button onClick={() => { if (!pageId) return; const ns = pageStatus === 'draft' ? 'ready' : 'draft'; createClient().from('pages').update({ status: ns }).eq('id', pageId).then(() => setPageStatus(ns)); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${pageStatus === 'ready' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/70'}`}>{pageStatus === 'ready' ? '✓ Ready' : 'Mark Ready'}</button>
          <button onClick={handleDone} className="px-4 py-1.5 bg-white text-black rounded-lg text-sm font-medium">Done</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Icon Sidebar - Desktop only */}
        <div className="w-16 bg-[#141414] border-r border-white/10 hidden md:flex flex-col items-center py-3 gap-1">
          {[
            { id: 'layouts' as SidePanel, icon: '⊞', label: 'Layouts' },
            { id: 'text' as SidePanel, icon: 'T', label: 'Text' },
            { id: 'photos' as SidePanel, icon: '🖼', label: 'Photos' },
            { id: 'stickers' as SidePanel, icon: '😊', label: 'Stickers' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => togglePanel(item.id)}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${activePanel === item.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Expandable Panel - Desktop only */}
        <AnimatePresence>
          {activePanel && !isMobile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1a1a1a] border-r border-white/10 overflow-hidden flex-shrink-0 hidden md:block"
            >
              <div className="w-60 h-full overflow-y-auto p-4">
                {activePanel === 'layouts' && (
                  <>
                    <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Page Layouts</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {LAYOUTS.map(layout => (
                        <button
                          key={layout.id}
                          onClick={() => applyLayout(layout.id)}
                          className={`aspect-[3/4] rounded-lg border-2 relative overflow-hidden transition-all ${selectedLayout === layout.id ? 'border-amber-400' : 'border-white/10 hover:border-white/30'}`}
                        >
                          <div className="absolute inset-0 bg-[#f5f3eb] p-1">
                            {layout.slots.map((slot, i) => (
                              <div key={i} className={`absolute ${slot.type === 'image' ? 'bg-gray-300' : 'bg-gray-400'}`} style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%`, transform: (slot as any).rotate ? `rotate(${(slot as any).rotate}deg)` : undefined }} />
                            ))}
                            {layout.id === 'freeform' && <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>}
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[10px] text-white text-center">{layout.name}</div>
                        </button>
                      ))}
                    </div>
                    <h3 className="text-white/50 text-xs uppercase tracking-wider mt-6 mb-3">Background</h3>
                    <div className="grid grid-cols-5 gap-1.5">
                      {BACKGROUND_COLORS.map(color => (
                        <button key={color} onClick={() => updateContent(p => ({ ...p, background: { type: 'color', value: color } }))} className={`aspect-square rounded-lg border-2 ${content.background.value === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </>
                )}

                {activePanel === 'text' && (
                  <>
                    <button onClick={() => addTextBlock('lg')} className="w-full py-3 bg-[#f5f3eb] text-[#2d2d2d] rounded-lg font-medium mb-4 hover:bg-white transition-colors">+ Add text</button>
                    <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Text styles</h3>
                    <div className="space-y-2">
                      <button onClick={() => addTextBlock('lg')} className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
                        <span className="text-xl font-serif text-white">Add a heading</span>
                      </button>
                      <button onClick={() => addTextBlock('md')} className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
                        <span className="text-base text-white">Add body text</span>
                      </button>
                      <button onClick={() => addTextBlock('sm')} className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
                        <span className="text-sm text-white/70">Add a caption</span>
                      </button>
                    </div>
                  </>
                )}

                {activePanel === 'photos' && (
                  <>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-[#f5f3eb] text-[#2d2d2d] rounded-lg font-medium mb-4 hover:bg-white transition-colors">+ Upload photo</button>
                    <p className="text-white/40 text-sm text-center">Your uploaded photos will appear on the canvas</p>
                  </>
                )}

                {activePanel === 'stickers' && (
                  <>
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {(Object.keys(STICKERS) as StickerCategory[]).map(cat => (
                        <button key={cat} onClick={() => setStickerCategory(cat)} className={`px-2 py-1 text-xs rounded ${stickerCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>{cat.slice(0, 1).toUpperCase() + cat.slice(1)}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {STICKERS[stickerCategory].map(emoji => (
                        <button key={emoji} onClick={() => addSticker(emoji)} className="aspect-square flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg">{emoji}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[#0f0f0f] overflow-auto">
          <div
            ref={canvasRef}
            className="w-full max-w-sm md:max-w-md aspect-[3/4] rounded-lg shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: content.background.value }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelectedBlockId(null); } }}
          >
            {content.blocks.map(block => (
              <BlockComponent
                key={block.id} block={block} isSelected={selectedBlockId === block.id} isEditing={editingBlockId === block.id}
                canvasRef={canvasRef} onSelect={() => { setSelectedBlockId(block.id); setEditingBlockId(null); }}
                onStartEdit={() => setEditingBlockId(block.id)} onStopEdit={() => setEditingBlockId(null)}
                onUpdate={(updates: Partial<Block>) => updateBlock(block.id, updates)} onImageClick={() => fileInputRef.current?.click()}
              />
            ))}
            {content.blocks.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
                <p className="text-gray-400 mb-2">Your page is empty</p>
                <p className="text-gray-500 text-sm">Choose a layout or add elements from the sidebar</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties (always rendered to prevent layout shift) */}
        <div className="w-52 bg-[#141414] border-l border-white/10 p-4 overflow-y-auto hidden md:block">
          {selectedBlock ? (
            <>
              {selectedBlock.type === 'text' && (
                <>
                  <h3 className="text-white/50 text-xs uppercase mb-3">Font</h3>
                  <div className="grid grid-cols-2 gap-1 mb-4">
                    {FONT_STYLES.map(s => <button key={s.key} onClick={() => updateBlock(selectedBlock.id, { style: s.key as any })} className={`py-1.5 text-xs rounded ${(selectedBlock as TextBlock).style === s.key ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>{s.label}</button>)}
                  </div>
                  <h3 className="text-white/50 text-xs uppercase mb-3">Size</h3>
                  <div className="flex gap-1 mb-4">
                    {FONT_SIZES.map(s => <button key={s.key} onClick={() => updateBlock(selectedBlock.id, { size: s.key as any })} className={`flex-1 py-1.5 text-xs rounded ${(selectedBlock as TextBlock).size === s.key ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>{s.label}</button>)}
                  </div>
                </>
              )}
              {selectedBlock.type === 'image' && (
                <>
                  <h3 className="text-white/50 text-xs uppercase mb-3">Frame</h3>
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {IMAGE_FRAMES.map(f => <button key={f.key} onClick={() => updateBlock(selectedBlock.id, { frame: f.key as any })} className={`py-2 text-xs rounded flex flex-col items-center ${(selectedBlock as ImageBlock).frame === f.key ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}><span>{f.icon}</span><span className="text-[10px]">{f.label}</span></button>)}
                  </div>
                </>
              )}
              <button onClick={() => deleteBlock(selectedBlock.id)} className="w-full py-2 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 mt-4">Delete</button>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-white/50 text-xs uppercase">Ideas</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <p className="text-white/60 leading-relaxed">✨ What made you smile this month?</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <p className="text-white/60 leading-relaxed">📸 Share a photo that tells a story</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <p className="text-white/60 leading-relaxed">🎵 What song is stuck in your head?</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <p className="text-white/60 leading-relaxed">🍜 Document a meal you loved</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <p className="text-white/60 leading-relaxed">💭 A tiny review of something great</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/30 text-[10px] text-center">Click an element to edit it</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Sheet */}
        <AnimatePresence>
          {isMobile && mobileSheet && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-16 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 rounded-t-2xl z-20 max-h-[60vh] overflow-hidden"
            >
              <div className="p-1 flex justify-center"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>
              <div className="p-4 overflow-y-auto max-h-[calc(60vh-40px)]">
                {mobileSheet === 'layouts' && (
                  <>
                    <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Page Layouts</h3>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {LAYOUTS.map(layout => (
                        <button key={layout.id} onClick={() => { applyLayout(layout.id); setMobileSheet(null); }}
                          className={`aspect-[3/4] rounded-lg border-2 relative overflow-hidden ${selectedLayout === layout.id ? 'border-amber-400' : 'border-white/10'}`}>
                          <div className="absolute inset-0 bg-[#f5f3eb] p-0.5">
                            {layout.slots.map((slot, i) => (
                              <div key={i} className={`absolute ${slot.type === 'image' ? 'bg-gray-300' : 'bg-gray-400'}`} style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%` }} />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                    <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Background</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {BACKGROUND_COLORS.map(color => (
                        <button key={color} onClick={() => updateContent(p => ({ ...p, background: { type: 'color', value: color } }))}
                          className={`aspect-square rounded-lg border-2 ${content.background.value === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </>
                )}
                {mobileSheet === 'text' && (
                  <div className="space-y-3">
                    <button onClick={() => { addTextBlock('lg'); setMobileSheet(null); }} className="w-full p-4 bg-white/5 rounded-xl text-left">
                      <span className="text-xl font-serif text-white">Heading</span>
                    </button>
                    <button onClick={() => { addTextBlock('md'); setMobileSheet(null); }} className="w-full p-4 bg-white/5 rounded-xl text-left">
                      <span className="text-base text-white">Body text</span>
                    </button>
                    <button onClick={() => { addTextBlock('sm'); setMobileSheet(null); }} className="w-full p-4 bg-white/5 rounded-xl text-left">
                      <span className="text-sm text-white/70">Caption</span>
                    </button>
                  </div>
                )}
                {mobileSheet === 'photos' && (
                  <div className="text-center py-8">
                    <button onClick={() => { fileInputRef.current?.click(); setMobileSheet(null); }} className="px-8 py-4 bg-[#f5f3eb] text-[#2d2d2d] rounded-xl font-medium text-lg">
                      📷 Choose Photo
                    </button>
                  </div>
                )}
                {mobileSheet === 'stickers' && (
                  <>
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                      {(Object.keys(STICKERS) as StickerCategory[]).map(cat => (
                        <button key={cat} onClick={() => setStickerCategory(cat)} className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${stickerCategory === cat ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {STICKERS[stickerCategory].map(emoji => (
                        <button key={emoji} onClick={() => { addSticker(emoji); setMobileSheet(null); }} className="aspect-square flex items-center justify-center text-2xl rounded-lg active:bg-white/10">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Properties Sheet */}
        <AnimatePresence>
          {isMobile && selectedBlock && !mobileSheet && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-16 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 rounded-t-2xl z-20 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50 text-xs uppercase">Edit {selectedBlock.type}</span>
                <button onClick={() => setSelectedBlockId(null)} className="text-white/50 text-sm">Done</button>
              </div>
              {selectedBlock.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-white/40 text-xs mb-2">Font</p>
                    <div className="flex gap-2">
                      {FONT_STYLES.map(s => (
                        <button key={s.key} onClick={() => updateBlock(selectedBlock.id, { style: s.key as any })}
                          className={`flex-1 py-2 text-sm rounded-lg ${(selectedBlock as TextBlock).style === s.key ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-2">Size</p>
                    <div className="flex gap-2">
                      {FONT_SIZES.map(s => (
                        <button key={s.key} onClick={() => updateBlock(selectedBlock.id, { size: s.key as any })}
                          className={`flex-1 py-2 text-sm rounded-lg ${(selectedBlock as TextBlock).size === s.key ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {selectedBlock.type === 'image' && (
                <div>
                  <p className="text-white/40 text-xs mb-2">Frame</p>
                  <div className="flex gap-2">
                    {IMAGE_FRAMES.map(f => (
                      <button key={f.key} onClick={() => updateBlock(selectedBlock.id, { frame: f.key as any })}
                        className={`flex-1 py-3 text-sm rounded-lg flex flex-col items-center ${(selectedBlock as ImageBlock).frame === f.key ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                        <span>{f.icon}</span>
                        <span className="text-[10px]">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => deleteBlock(selectedBlock.id)} className="w-full mt-4 py-3 text-red-400 border border-red-500/30 rounded-xl">Delete</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Tab Bar */}
        {isMobile && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#141414] border-t border-white/10 flex items-center justify-around z-30">
            {[
              { id: 'layouts' as SidePanel, icon: '⊞', label: 'Layout' },
              { id: 'text' as SidePanel, icon: 'T', label: 'Text' },
              { id: 'photos' as SidePanel, icon: '📷', label: 'Photo' },
              { id: 'stickers' as SidePanel, icon: '😊', label: 'Stickers' },
            ].map(item => (
              <button key={item.id} onClick={() => setMobileSheet(mobileSheet === item.id ? null : item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg ${mobileSheet === item.id ? 'text-white' : 'text-white/50'}`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Block Component
function BlockComponent({ block, isSelected, isEditing, canvasRef, onSelect, onStartEdit, onStopEdit, onUpdate, onImageClick }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localText, setLocalText] = useState(block.type === 'text' ? block.content : '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (block.type === 'text' && !isEditing) setLocalText(block.content); }, [block.type, block.content, isEditing]);
  useEffect(() => { if (isEditing && textareaRef.current) { textareaRef.current.focus(); textareaRef.current.select(); } }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault(); e.stopPropagation();
    const rect = blockRef.current?.getBoundingClientRect();
    if (rect) setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true); onSelect();
  };

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const c = canvasRef.current.getBoundingClientRect();
      onUpdate({ position: { x: Math.max(0, Math.min(c.width - 60, e.clientX - c.left - dragStart.x)), y: Math.max(0, Math.min(c.height - 60, e.clientY - c.top - dragStart.y)) } });
    };
    const up = () => setIsDragging(false);
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
  }, [isDragging, dragStart, canvasRef, onUpdate]);

  const font = FONT_STYLES.find(s => s.key === block.style)?.fontFamily || 'inherit';
  const size = FONT_SIZES.find(s => s.key === block.size)?.size || '18px';

  return (
    <div ref={blockRef} onMouseDown={handleMouseDown} onDoubleClick={(e) => { e.stopPropagation(); if (block.type === 'text') onStartEdit(); }}
      className={`absolute select-none ${isEditing ? 'cursor-text' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ left: block.position.x, top: block.position.y, transform: `rotate(${block.rotation}deg)`, zIndex: isSelected ? 100 : block.zIndex, outline: isSelected && !isEditing ? '2px solid #6366f1' : 'none', outlineOffset: '3px' }}>
      {block.type === 'text' && (isEditing ? (
        <textarea ref={textareaRef} value={localText} onChange={(e) => setLocalText(e.target.value)}
          onBlur={() => { onUpdate({ content: localText }); onStopEdit(); }} onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) { onUpdate({ content: localText }); onStopEdit(); } }}
          className="bg-white border-2 border-amber-400 p-3 min-w-[200px] min-h-[80px] resize outline-none rounded"
          style={{ color: block.color, fontSize: size, fontFamily: font, textAlign: block.align || 'left' }} />
      ) : (
        <div className="p-2 min-w-[60px] rounded hover:bg-black/5 whitespace-pre-wrap" style={{ color: block.color, fontSize: size, fontFamily: font, textAlign: block.align || 'left' }}>{block.content}</div>
      ))}
      {block.type === 'image' && (
        <div className={`${block.frame === 'polaroid' ? 'bg-white p-2 pb-6 shadow-lg rounded' : block.frame === 'rounded' ? 'shadow-lg' : ''}`} onClick={!block.src ? onImageClick : undefined}>
          {block.src ? <img src={block.src} className={`object-cover ${block.frame === 'rounded' ? 'rounded-xl' : ''}`} style={{ width: block.size?.width, height: block.size?.height }} draggable={false} />
          : <div className="bg-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-300 rounded" style={{ width: block.size?.width, height: block.size?.height }}><span className="text-3xl mb-1">📷</span><span className="text-xs">Add photo</span></div>}
        </div>
      )}
      {block.type === 'sticker' && <div style={{ fontSize: `${3 * (block.scale || 1)}rem` }}>{block.stickerId}</div>}
    </div>
  );
}
