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
  profiles: { name: string; color: string };
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
            .select('id, user_id, content, profiles(name, color)')
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
            <div className="grid md:grid-cols-[300px_1fr] gap-10 mb-16">
              {/* Magazine Cover - Exciting Draft Version */}
              <motion.div 
                className="aspect-[3/4] relative group"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
                style={{ perspective: '1000px' }}
              >
                {currentIssue.status === 'draft' ? (
                  // Draft: Exciting gradient cover
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/50 via-transparent to-pink-500/50 animate-pulse" style={{ animationDuration: '3s' }} />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-20" style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` 
                    }} />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col p-6 text-white">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-mono opacity-60">
                          #{String(currentIssue.issue_number).padStart(2, '0')}
                        </span>
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-[10px] font-medium uppercase tracking-wider">
                          In Progress
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-5xl mb-4 block">✨</span>
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">{zine.name}</h2>
                        <p className="text-sm opacity-80">{formatMonth(currentIssue.month)}</p>
                        <p className="text-xs opacity-60 mt-3">
                          {pagesWithContent}/{currentIssuePages.length} pages ready
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs opacity-60">
                          {daysUntilDeadline > 0 ? `${daysUntilDeadline} days until reveal` : 'Reveals today!'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Published: Clean cover
                  <div className="absolute inset-0 bg-[#1a1a1a] border border-white/10 rounded-xl p-6 flex flex-col">
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] text-white/40 font-mono">
                        #{String(currentIssue.issue_number).padStart(2, '0')}
                      </span>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-medium rounded">
                        Published
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <h2 className="text-xl font-semibold text-white mb-1">{zine.name}</h2>
                      <span className="text-sm text-white/40">{formatMonth(currentIssue.month)}</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Issue Details */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  {currentIssue.status === 'draft' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full text-violet-300 text-xs font-medium">
                      🎨 Creating Issue {currentIssue.issue_number}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-3">
                  {currentIssue.status === 'draft' ? 'Issue in Progress' : `Issue ${currentIssue.issue_number}`}
                </h1>
                <p className="text-white/50 text-lg mb-8">
                  {formatMonth(currentIssue.month)}
                  {currentIssue.status === 'draft' && daysUntilDeadline > 0 && (
                    <span className="text-violet-400"> · {daysUntilDeadline} days left</span>
                  )}
                </p>

                {/* Action Button */}
                {currentIssue.status === 'draft' ? (
                  <Link href={`/z/${zineId}/issue/${currentIssue.id}/edit`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
                    >
                      ✏️ Edit Your Page
                    </motion.button>
                  </Link>
                ) : (
                  <Link href={`/z/${zineId}/issue/${currentIssue.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-white/90 transition-all"
                    >
                      📖 Read Issue
                    </motion.button>
                  </Link>
                )}

                {/* Contributors */}
                <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white/60">Contributors</h3>
                    {isOwner && (
                      <Link 
                        href={`/z/${zineId}/settings`}
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        + Invite friends
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentIssuePages.map((page) => {
                      const hasContent = page.content?.blocks?.length > 0;
                      return (
                        <div 
                          key={page.id} 
                          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                            hasContent 
                              ? 'bg-green-500/10 border border-green-500/20' 
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div 
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: page.profiles?.color || '#6366f1' }}
                          />
                          <span className={`text-sm ${hasContent ? 'text-green-300' : 'text-white/60'}`}>
                            {page.profiles?.name}
                          </span>
                          {hasContent && <span className="text-green-400 text-xs">✓</span>}
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
              <h2 className="text-lg font-medium text-white mb-6">Past Issues</h2>
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
                        className="aspect-[3/4] bg-[#1a1a1a] border border-white/10 rounded-lg p-3 flex flex-col cursor-pointer hover:border-white/20 transition-colors"
                      >
                        <span className="text-[10px] text-white/40 font-mono">
                          #{String(issue.issue_number).padStart(2, '0')}
                        </span>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-xs text-white/60">{formatMonth(issue.month)}</span>
                        </div>
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
