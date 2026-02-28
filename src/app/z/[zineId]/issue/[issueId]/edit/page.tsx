'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { transitions, generateId } from '@/lib/utils';
import type { Block, PageContent, ImageBlock, TextBlock } from '@/lib/types';
import { BACKGROUND_COLORS } from '@/lib/types';

const initialContent: PageContent = {
  blocks: [],
  background: { type: 'color', value: '#f5f3eb' },
};

export default function EditPage() {
  const params = useParams();
  const zineId = params.zineId as string;
  const issueId = params.issueId as string;

  const [content, setContent] = useState<PageContent>(initialContent);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'image'>('select');

  const addTextBlock = () => {
    const newBlock: TextBlock = {
      id: generateId('text'),
      type: 'text',
      content: 'Double click to edit',
      style: 'sans',
      size: 'md',
      color: '#2d2d2d',
      position: { x: 100, y: 100 },
      rotation: 0,
      zIndex: content.blocks.length + 1,
    };
    setContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setSelectedBlock(newBlock.id);
    setTool('select');
  };

  const addImageBlock = () => {
    // In production, this would open a file picker
    const newBlock: ImageBlock = {
      id: generateId('image'),
      type: 'image',
      src: '/placeholder.jpg',
      size: { width: 200, height: 250 },
      position: { x: 150, y: 150 },
      rotation: 2,
      zIndex: content.blocks.length + 1,
    };
    setContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setSelectedBlock(newBlock.id);
    setTool('select');
  };

  const setBackground = (color: string) => {
    setContent(prev => ({
      ...prev,
      background: { type: 'color', value: color },
    }));
  };

  const deleteBlock = (id: string) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id),
    }));
    setSelectedBlock(null);
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <header className="bg-[#2d2d2d] border-b border-[#3d3d3d]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link 
            href={`/z/${zineId}`} 
            className="text-white/60 hover:text-white text-sm"
          >
            ← Back to zine
          </Link>
          <span className="text-white/80 text-sm">Editing your page</span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-1.5 bg-white text-[#2d2d2d] rounded-full text-sm font-medium"
          >
            Done
          </motion.button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <div className="w-16 bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col items-center py-4 gap-2">
          <ToolButton
            active={tool === 'select'}
            onClick={() => setTool('select')}
            icon="↖"
            label="Select"
          />
          <ToolButton
            active={tool === 'text'}
            onClick={addTextBlock}
            icon="T"
            label="Text"
          />
          <ToolButton
            active={tool === 'image'}
            onClick={addImageBlock}
            icon="🖼"
            label="Image"
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.easeOutQuint}
            className="w-full max-w-xl aspect-[3/4] rounded-lg shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: content.background.value }}
            onClick={() => setSelectedBlock(null)}
          >
            {/* Blocks */}
            {content.blocks.map((block) => (
              <DraggableBlock
                key={block.id}
                block={block}
                selected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onDelete={() => deleteBlock(block.id)}
              />
            ))}

            {/* Empty state */}
            {content.blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-[#aaa]">
                  <p className="text-lg mb-2">Your page is empty</p>
                  <p className="text-sm">Add text or images using the toolbar</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-64 bg-[#2d2d2d] border-l border-[#3d3d3d] p-4">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Background</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBackground(color)}
                className={`w-full aspect-square rounded-lg border-2 transition-colors ${
                  content.background.value === color 
                    ? 'border-white' 
                    : 'border-transparent hover:border-white/30'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {selectedBlock && (
            <>
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Selected Block</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => deleteBlock(selectedBlock)}
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                Delete Block
              </motion.button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ToolButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
        active 
          ? 'bg-white text-[#2d2d2d]' 
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
      title={label}
    >
      {icon}
    </button>
  );
}

function DraggableBlock({ 
  block, 
  selected, 
  onSelect,
  onDelete,
}: { 
  block: Block; 
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute cursor-grab ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{
        left: block.position.x,
        top: block.position.y,
        transform: `rotate(${block.rotation}deg)`,
        zIndex: block.zIndex,
      }}
      transition={transitions.easeOutQuint}
    >
      {block.type === 'text' && (
        <div 
          className="px-2 py-1 min-w-[100px]"
          style={{ color: block.color }}
        >
          {block.content}
        </div>
      )}
      {block.type === 'image' && (
        <div 
          className="bg-[#ddd] flex items-center justify-center text-[#999]"
          style={{ width: block.size.width, height: block.size.height }}
        >
          Image
        </div>
      )}
      {block.type === 'sticker' && (
        <div className="text-4xl">⭐</div>
      )}
    </motion.div>
  );
}
