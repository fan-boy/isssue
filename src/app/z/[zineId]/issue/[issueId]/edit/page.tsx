'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateId } from '@/lib/utils';
import type { Block, PageContent, ImageBlock, TextBlock } from '@/lib/types';
import { BACKGROUND_COLORS } from '@/lib/types';

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

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  const issueId = params.issueId as string;

  const [zineName, setZineName] = useState('');
  const [pageId, setPageId] = useState<string | null>(null);
  const [content, setContent] = useState<PageContent>(initialContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  
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
        if (page.content && typeof page.content === 'object') {
          setContent(page.content as PageContent);
        }
      }
    }
    loadData();
  }, [zineId, issueId, router]);

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
      if (pageId && content.blocks.length > 0) saveContent();
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, pageId, saveContent]);

  // Get selected block
  const selectedBlock = content.blocks.find(b => b.id === selectedBlockId) || null;

  // Update a block
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === blockId ? { ...b, ...updates } as Block : b
      ),
    }));
  }, []);

  // Add text block
  const addTextBlock = (initialText?: string) => {
    const newBlock: TextBlock = {
      id: generateId('text'),
      type: 'text',
      content: initialText || 'Double-click to edit',
      style: 'sans',
      size: 'md',
      color: '#1A1A1A',
      position: { x: 50 + Math.random() * 150, y: 50 + Math.random() * 150 },
      rotation: 0,
      zIndex: content.blocks.length + 1,
    };
    setContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
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
    setContent(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newBlock.id);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImageBlock(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setBackground = (color: string) => {
    setContent(prev => ({ ...prev, background: { type: 'color', value: color } }));
  };

  const deleteBlock = (id: string) => {
    setContent(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
    setSelectedBlockId(null);
    setEditingBlockId(null);
  };

  const handleDone = async () => {
    await saveContent();
    router.push(`/z/${zineId}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Header */}
      <header className="bg-[#141414] border-b border-white/10 flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/z/${zineId}`} className="text-white/50 hover:text-white text-sm">← Back</Link>
            <span className="text-white/30">|</span>
            <span className="text-white/80 text-sm">{zineName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm">
              {saving ? 'Saving...' : lastSaved ? '✓ Saved' : ''}
            </span>
            <button onClick={handleDone} className="px-5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90">
              Done
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="w-14 bg-[#141414] border-r border-white/10 flex flex-col items-center py-4 gap-2">
          <ToolBtn onClick={() => addTextBlock()} icon="T" label="Text" />
          <ToolBtn onClick={() => fileInputRef.current?.click()} icon="🖼" label="Image" />
          <div className="w-6 h-px bg-white/10 my-2" />
          <ToolBtn onClick={() => setShowPrompts(!showPrompts)} icon="💡" label="Ideas" active={showPrompts} />
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto relative bg-[#1a1a1a]">
          {/* Prompts */}
          <AnimatePresence>
            {showPrompts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-4 w-72 bg-[#242424] border border-white/10 rounded-xl p-5 z-30"
              >
                <p className="text-sm text-white/50 mb-2">Need inspiration?</p>
                <p className="text-lg text-white mb-4">"{PROMPTS[promptIndex]}"</p>
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

          {/* Page Canvas */}
          <div
            ref={canvasRef}
            className="w-full max-w-xl aspect-[3/4] rounded-lg shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: content.background.value }}
            onMouseDown={(e) => {
              // Only deselect if clicking directly on canvas, not on a block
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
                <p className="text-lg font-medium text-gray-500 mb-1">Your page is empty</p>
                <p className="text-sm text-gray-400">Add text or images from the toolbar</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 bg-[#141414] border-l border-white/10 p-4 overflow-y-auto hidden md:block">
          {/* Background */}
          <div className="mb-6">
            <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Background</h3>
            <div className="grid grid-cols-4 gap-2">
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

          {/* Selected Block */}
          {selectedBlock && selectedBlock.type === 'text' && (
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
                      onClick={() => updateBlock(selectedBlock.id, { style: style.key as TextBlock['style'] })}
                      className={`py-2 px-2 text-xs rounded transition-all ${
                        selectedBlock.style === style.key
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
                      onClick={() => updateBlock(selectedBlock.id, { size: size.key as TextBlock['size'] })}
                      className={`flex-1 py-2 text-xs rounded transition-all ${
                        selectedBlock.size === size.key
                          ? 'bg-white text-black font-medium'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteBlock(selectedBlock.id)}
                className="w-full py-2 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          )}

          {selectedBlock && selectedBlock.type === 'image' && (
            <div>
              <div className="w-full h-px bg-white/10 mb-4" />
              <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Image</h3>
              <button
                onClick={() => deleteBlock(selectedBlock.id)}
                className="w-full py-2 text-sm border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ToolBtn({ onClick, icon, label, active = false }: { onClick: () => void; icon: string; label: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
        active ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
    </button>
  );
}

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

  // Sync local text with block content
  useEffect(() => {
    if (block.type === 'text') {
      setLocalText(block.content);
    }
  }, [block]);

  // Focus textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Mouse down - start drag
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

  // Drag handling
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

  // Save text on blur
  const handleTextBlur = () => {
    if (block.type === 'text' && localText !== block.content) {
      onUpdate({ content: localText });
    }
    onStopEdit();
  };

  // Get font styles
  const getFontFamily = () => {
    if (block.type !== 'text') return 'inherit';
    const style = FONT_STYLES.find(s => s.key === block.style);
    return style?.fontFamily || 'inherit';
  };

  const getFontSize = () => {
    if (block.type !== 'text') return '18px';
    const size = FONT_SIZES.find(s => s.key === block.size);
    return size?.size || '18px';
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
            onKeyDown={(e) => { if (e.key === 'Escape') handleTextBlur(); }}
            className="bg-white border-2 border-indigo-500 p-3 min-w-[200px] min-h-[100px] resize outline-none rounded"
            style={{
              color: block.color,
              fontSize: getFontSize(),
              fontFamily: getFontFamily(),
            }}
          />
        ) : (
          <div
            className="p-3 min-w-[60px] rounded hover:bg-black/5 whitespace-pre-wrap transition-colors"
            style={{
              color: block.color,
              fontSize: getFontSize(),
              fontFamily: getFontFamily(),
            }}
          >
            {block.content}
          </div>
        )
      )}

      {block.type === 'image' && (
        <div className="bg-white p-2 pb-6 shadow-lg rounded" style={{ width: (block.size?.width || 200) + 16 }}>
          {block.src ? (
            <img
              src={block.src}
              alt=""
              className="object-cover pointer-events-none"
              style={{ width: block.size?.width || 200, height: block.size?.height || 250 }}
              draggable={false}
            />
          ) : (
            <div
              className="bg-gray-100 flex items-center justify-center text-gray-400 text-2xl"
              style={{ width: block.size?.width || 200, height: block.size?.height || 250 }}
            >
              🖼
            </div>
          )}
        </div>
      )}
    </div>
  );
}
