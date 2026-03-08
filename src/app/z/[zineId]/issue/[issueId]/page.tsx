'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatMonth } from '@/lib/utils';
import type { PageContent, Block } from '@/lib/types';

// Types
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

// Constants
const SWIPE_THRESHOLD = 50;
const ANIMATION_DURATION = 0.4;
const EASE_OUT_QUINT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const FONT_SIZES: Record<string, string> = {
  sm: '0.875rem',
  md: '1.125rem', 
  lg: '1.5rem',
  xl: '2.25rem',
};

const FONT_FAMILIES: Record<string, string> = {
  sans: 'system-ui, sans-serif',
  serif: 'Georgia, serif',
  handwritten: '"Segoe Script", "Bradley Hand", cursive',
  typewriter: '"SF Mono", "Courier New", monospace',
};

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    const supabase = createClient();
    
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('id, issue_number, month, status, cover_url, zines(name)')
        .eq('id', issueId)
        .single();

      if (issueError || !issueData) {
        router.push(`/z/${zineId}`);
        return;
      }
      
      setIssue(issueData as unknown as IssueData);

      const { data: pagesData } = await supabase
        .from('pages')
        .select('id, page_number, content, profiles(name, color, avatar_url)')
        .eq('issue_id', issueId)
        .order('page_number', { ascending: true });

      if (pagesData) {
        setPages(pagesData as unknown as PageData[]);
      }

      setLoading(false);
    }
    
    loadData();
  }, [zineId, issueId, router]);

  const totalPages = pages.length + 1;

  // Navigation
  const goToPage = useCallback((page: number, dir?: number) => {
    if (page >= 0 && page < totalPages) {
      setDirection(dir ?? (page > currentPage ? 1 : -1));
      setCurrentPage(page);
    }
  }, [currentPage, totalPages]);

  const paginate = useCallback((dir: number) => {
    goToPage(currentPage + dir, dir);
  }, [currentPage, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      else if (e.key === 'ArrowRight') paginate(1);
      else if (e.key === 'Escape') router.push(`/z/${zineId}`);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate, router, zineId]);

  // Swipe handling
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      paginate(info.offset.x > 0 ? -1 : 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen min-h-[100dvh] bg-[#111] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  // Error state
  if (!issue) {
    return (
      <main className="min-h-screen min-h-[100dvh] bg-[#111] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/50 mb-4">Issue not found</p>
          <Link href={`/z/${zineId}`} className="text-white/70 hover:text-white">
            ← Back to isssue
          </Link>
        </div>
      </main>
    );
  }

  const isCoverPage = currentPage === 0;
  const contentPage = isCoverPage ? null : pages[currentPage - 1];

  const pageVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 45 : -45,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      rotateY: dir < 0 ? 45 : -45,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <main className="h-screen h-[100dvh] bg-[#111] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-12 sm:h-14 flex items-center px-4 sm:px-6 z-20">
        <div className="w-full flex items-center justify-between">
          <Link 
            href={`/z/${zineId}`} 
            className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="text-white/30 text-xs sm:text-sm">
            {isCoverPage ? 'Cover' : `${currentPage} / ${pages.length}`}
          </div>
        </div>
      </header>

      {/* Magazine Reader - uses CSS to fit page within available space */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 flex items-center justify-center px-4 sm:px-8 md:px-16 py-4 relative"
        style={{ perspective: '1500px' }}
      >
        {/* Navigation zones - hidden on touch devices */}
        <div 
          className="hidden md:block absolute left-0 top-0 bottom-0 w-24 cursor-pointer z-10 group"
          onClick={() => paginate(-1)}
        >
          {currentPage > 0 && (
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-xl">
                ‹
              </div>
            </div>
          )}
        </div>
        <div 
          className="hidden md:block absolute right-0 top-0 bottom-0 w-24 cursor-pointer z-10 group"
          onClick={() => paginate(1)}
        >
          {currentPage < totalPages - 1 && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-xl">
                ›
              </div>
            </div>
          )}
        </div>

        {/* Page with swipe - height-based sizing for proper fit */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: ANIMATION_DURATION, ease: EASE_OUT_QUINT }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="h-full max-h-full relative touch-pan-y"
            style={{ 
              transformStyle: 'preserve-3d',
              aspectRatio: '3/4',
              maxWidth: 'min(100%, calc((100vh - 140px) * 0.75))', // 3:4 ratio based on available height
            }}
          >
            {isCoverPage ? (
              <CoverPage issue={issue} contributors={pages} />
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

      {/* Thumbnails */}
      <div className="flex-shrink-0 h-16 sm:h-18 flex items-center justify-center px-2">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Cover */}
          <Thumbnail
            active={currentPage === 0}
            onClick={() => goToPage(0)}
            coverUrl={issue.cover_url}
          />
          
          {/* Pages */}
          {pages.map((p, i) => (
            <Thumbnail
              key={p.id}
              active={currentPage === i + 1}
              onClick={() => goToPage(i + 1)}
              bgColor={p.content?.background?.value}
              pageNum={i + 1}
              title={p.profiles?.name}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// Thumbnail Component
function Thumbnail({ 
  active, 
  onClick, 
  coverUrl, 
  bgColor, 
  pageNum, 
  title 
}: { 
  active: boolean;
  onClick: () => void;
  coverUrl?: string | null;
  bgColor?: string;
  pageNum?: number;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex-shrink-0 rounded overflow-hidden transition-all ${
        active 
          ? 'ring-2 ring-white ring-offset-1 ring-offset-[#111] scale-105' 
          : 'opacity-50 hover:opacity-80'
      }`}
    >
      <div 
        className="w-7 h-10 sm:w-8 sm:h-11 flex items-center justify-center text-[7px] sm:text-[8px] font-medium"
        style={{ backgroundColor: bgColor || '#faf9f6' }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : pageNum ? (
          <span className="text-gray-500">{pageNum}</span>
        ) : null}
      </div>
    </button>
  );
}

// Cover Page Component
function CoverPage({ issue, contributors }: { issue: IssueData; contributors: PageData[] }) {
  const contributorNames = contributors
    .map(p => p.profiles?.name)
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="w-full h-full rounded shadow-2xl overflow-hidden relative bg-[#faf9f6]">
      {issue.cover_url ? (
        <>
          <img 
            src={issue.cover_url} 
            alt={`${issue.zines?.name} Issue ${issue.issue_number}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="relative h-full flex flex-col p-4 sm:p-6 md:p-8">
            <span className="text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.2em] font-light">
              Issue {issue.issue_number}
            </span>
            <div className="flex-1 flex items-start justify-center pt-4 sm:pt-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-wide text-center drop-shadow-lg">
                {issue.zines?.name}
              </h1>
            </div>
            <div className="text-center space-y-2">
              {contributorNames && (
                <p className="text-[9px] sm:text-[10px] text-white/80 tracking-wide">
                  {contributorNames}
                </p>
              )}
              <p className="text-[10px] sm:text-[11px] text-white/60 uppercase tracking-[0.15em]">
                {formatMonth(issue.month)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: PAPER_TEXTURE }} />
          <div className="relative h-full flex flex-col p-4 sm:p-6 md:p-8">
            <span className="text-[10px] sm:text-[11px] text-[#888] uppercase tracking-[0.2em]">
              Issue {issue.issue_number}
            </span>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#2d2d2d] tracking-wide">
                {issue.zines?.name}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-[#666] mt-2">
                {formatMonth(issue.month)}
              </p>
            </div>
            {contributorNames && (
              <p className="text-[9px] sm:text-[10px] text-[#888] text-center tracking-wide">
                {contributorNames}
              </p>
            )}
          </div>
        </>
      )}
      
      {/* Spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-2 bg-gradient-to-r from-black/20 to-transparent" />
      <div className="absolute right-0 top-2 bottom-2 w-0.5 sm:w-1 bg-gradient-to-l from-black/10 to-transparent" />
    </div>
  );
}

// Reference canvas size (matches editor's max-w-sm at 3:4 aspect)
const REFERENCE_WIDTH = 384;
const REFERENCE_HEIGHT = 512;

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
  const hasContent = page.content?.blocks?.length > 0;

  return (
    <div 
      className="w-full h-full rounded shadow-2xl overflow-hidden relative"
      style={{ backgroundColor: bgColor, containerType: 'size' }}
    >
      {hasContent ? (
        <div className="relative w-full h-full overflow-hidden">
          {page.content.blocks.map((block: Block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      ) : (
        <EmptyPage profile={page.profiles} />
      )}

      {/* Author badge */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm z-10">
        <Avatar 
          url={page.profiles?.avatar_url} 
          color={page.profiles?.color} 
          name={page.profiles?.name}
          size="sm"
        />
        <span className="text-xs sm:text-sm text-gray-700">{page.profiles?.name}</span>
      </div>

      {/* Page number */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-[10px] sm:text-[11px] text-gray-400 font-light z-10">
        {pageNumber} / {totalPages}
      </div>

      {/* Magazine name */}
      <div className="absolute top-2 sm:top-4 left-0 right-0 text-center z-10">
        <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-[0.15em]">
          {zineName}
        </span>
      </div>

      {/* Spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-2 bg-gradient-to-r from-black/10 to-transparent" />
      <div className="absolute right-0 top-2 bottom-2 w-0.5 sm:w-1 bg-gradient-to-l from-black/5 to-transparent" />
    </div>
  );
}

// Font size as percentage of container (relative to reference)
const FONT_SIZE_PERCENT: Record<string, number> = {
  sm: 3.5,   // ~14px / 400px
  md: 4.5,   // ~18px / 400px
  lg: 6,     // ~24px / 400px
  xl: 9,     // ~36px / 400px
};

// Block Renderer - uses percentage positioning for responsive scaling
function BlockRenderer({ block }: { block: Block }) {
  // Convert pixel positions to percentages based on reference canvas size
  const leftPercent = Math.min((block.position.x / REFERENCE_WIDTH) * 100, 95);
  const topPercent = Math.min((block.position.y / REFERENCE_HEIGHT) * 100, 95);

  // Render image with frame
  const renderImage = (imageBlock: Block & { type: 'image' }) => {
    const frame = imageBlock.frame || 'polaroid';
    const { width = 200, height = 250 } = imageBlock.size || {};
    
    // Convert size to percentages, cap at 90% to prevent overflow
    const widthPercent = Math.min((width / REFERENCE_WIDTH) * 100, 85);
    
    const frameStyles: Record<string, { container: string; inner: string }> = {
      none: { container: '', inner: 'rounded' },
      polaroid: { container: 'bg-white p-[3%] pb-[8%] shadow-lg rounded', inner: '' },
      rounded: { container: 'shadow-lg', inner: 'rounded-xl' },
      film: { container: 'bg-[#1a1a1a] p-[2%] shadow-lg', inner: 'border-2 border-[#333]' },
      torn: { container: 'bg-white p-[3%] shadow-lg', inner: 'border-4 border-white' },
    };
    
    const style = frameStyles[frame] || frameStyles.polaroid;
    
    return (
      <div className={style.container} style={{ width: `${widthPercent}%` }}>
        {imageBlock.src ? (
          <img
            src={imageBlock.src}
            alt=""
            className={`w-full object-cover ${style.inner}`}
            style={{ aspectRatio: `${width}/${height}` }}
          />
        ) : (
          <div
            className={`w-full bg-gray-100 flex items-center justify-center text-gray-400 ${style.inner}`}
            style={{ aspectRatio: `${width}/${height}` }}
          >
            📷
          </div>
        )}
      </div>
    );
  };

  // Calculate max width for text to prevent overflow
  const maxWidthPercent = Math.max(95 - leftPercent, 30);

  return (
    <div
      className="absolute"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: `rotate(${block.rotation}deg)`,
        zIndex: block.zIndex,
        maxWidth: `${maxWidthPercent}%`,
      }}
    >
      {block.type === 'text' && (
        <p 
          className="whitespace-pre-wrap break-words leading-snug"
          style={{ 
            color: block.color,
            fontSize: `${FONT_SIZE_PERCENT[block.size] || FONT_SIZE_PERCENT.md}cqw`,
            fontFamily: FONT_FAMILIES[block.style] || FONT_FAMILIES.sans,
            textAlign: block.align || 'left',
          }}
        >
          {block.content}
        </p>
      )}
      {block.type === 'image' && renderImage(block)}
      {block.type === 'sticker' && (
        <span 
          style={{ 
            fontSize: `${8 * (block.scale || 1)}cqw`,
            lineHeight: 1,
          }}
        >
          {block.stickerId}
        </span>
      )}
    </div>
  );
}

// Empty Page
function EmptyPage({ profile }: { profile: PageData['profiles'] }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Avatar 
        url={profile?.avatar_url} 
        color={profile?.color} 
        name={profile?.name}
        size="lg"
      />
      <p className="text-base sm:text-lg font-medium text-gray-600 mt-4">
        {profile?.name}&apos;s page
      </p>
      <p className="text-xs sm:text-sm text-gray-400 mt-1">No content yet</p>
    </div>
  );
}

// Avatar Component
function Avatar({ 
  url, 
  color, 
  name, 
  size = 'md' 
}: { 
  url?: string | null;
  color?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'w-4 h-4 sm:w-5 sm:h-5',
    md: 'w-6 h-6 sm:w-8 sm:h-8',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  };
  
  const textSizes = {
    sm: 'text-[8px] sm:text-[10px]',
    md: 'text-xs sm:text-sm',
    lg: 'text-xl sm:text-2xl',
  };

  if (url) {
    return (
      <img 
        src={url} 
        alt={name || ''} 
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div 
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white ${textSizes[size]}`}
      style={{ backgroundColor: color || '#6366f1' }}
    >
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}
