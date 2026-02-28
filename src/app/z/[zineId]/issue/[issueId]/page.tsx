'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { transitions, pageVariants } from '@/lib/utils';

// Mock pages for viewing
const mockPages = [
  {
    id: 'page-1',
    user: { name: 'Adi', color: '#e57373' },
    pageNumber: 1,
    content: {
      blocks: [],
      background: { type: 'color', value: '#f5f3eb' },
    },
  },
  {
    id: 'page-2',
    user: { name: 'Maya', color: '#64b5f6' },
    pageNumber: 2,
    content: {
      blocks: [],
      background: { type: 'color', value: '#e6ebe7' },
    },
  },
  {
    id: 'page-3',
    user: { name: 'Jordan', color: '#81c784' },
    pageNumber: 3,
    content: {
      blocks: [],
      background: { type: 'color', value: '#f0e6d3' },
    },
  },
];

export default function IssueViewPage() {
  const params = useParams();
  const zineId = params.zineId as string;
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    const nextPage = currentPage + newDirection;
    if (nextPage >= 0 && nextPage < mockPages.length) {
      setDirection(newDirection);
      setCurrentPage(nextPage);
    }
  };

  const page = mockPages[currentPage];

  return (
    <main className="min-h-screen bg-[#2d2d2d] flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#3d3d3d]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/z/${zineId}`} className="text-white/60 hover:text-white">
            ← Back
          </Link>
          <span className="text-white font-serif">Issue #3 · March 2026</span>
          <div className="text-white/60 text-sm">
            {currentPage + 1} / {mockPages.length}
          </div>
        </div>
      </header>

      {/* Page Viewer */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={() => paginate(-1)}
          disabled={currentPage === 0}
          className="absolute left-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-2xl transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === mockPages.length - 1}
          className="absolute right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-2xl transition-colors"
        >
          ›
        </button>

        {/* Page */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitions.pageTurn}
            className="w-full max-w-2xl aspect-[3/4] rounded-lg shadow-2xl overflow-hidden"
            style={{ backgroundColor: page.content.background.value }}
          >
            {/* Page content will render here */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                  style={{ backgroundColor: page.user.color }}
                />
                <p className="text-[#5a5a5a] text-lg">{page.user.name}&apos;s page</p>
                <p className="text-[#aaa] text-sm mt-2">Page {page.pageNumber}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page Indicators */}
      <div className="flex justify-center gap-2 pb-8">
        {mockPages.map((p, index) => (
          <button
            key={p.id}
            onClick={() => {
              setDirection(index > currentPage ? 1 : -1);
              setCurrentPage(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentPage ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </main>
  );
}
