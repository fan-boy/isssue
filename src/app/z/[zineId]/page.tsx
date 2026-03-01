'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { transitions, formatMonth } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

// Types
interface ZineData {
  id: string;
  name: string;
  release_day: number;
  owner_id: string;
}

interface IssueData {
  id: string;
  issue_number: number;
  month: string;
  status: 'draft' | 'locked' | 'published';
  edit_deadline: string;
  release_date: string;
  cover_url: string | null;
}

interface PageData {
  id: string;
  user_id: string;
  content: { blocks: unknown[] };
  status: 'draft' | 'ready';
  profiles: { name: string; color: string; avatar_url: string | null };
}

interface MemberData {
  user_id: string;
  profiles: { id: string; name: string; color: string; avatar_url: string | null };
}

// Utility functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDaysUntil = (dateString: string): number => {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

// Constants
const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

const EASE_OUT_QUINT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function ZineHomePage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [zine, setZine] = useState<ZineData | null>(null);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [draftIssuePages, setDraftIssuePages] = useState<PageData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: zineData, error: zineError } = await supabase
        .from('zines')
        .select('*')
        .eq('id', zineId)
        .single();
        
      if (zineError || !zineData) {
        router.push('/dashboard');
        return;
      }
      setZine(zineData);

      const { data: membersData } = await supabase
        .from('memberships')
        .select('user_id, profiles(id, name, color, avatar_url)')
        .eq('zine_id', zineId);
      if (membersData) setMembers(membersData as unknown as MemberData[]);

      const { data: issuesData } = await supabase
        .from('issues')
        .select('*')
        .eq('zine_id', zineId)
        .order('issue_number', { ascending: false });
        
      if (issuesData) {
        setIssues(issuesData);
        
        const draftIssue = issuesData.find(i => i.status === 'draft');
        if (draftIssue) {
          const { data: pagesData } = await supabase
            .from('pages')
            .select('id, user_id, content, status, profiles(name, color, avatar_url)')
            .eq('issue_id', draftIssue.id)
            .order('page_number', { ascending: true });
          if (pagesData) setDraftIssuePages(pagesData as unknown as PageData[]);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [zineId, router]);

  if (loading) {
    return (
      <main className="min-h-screen min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  if (!zine) return null;

  const latestPublished = issues.find(i => i.status === 'published');
  const lockedIssue = issues.find(i => i.status === 'locked');
  const draftIssue = issues.find(i => i.status === 'draft');
  const archiveIssues = issues.filter(i => i.status === 'published' && i.id !== latestPublished?.id);
  const isOwner = user?.id === zine.owner_id;
  const pagesReady = draftIssuePages.filter(p => p.status === 'ready').length;
  const totalMembers = members.length;

  return (
    <main className="min-h-screen min-h-[100dvh] bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors">
              ←
            </Link>
            <span className="text-base sm:text-lg md:text-xl font-semibold text-white truncate">
              {zine.name}
            </span>
          </div>
          <Link 
            href={`/z/${zineId}/settings`} 
            className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors"
          >
            Settings
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
        >
          {/* Issues Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16 md:mb-20">
            {(latestPublished || lockedIssue) && (
              <PublishedCard
                issue={latestPublished || lockedIssue!}
                zine={zine}
                zineId={zineId}
                isPublished={!!latestPublished}
              />
            )}

            {draftIssue && (
              <DraftCard
                issue={draftIssue}
                zine={zine}
                zineId={zineId}
                members={members}
                pages={draftIssuePages}
                isOwner={isOwner}
                pagesReady={pagesReady}
                totalMembers={totalMembers}
              />
            )}
          </div>

          {/* Archive */}
          {archiveIssues.length > 0 && (
            <section>
              <h2 className="text-xs sm:text-sm text-white/50 uppercase tracking-widest mb-4 sm:mb-6">
                Archive
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {archiveIssues.map((issue, index) => (
                  <ArchiveCard 
                    key={issue.id} 
                    issue={issue} 
                    zineId={zineId} 
                    index={index} 
                  />
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </main>
  );
}

// Published Issue Card
function PublishedCard({ 
  issue, 
  zine, 
  zineId, 
  isPublished 
}: { 
  issue: IssueData;
  zine: ZineData;
  zineId: string;
  isPublished: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <Link href={`/z/${zineId}/issue/${issue.id}`}>
        <motion.div 
          whileHover={{ y: -8, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
          transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          className="w-56 sm:w-60 md:w-64 lg:w-72 aspect-[3/4] relative cursor-pointer rounded-sm bg-[#faf9f6] shadow-2xl overflow-hidden"
        >
          {issue.cover_url ? (
            <>
              <img 
                src={issue.cover_url} 
                alt={`${zine.name} Issue ${issue.issue_number}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
              <div className="relative h-full flex flex-col p-4 sm:p-5 md:p-6">
                <span className="text-[9px] sm:text-[10px] text-white/80 uppercase tracking-[0.2em] font-light">
                  Issue {issue.issue_number}
                </span>
                <div className="flex-1 flex items-start justify-center pt-2 sm:pt-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-white tracking-wide drop-shadow-lg text-center">
                    {zine.name}
                  </h2>
                </div>
                <p className="text-[8px] sm:text-[9px] text-white/70 uppercase tracking-[0.15em] text-center">
                  {formatMonth(issue.month)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: PAPER_TEXTURE }} />
              <div className="relative h-full flex flex-col p-4 sm:p-5 md:p-6">
                <span className="text-[9px] sm:text-[10px] text-[#888] uppercase tracking-[0.2em]">
                  Issue {issue.issue_number}
                </span>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-[#2d2d2d] tracking-wide mb-1">
                    {zine.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#666]">{formatMonth(issue.month)}</p>
                </div>
              </div>
            </>
          )}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/20 to-transparent" />
        </motion.div>
      </Link>
      
      <div className="mt-3 sm:mt-4 flex items-center gap-2">
        <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
          isPublished 
            ? 'bg-green-500/10 text-green-400/80' 
            : 'bg-amber-500/10 text-amber-400/80'
        }`}>
          {isPublished ? 'Latest Issue' : 'Coming Soon'}
        </span>
        <span className="text-[9px] sm:text-[10px] text-white/30">
          {formatDate(issue.release_date)}
        </span>
      </div>
    </div>
  );
}

// Draft Issue Card
function DraftCard({
  issue,
  zine,
  zineId,
  members,
  pages,
  isOwner,
  pagesReady,
  totalMembers,
}: {
  issue: IssueData;
  zine: ZineData;
  zineId: string;
  members: MemberData[];
  pages: PageData[];
  isOwner: boolean;
  pagesReady: number;
  totalMembers: number;
}) {
  const daysUntilDeadline = getDaysUntil(issue.edit_deadline);

  return (
    <div className="flex flex-col items-center">
      <Link href={`/z/${zineId}/issue/${issue.id}/edit`}>
        <motion.div 
          whileHover={{ y: -6, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}
          transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          className="w-44 sm:w-48 md:w-52 aspect-[3/4] relative cursor-pointer rounded-sm bg-[#faf9f6] shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: PAPER_TEXTURE }} />
          
          <div className="relative h-full flex flex-col p-3 sm:p-4 md:p-5">
            <div className="flex items-start justify-between">
              <span className="text-[8px] sm:text-[9px] text-[#888] uppercase tracking-[0.15em]">
                Issue {issue.issue_number}
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-base sm:text-lg md:text-xl font-serif text-[#2d2d2d] tracking-wide mb-1">
                {zine.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#666]">{formatMonth(issue.month)}</p>
              
              <div className="mt-3 sm:mt-4 flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: totalMembers }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${i < pagesReady ? 'bg-green-500' : 'bg-[#ccc]'}`}
                  />
                ))}
              </div>
              <p className="text-[7px] sm:text-[8px] text-[#999] mt-1">
                {pagesReady}/{totalMembers} ready
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-[7px] sm:text-[8px] text-[#999] uppercase tracking-[0.1em]">
                Deadline {formatDate(issue.edit_deadline)}
              </p>
            </div>
          </div>
          
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/15 to-transparent" />
        </motion.div>
      </Link>
      
      <div className="mt-3 sm:mt-4 w-44 sm:w-48 md:w-52 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider bg-blue-500/10 text-blue-400/80">
            Now Editing
          </span>
          <span className="text-[9px] sm:text-[10px] text-white/30">
            {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'Due today'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1 sm:-space-x-1.5">
            {members.slice(0, 4).map((member) => {
              const page = pages.find(p => p.user_id === member.user_id);
              const isReady = page?.status === 'ready';
              
              return (
                <Avatar
                  key={member.user_id}
                  url={member.profiles?.avatar_url}
                  color={member.profiles?.color}
                  name={member.profiles?.name}
                  isReady={isReady}
                />
              );
            })}
          </div>
          {members.length > 4 && (
            <span className="text-[9px] sm:text-[10px] text-white/40">
              +{members.length - 4}
            </span>
          )}
          {isOwner && (
            <Link 
              href={`/z/${zineId}/settings`}
              className="text-[9px] sm:text-[10px] text-white/30 hover:text-white transition-colors ml-auto"
            >
              Invite
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Archive Card
function ArchiveCard({ 
  issue, 
  zineId, 
  index 
}: { 
  issue: IssueData;
  zineId: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/z/${zineId}/issue/${issue.id}`}>
        <motion.div
          whileHover={{ y: -4 }}
          className="aspect-[3/4] rounded-sm bg-[#faf9f6] cursor-pointer shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
        >
          {issue.cover_url ? (
            <>
              <img 
                src={issue.cover_url} 
                alt={`Issue ${issue.issue_number}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
              <div className="relative z-10 flex flex-col h-full p-2 sm:p-3">
                <span className="text-[7px] sm:text-[8px] text-white/80 uppercase tracking-widest">
                  Issue {issue.issue_number}
                </span>
                <div className="flex-1" />
                <span className="text-[9px] sm:text-xs text-white/90 font-serif text-center">
                  {formatMonth(issue.month)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: PAPER_TEXTURE }} />
              <div className="relative z-10 flex flex-col h-full p-2 sm:p-3">
                <span className="text-[7px] sm:text-[8px] text-[#999] uppercase tracking-widest">
                  Issue {issue.issue_number}
                </span>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[9px] sm:text-xs text-[#666] font-serif">
                    {formatMonth(issue.month)}
                  </span>
                </div>
              </div>
            </>
          )}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-black/10 to-transparent" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Avatar Component
function Avatar({ 
  url, 
  color, 
  name, 
  isReady 
}: { 
  url?: string | null;
  color?: string;
  name?: string;
  isReady?: boolean;
}) {
  const ringClass = isReady ? 'ring-2 ring-green-500' : 'ring-2 ring-[#0a0a0a]';
  
  return (
    <div className={`relative rounded-full ${ringClass}`} title={`${name}${isReady ? ' ✓' : ''}`}>
      {url ? (
        <img 
          src={url} 
          alt={name || ''}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
        />
      ) : (
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px]"
          style={{ backgroundColor: color || '#666' }}
        >
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}
