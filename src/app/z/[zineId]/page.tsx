'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { transitions, formatMonth } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getDaysUntil(dateString: string): number {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

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
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: zineData, error: zineError } = await supabase
        .from('zines').select('*').eq('id', zineId).single();
      if (zineError || !zineData) { router.push('/dashboard'); return; }
      setZine(zineData);

      // Get all members
      const { data: membersData } = await supabase
        .from('memberships')
        .select('user_id, profiles(id, name, color, avatar_url)')
        .eq('zine_id', zineId);
      if (membersData) setMembers(membersData as unknown as MemberData[]);

      const { data: issuesData } = await supabase
        .from('issues').select('*').eq('zine_id', zineId)
        .order('issue_number', { ascending: false });
      if (issuesData) {
        setIssues(issuesData);
        
        // Load pages for the draft issue (if exists)
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
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  if (!zine) return null;

  // Find latest published/locked issue and current draft
  const latestPublished = issues.find(i => i.status === 'published');
  const lockedIssue = issues.find(i => i.status === 'locked');
  const draftIssue = issues.find(i => i.status === 'draft');
  
  // Archive = all published issues except the latest one shown above
  const archiveIssues = issues.filter(i => 
    i.status === 'published' && i.id !== latestPublished?.id
  );

  const isOwner = user?.id === zine.owner_id;
  const pagesReady = draftIssuePages.filter(p => p.status === 'ready').length;
  const totalMembers = members.length;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors flex-shrink-0">
              ←
            </Link>
            <span className="text-lg md:text-xl font-semibold text-white truncate">{zine.name}</span>
          </div>
          <Link 
            href={`/z/${zineId}/settings`} 
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Settings
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
        >
          {/* Current Issues - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
            {/* Latest Published or Locked Issue */}
            {(latestPublished || lockedIssue) && (
              <IssueCard
                issue={latestPublished || lockedIssue!}
                zine={zine}
                zineId={zineId}
                type={latestPublished ? 'published' : 'locked'}
              />
            )}

            {/* Current Draft Issue */}
            {draftIssue && (
              <DraftIssueCard
                issue={draftIssue}
                zine={zine}
                zineId={zineId}
                members={members}
                pages={draftIssuePages}
                user={user}
                isOwner={isOwner}
                pagesReady={pagesReady}
                totalMembers={totalMembers}
              />
            )}

            {/* If only one issue exists (no published yet, only draft) */}
            {!latestPublished && !lockedIssue && draftIssue && (
              <div className="hidden md:flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                <p className="text-white/30 text-sm">First issue coming soon!</p>
              </div>
            )}
          </div>

          {/* Archive */}
          {archiveIssues.length > 0 && (
            <div>
              <h2 className="text-sm text-white/50 uppercase tracking-widest mb-6">Archive</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {archiveIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
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
                            <div className="relative z-10 flex flex-col h-full p-3">
                              <span className="text-[8px] text-white/80 uppercase tracking-widest">
                                Issue {issue.issue_number}
                              </span>
                              <div className="flex-1" />
                              <span className="text-xs text-white/90 font-serif text-center">{formatMonth(issue.month)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 opacity-30" style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                            }} />
                            <div className="relative z-10 flex flex-col h-full p-3">
                              <span className="text-[8px] text-[#999] uppercase tracking-widest">
                                Issue {issue.issue_number}
                              </span>
                              <div className="flex-1 flex items-center justify-center">
                                <span className="text-xs text-[#666] font-serif">{formatMonth(issue.month)}</span>
                              </div>
                            </div>
                          </>
                        )}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-black/10 to-transparent" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

// Published/Locked Issue Card - Magazine Style
function IssueCard({ 
  issue, 
  zine, 
  zineId, 
  type 
}: { 
  issue: IssueData; 
  zine: ZineData; 
  zineId: string; 
  type: 'published' | 'locked';
}) {
  const isPublished = type === 'published';
  
  return (
    <div className="flex flex-col">
      {/* Status + Date */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isPublished 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-amber-500/20 text-amber-400'
        }`}>
          {isPublished ? 'Published' : 'Locked'}
        </span>
        <span className="text-xs text-white/40">
          {formatDate(issue.release_date)}
        </span>
      </div>

      {/* Magazine Cover - Smaller */}
      <Link href={`/z/${zineId}/issue/${issue.id}`}>
        <motion.div 
          whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
          transition={{ duration: 0.2 }}
          className="w-44 aspect-[3/4] relative cursor-pointer rounded-sm bg-[#faf9f6] shadow-lg overflow-hidden"
        >
          {issue.cover_url ? (
            <>
              <img 
                src={issue.cover_url} 
                alt={`${zine.name} Issue ${issue.issue_number}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
              <div className="relative h-full flex flex-col p-4">
                <span className="text-[9px] text-white/70 uppercase tracking-[0.15em]">
                  Issue {issue.issue_number}
                </span>
                <div className="flex-1 flex items-start justify-center pt-2">
                  <h2 className="text-lg font-serif text-white tracking-wide drop-shadow-lg text-center">
                    {zine.name}
                  </h2>
                </div>
                <p className="text-[8px] text-white/60 uppercase tracking-[0.1em] text-center">
                  {formatMonth(issue.month)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
              }} />
              <div className="relative h-full flex flex-col p-4">
                <span className="text-[9px] text-[#888] uppercase tracking-[0.15em]">
                  Issue {issue.issue_number}
                </span>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-lg font-serif text-[#2d2d2d] tracking-wide mb-1">
                    {zine.name}
                  </h2>
                  <p className="text-xs text-[#666]">{formatMonth(issue.month)}</p>
                </div>
              </div>
            </>
          )}
          {/* Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-black/15 to-transparent" />
        </motion.div>
      </Link>
    </div>
  );
}

// Draft Issue Card
function DraftIssueCard({
  issue,
  zineId,
  members,
  pages,
  user,
  isOwner,
  pagesReady,
  totalMembers,
}: {
  issue: IssueData;
  zine: ZineData;
  zineId: string;
  members: MemberData[];
  pages: PageData[];
  user: User | null;
  isOwner: boolean;
  pagesReady: number;
  totalMembers: number;
}) {
  const daysUntilDeadline = getDaysUntil(issue.edit_deadline);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-400">
          Editing
        </span>
        <span className="text-xs text-white/40">
          {pagesReady}/{totalMembers} ready
        </span>
      </div>

      {/* Issue Info */}
      <div className="mb-4">
        <h3 className="text-lg font-serif text-white mb-0.5">Issue {issue.issue_number}</h3>
        <p className="text-white/50 text-sm">{formatMonth(issue.month)}</p>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Deadline</p>
          <p className="text-sm text-white">{formatDate(issue.edit_deadline)}</p>
          <p className="text-xs text-white/40">
            {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : daysUntilDeadline === 0 ? 'Today!' : 'Passed'}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Releases</p>
          <p className="text-sm text-white">{formatDate(issue.release_date)}</p>
        </div>
      </div>

      {/* Contributors */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Contributors</p>
          {isOwner && (
            <Link 
              href={`/z/${zineId}/settings`}
              className="text-[10px] text-white/30 hover:text-white transition-colors"
            >
              + Invite
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          {members.slice(0, 5).map((member) => {
            const page = pages.find(p => p.user_id === member.user_id);
            const isReady = page?.status === 'ready';
            const hasContent = (page?.content?.blocks?.length ?? 0) > 0;
            
            return (
              <div 
                key={member.user_id} 
                className={`relative ${isReady ? 'ring-2 ring-green-500 ring-offset-1 ring-offset-[#0a0a0a]' : ''} rounded-full`}
                title={`${member.profiles?.name}${isReady ? ' (ready)' : hasContent ? ' (editing)' : ''}`}
              >
                {member.profiles?.avatar_url ? (
                  <img 
                    src={member.profiles.avatar_url} 
                    alt={member.profiles.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: member.profiles?.color || '#666' }}
                  >
                    {member.profiles?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            );
          })}
          {members.length > 5 && (
            <span className="text-xs text-white/40 ml-1">+{members.length - 5}</span>
          )}
        </div>
      </div>

      {/* Edit Link */}
      <Link 
        href={`/z/${zineId}/issue/${issue.id}/edit`}
        className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1"
      >
        Edit your page →
      </Link>
    </div>
  );
}
