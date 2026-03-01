'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatMonth } from '@/lib/utils';
import type { PageContent } from '@/lib/types';

interface PageData {
  id: string;
  page_number: number;
  content: PageContent;
  profiles: { name: string; color: string };
}

interface IssueData {
  id: string;
  issue_number: number;
  month: string;
  status: string;
  zines: { name: string };
}

export default function IssueViewPage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  const issueId = params.issueId as string;
  
  const [issue, setIssue] = useState<IssueData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('id, issue_number, month, status, zines(name)')
        .eq('id', issueId)
        .single();
      if (issueError || !issueData) { router.push(`/z/${zineId}`); return; }
      setIssue(issueData as unknown as IssueData);

      const { data: pagesData } = await supabase
        .from('pages')
        .select('id, page_number, content, profiles(name, color)')
        .eq('issue_id', issueId)
        .order('page_number', { ascending: true });
      if (pagesData) setPages(pagesData as unknown as PageData[]);

      setLoading(false);
    }
    loadData();
  }, [zineId, issueId, router]);

  const paginate = (newDirection: number) => {
    const nextPage = currentPage + newDirection;
    if (nextPage >= 0 && nextPage < pages.length) {
      setDirection(newDirection);
      setCurrentPage(nextPage);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  if (!issue || pages.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">No pages in this issue yet</p>
          <Link href={`/z/${zineId}`} className="text-white/70 hover:text-white">← Back to Zine</Link>
        </div>
      </main>
    );
  }

  const page = pages[currentPage];
  const bgColor = page?.content?.background?.value || '#FFFFFF';

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/10 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/z/${zineId}`} className="text-white/50 hover:text-white transition-colors">
            ← Back
          </Link>
          <div className="text-center">
            <span className="text-white font-medium">{issue.zines?.name}</span>
            <span className="text-white/30 mx-3">·</span>
            <span className="text-white/60">Issue {issue.issue_number}</span>
            <span className="text-white/30 mx-3">·</span>
            <span className="text-white/60">{formatMonth(issue.month)}</span>
          </div>
          <div className="text-white/50 text-sm">
            {currentPage + 1} / {pages.length}
          </div>
        </div>
      </header>

      {/* Page Viewer */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={() => paginate(-1)}
          disabled={currentPage === 0}
          className="absolute left-4 md:left-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-2xl transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === pages.length - 1}
          className="absolute right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-2xl transition-colors"
        >
          ›
        </button>

        {/* Page */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl aspect-[3/4] rounded-lg shadow-2xl overflow-hidden relative"
            style={{ backgroundColor: bgColor }}
          >
            {/* Render page content */}
            {page.content?.blocks?.length > 0 ? (
              <div className="relative w-full h-full">
                {page.content.blocks.map((block) => (
                  <div
                    key={block.id}
                    className="absolute"
                    style={{
                      left: block.position.x,
                      top: block.position.y,
                      transform: `rotate(${block.rotation}deg)`,
                      zIndex: block.zIndex,
                    }}
                  >
                    {block.type === 'text' && (
                      <div 
                        className="p-3 whitespace-pre-wrap"
                        style={{ 
                          color: block.color,
                          fontSize: { sm: '0.875rem', md: '1.125rem', lg: '1.5rem', xl: '2.25rem' }[block.size] || '1.125rem',
                          fontFamily: {
                            sans: 'system-ui, sans-serif',
                            serif: 'Georgia, serif',
                            handwritten: 'cursive',
                            typewriter: 'monospace',
                          }[block.style] || 'inherit',
                        }}
                      >
                        {block.content}
                      </div>
                    )}
                    {block.type === 'image' && (
                      <div className="bg-white p-2 pb-6 shadow-lg rounded" style={{ width: (block.size?.width || 200) + 16 }}>
                        {block.src ? (
                          <img src={block.src} alt="" className="object-cover"
                            style={{ width: block.size?.width || 200, height: block.size?.height || 250 }} />
                        ) : (
                          <div className="bg-gray-100 flex items-center justify-center text-gray-400"
                            style={{ width: block.size?.width || 200, height: block.size?.height || 250 }}>
                            🖼
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: page.profiles?.color || '#6366f1' }}
                />
                <p className="text-lg font-medium text-gray-600">{page.profiles?.name}'s page</p>
                <p className="text-sm text-gray-400 mt-2">No content yet</p>
              </div>
            )}

            {/* Author badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
              <div 
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: page.profiles?.color || '#6366f1' }}
              />
              <span className="text-sm text-gray-700">{page.profiles?.name}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page Indicators */}
      <div className="flex justify-center gap-3 pb-8">
        {pages.map((p, index) => (
          <button
            key={p.id}
            onClick={() => { setDirection(index > currentPage ? 1 : -1); setCurrentPage(index); }}
            className="group relative"
            title={p.profiles?.name}
          >
            <div className={`w-8 h-1.5 rounded-full transition-colors ${
              index === currentPage ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
            }`} />
          </button>
        ))}
      </div>
    </main>
  );
}
