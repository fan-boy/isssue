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
}

interface PageData {
  id: string;
  user_id: string;
  content: { blocks: unknown[] };
  profiles: { name: string; color: string; avatar_url: string | null };
}

export default function ZineHomePage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [zine, setZine] = useState<ZineData | null>(null);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [currentIssuePages, setCurrentIssuePages] = useState<PageData[]>([]);
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

      const { data: issuesData } = await supabase
        .from('issues').select('*').eq('zine_id', zineId)
        .order('issue_number', { ascending: false });
      if (issuesData) {
        setIssues(issuesData);
        if (issuesData.length > 0) {
          const { data: pagesData } = await supabase
            .from('pages')
            .select('id, user_id, content, profiles(name, color, avatar_url)')
            .eq('issue_id', issuesData[0].id)
            .order('page_number', { ascending: true });
          if (pagesData) setCurrentIssuePages(pagesData as unknown as PageData[]);
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

  const currentIssue = issues[0];
  const pastIssues = issues.slice(1);
  const isOwner = user?.id === zine.owner_id;

  const daysUntilDeadline = currentIssue ? Math.ceil(
    (new Date(currentIssue.edit_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ) : 0;

  const pagesWithContent = currentIssuePages.filter(p => p.content?.blocks?.length > 0).length;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors">
              ←
            </Link>
            <span className="text-xl font-semibold text-white">{zine.name}</span>
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
        >
          {/* Current Issue */}
          {currentIssue && (
            <div className="grid md:grid-cols-[280px_1fr] gap-12 mb-16">
              {/* Magazine Cover - Clean, editorial style */}
              <motion.div 
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] relative"
              >
                <div className="absolute inset-0 rounded-sm bg-[#faf9f6] shadow-lg overflow-hidden">
                  {/* Paper texture */}
                  <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                  }} />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col p-6">
                    {/* Top */}
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] text-[#666] uppercase tracking-[0.2em]">
                        Issue {currentIssue.issue_number}
                      </span>
                      {currentIssue.status === 'draft' && (
                        <span className="w-2 h-2 rounded-full bg-[#2d2d2d]" title="In progress" />
                      )}
                    </div>
                    
                    {/* Center */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <h2 className="text-2xl font-serif text-[#2d2d2d] tracking-wide mb-2">
                        {zine.name}
                      </h2>
                      <p className="text-sm text-[#666]">{formatMonth(currentIssue.month)}</p>
                      
                      {currentIssue.status === 'draft' && (
                        <p className="text-[10px] text-[#999] mt-4 uppercase tracking-widest">
                          {pagesWithContent} of {currentIssuePages.length} pages ready
                        </p>
                      )}
                    </div>
                    
                    {/* Bottom */}
                    <div className="text-center">
                      <p className="text-[9px] text-[#999] uppercase tracking-[0.15em]">
                        {currentIssue.status === 'draft' 
                          ? (daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Due today')
                          : 'Published'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/20 to-transparent" />
                </div>
              </motion.div>

              {/* Issue Details */}
              <div className="flex flex-col justify-center">
                <p className="text-white/40 text-sm uppercase tracking-widest mb-3">
                  {currentIssue.status === 'draft' ? 'Now Editing' : 'Latest Issue'}
                </p>
                
                <h1 className="text-4xl font-serif text-white mb-2">
                  Issue {currentIssue.issue_number}
                </h1>
                <p className="text-white/50 text-lg mb-8">
                  {formatMonth(currentIssue.month)}
                </p>

                {/* Action Button */}
                {currentIssue.status === 'draft' ? (
                  <Link href={`/z/${zineId}/issue/${currentIssue.id}/edit`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-[#faf9f6] text-[#2d2d2d] rounded-sm font-medium text-lg hover:bg-white transition-colors"
                    >
                      Edit Your Page
                    </motion.button>
                  </Link>
                ) : (
                  <Link href={`/z/${zineId}/issue/${currentIssue.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-[#faf9f6] text-[#2d2d2d] rounded-sm font-medium text-lg hover:bg-white transition-colors"
                    >
                      Read Issue
                    </motion.button>
                  </Link>
                )}

                {/* Contributors */}
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm text-white/50 uppercase tracking-widest">Contributors</h3>
                    {isOwner && (
                      <Link 
                        href={`/z/${zineId}/settings`}
                        className="text-sm text-white/40 hover:text-white transition-colors"
                      >
                        + Invite
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {currentIssuePages.map((page) => {
                      const hasContent = page.content?.blocks?.length > 0;
                      return (
                        <div 
                          key={page.id} 
                          className="flex items-center gap-2"
                        >
                          {page.profiles?.avatar_url ? (
                            <img 
                              src={page.profiles.avatar_url} 
                              alt={page.profiles.name}
                              className={`w-8 h-8 rounded-full object-cover ${hasContent ? 'ring-2 ring-green-500' : 'opacity-50'}`}
                            />
                          ) : (
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${hasContent ? 'ring-2 ring-green-500' : 'opacity-50'}`}
                              style={{ backgroundColor: page.profiles?.color || '#666' }}
                            >
                              {page.profiles?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className={`text-sm ${hasContent ? 'text-white' : 'text-white/40'}`}>
                            {page.profiles?.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Past Issues */}
          {pastIssues.length > 0 && (
            <div>
              <h2 className="text-sm text-white/50 uppercase tracking-widest mb-6">Archive</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {pastIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/z/${zineId}/issue/${issue.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="aspect-[3/4] rounded-sm bg-[#faf9f6] p-3 flex flex-col cursor-pointer shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
                      >
                        {/* Paper texture */}
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }} />
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <span className="text-[8px] text-[#999] uppercase tracking-widest">
                            Issue {issue.issue_number}
                          </span>
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-xs text-[#666] font-serif">{formatMonth(issue.month)}</span>
                          </div>
                        </div>
                        
                        {/* Spine */}
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
