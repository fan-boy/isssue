'use client';

import { useEffect, useState, useCallback } from 'react';
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
  profiles: { name: string; color: string; avatar_url: string | null };
}

interface IssueData {
  id: string;
  issue_number: number;
  month: string;
  status: string;
  cover_url: string | null;
  zines: { name: string };
}

export default function IssueViewPage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  const issueId = params.issueId as string;
  
  const [issue, setIssue] = useState<IssueData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('id, issue_number, month, status, cover_url, zines(name)')
        .eq('id', issueId)
        .single();
      if (issueError || !issueData) { router.push(`/z/${zineId}`); return; }
      setIssue(issueData as unknown as IssueData);

      const { data: pagesData } = await supabase
        .from('pages')
        .select('id, page_number, content, profiles(name, color, avatar_url)')
        .eq('issue_id', issueId)
        .order('page_number', { ascending: true });
      if (pagesData) setPages(pagesData as unknown as PageData[]);

      setLoading(false);
    }
    loadData();
  }, [zineId, issueId, router]);

  const totalPages = pages.length + 1; // +1 for cover

  const paginate = useCallback((newDirection: number) => {
    const nextPage = currentPage + newDirection;
    if (nextPage >= 0 && nextPage < totalPages) {
      setDirection(newDirection);
      setCurrentPage(nextPage);
    }
  }, [currentPage, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'Escape') router.push(`/z/${zineId}`);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate, router, zineId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  if (!issue) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Issue not found</p>
          <Link href={`/z/${zineId}`} className="text-white/70 hover:text-white">← Back to Zine</Link>
        </div>
      </main>
    );
  }

  const isCoverPage = currentPage === 0;
  const contentPage = isCoverPage ? null : pages[currentPage - 1];

  // Page flip animation
  const pageVariants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      rotateY: direction < 0 ? 90 : -90,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <main className="min-h-screen bg-[#111] flex flex-col overflow-hidden">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            href={`/z/${zineId}`} 
            className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span className="hidden md:inline">Back to {issue.zines?.name}</span>
          </Link>
          <div className="text-white/30 text-sm">
            {currentPage === 0 ? 'Cover' : `${currentPage} / ${pages.length}`}
          </div>
        </div>
      </header>

      {/* Magazine Reader */}
      <div 
        className="flex-1 flex items-center justify-center p-4 md:p-8 relative"
        style={{ perspective: '2000px' }}
      >
        {/* Click zones for navigation */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10 group"
          onClick={() => paginate(-1)}
        >
          {currentPage > 0 && (
            <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-2xl">
                ‹
              </div>
            </div>
          )}
        </div>
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10 group"
          onClick={() => paginate(1)}
        >
          {currentPage < totalPages - 1 && (
            <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-2xl">
                ›
              </div>
            </div>
          )}
        </div>

        {/* Page */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ 
              duration: 0.5, 
              ease: [0.23, 1, 0.32, 1],
            }}
            className="w-full max-w-xl md:max-w-2xl aspect-[3/4] relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {isCoverPage ? (
              <CoverPage issue={issue} />
            ) : contentPage ? (
              <ContentPage 
                page={contentPage} 
                pageNumber={currentPage} 
                totalPages={pages.length}
                zineName={issue.zines?.name || ''}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page Thumbnails */}
      <div className="flex justify-center gap-2 pb-6 px-4">
        {/* Cover thumbnail */}
        <button
          onClick={() => { setDirection(currentPage > 0 ? -1 : 1); setCurrentPage(0); }}
          className={`relative rounded overflow-hidden transition-all ${
            currentPage === 0 
              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111]' 
              : 'opacity-50 hover:opacity-80'
          }`}
        >
          <div className="w-8 h-11 bg-[#faf9f6]">
            {issue.cover_url && (
              <img src={issue.cover_url} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>
        </button>
        
        {/* Page thumbnails */}
        {pages.map((p, index) => (
          <button
            key={p.id}
            onClick={() => { 
              setDirection(index + 1 > currentPage ? 1 : -1); 
              setCurrentPage(index + 1); 
            }}
            className={`relative rounded overflow-hidden transition-all ${
              currentPage === index + 1 
                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111]' 
                : 'opacity-50 hover:opacity-80'
            }`}
            title={p.profiles?.name}
          >
            <div 
              className="w-8 h-11 flex items-center justify-center text-[8px] font-medium"
              style={{ backgroundColor: p.content?.background?.value || '#fff' }}
            >
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}

// Cover Page Component
function CoverPage({ issue }: { issue: IssueData }) {
  return (
    <div className="w-full h-full rounded-sm shadow-2xl overflow-hidden relative bg-[#faf9f6]">
      {issue.cover_url ? (
        <>
          <img 
            src={issue.cover_url} 
            alt={`${issue.zines?.name} Issue ${issue.issue_number}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
          <div className="relative h-full flex flex-col p-8">
            <span className="text-[11px] text-white/70 uppercase tracking-[0.25em] font-light">
              Issue {issue.issue_number}
            </span>
            <div className="flex-1 flex items-start justify-center pt-8">
              <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide text-center drop-shadow-lg">
                {issue.zines?.name}
              </h1>
            </div>
            <p className="text-[11px] text-white/60 uppercase tracking-[0.2em] text-center">
              {formatMonth(issue.month)}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Paper texture */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />
          <div className="relative h-full flex flex-col p-8">
            <span className="text-[11px] text-[#888] uppercase tracking-[0.25em]">
              Issue {issue.issue_number}
            </span>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-[#2d2d2d] tracking-wide">
                {issue.zines?.name}
              </h1>
              <p className="text-lg text-[#666] mt-2">{formatMonth(issue.month)}</p>
            </div>
          </div>
        </>
      )}
      
      {/* Spine shadow */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent" />
      
      {/* Page edge effect */}
      <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-l from-black/10 to-transparent" />
    </div>
  );
}

// Content Page Component
function ContentPage({ 
  page, 
  pageNumber, 
  totalPages,
  zineName 
}: { 
  page: PageData; 
  pageNumber: number; 
  totalPages: number;
  zineName: string;
}) {
  const bgColor = page.content?.background?.value || '#FFFFFF';

  return (
    <div 
      className="w-full h-full rounded-sm shadow-2xl overflow-hidden relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Page content */}
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
                      handwritten: '"Segoe Script", "Bradley Hand", cursive',
                      typewriter: '"SF Mono", "Courier New", monospace',
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
          {page.profiles?.avatar_url ? (
            <img 
              src={page.profiles.avatar_url} 
              alt={page.profiles.name}
              className="w-20 h-20 rounded-full object-cover mb-4"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-white text-2xl"
              style={{ backgroundColor: page.profiles?.color || '#6366f1' }}
            >
              {page.profiles?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <p className="text-lg font-medium text-gray-600">{page.profiles?.name}'s page</p>
          <p className="text-sm text-gray-400 mt-2">No content yet</p>
        </div>
      )}

      {/* Author badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
        {page.profiles?.avatar_url ? (
          <img 
            src={page.profiles.avatar_url} 
            alt={page.profiles.name}
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <div 
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: page.profiles?.color || '#6366f1' }}
          />
        )}
        <span className="text-sm text-gray-700">{page.profiles?.name}</span>
      </div>

      {/* Page number */}
      <div className="absolute bottom-4 right-4 text-[11px] text-gray-400 font-light">
        {pageNumber} / {totalPages}
      </div>

      {/* Magazine name in header */}
      <div className="absolute top-4 left-0 right-0 text-center">
        <span className="text-[9px] text-gray-300 uppercase tracking-[0.2em]">{zineName}</span>
      </div>

      {/* Spine shadow */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/10 to-transparent" />
      
      {/* Page edge */}
      <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-l from-black/5 to-transparent" />
    </div>
  );
}
