'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { transitions } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface Zine {
  id: string;
  name: string;
  release_day: number;
  owner_id: string;
  memberships: { user_id: string }[];
  issues: { id: string; status: string; issue_number: number; month: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ name: string; color: string; avatar_url: string | null } | null>(null);
  const [zines, setZines] = useState<Zine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, color, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      const { data: zinesData } = await supabase
        .from('zines')
        .select(`
          id, name, release_day, owner_id,
          memberships(user_id),
          issues(id, status, issue_number, month)
        `)
        .order('created_at', { ascending: false });

      if (zinesData) setZines(zinesData);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-white">
            Zine
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Sign out
            </button>
            <Link href="/profile">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile?.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-white/30 transition-all"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-white/30 transition-all flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: profile?.color || '#6366f1' }}
                  title={profile?.name || user?.email || ''}
                >
                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
        >
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-semibold text-white">Your Zines</h1>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={transitions.snap}
              className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              + New Zine
            </motion.button>
          </div>

          {/* Zine Grid - Magazine Cards */}
          {zines.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {zines.map((zine, index) => {
                const latestIssue = zine.issues?.sort((a, b) => b.issue_number - a.issue_number)[0];
                const memberCount = zine.memberships?.length || 1;
                const isDraft = latestIssue?.status === 'draft';
                
                return (
                  <motion.div
                    key={zine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ...transitions.easeOutQuint }}
                  >
                    <Link href={`/z/${zine.id}`}>
                      <motion.div 
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="aspect-[3/4] rounded-sm bg-[#faf9f6] p-5 flex flex-col cursor-pointer relative overflow-hidden group shadow-md hover:shadow-xl transition-shadow"
                      >
                        {/* Paper texture overlay */}
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }} />
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full">
                          {/* Top line */}
                          <div className="flex items-start justify-between text-[#2d2d2d]">
                            <span className="text-[10px] font-light tracking-widest uppercase">
                              {latestIssue ? `Issue ${latestIssue.issue_number}` : 'New'}
                            </span>
                            {isDraft && (
                              <span className="w-2 h-2 rounded-full bg-[#2d2d2d] animate-pulse" title="In progress" />
                            )}
                          </div>
                          
                          {/* Center - Magazine title */}
                          <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <h2 className="text-xl font-serif text-[#2d2d2d] tracking-wide">
                              {zine.name}
                            </h2>
                            {zine.owner_id === user?.id && (
                              <span className="text-[9px] text-[#999] mt-1 uppercase tracking-widest">Owner</span>
                            )}
                          </div>
                          
                          {/* Bottom */}
                          <div className="flex items-end justify-between text-[9px] text-[#999] uppercase tracking-wider">
                            <span>{memberCount} contributor{memberCount !== 1 ? 's' : ''}</span>
                            <span>Monthly</span>
                          </div>
                        </div>
                        
                        {/* Spine effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-black/10 to-transparent" />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📖</div>
              <h2 className="text-xl font-medium text-white mb-2">No zines yet</h2>
              <p className="text-white/50 mb-8">Create your first zine and invite friends</p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium"
              >
                Create Zine
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Zine Modal */}
      {showCreateModal && (
        <CreateZineModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={(zine) => {
            setZines([zine, ...zines]);
            setShowCreateModal(false);
          }}
        />
      )}
    </main>
  );
}

interface Friend {
  id: string;
  name: string;
  email: string;
  color: string;
  avatar_url: string | null;
}

function CreateZineModal({ 
  onClose, 
  onCreated 
}: { 
  onClose: () => void;
  onCreated: (zine: Zine) => void;
}) {
  const [name, setName] = useState('');
  const [releaseDay, setReleaseDay] = useState(1);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load friends on mount
  useEffect(() => {
    async function loadFriends() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all zines the user is part of
      const { data: userMemberships } = await supabase
        .from('memberships')
        .select('zine_id')
        .eq('user_id', user.id);

      if (userMemberships && userMemberships.length > 0) {
        const zineIds = userMemberships.map(m => m.zine_id);
        
        // Get all other members of those zines
        const { data: otherMemberships } = await supabase
          .from('memberships')
          .select('user_id, profiles(id, name, email, color, avatar_url)')
          .in('zine_id', zineIds)
          .neq('user_id', user.id);

        if (otherMemberships) {
          const friendMap = new Map<string, Friend>();
          for (const m of otherMemberships) {
            const p = m.profiles as unknown as Friend;
            if (p && !friendMap.has(p.id)) {
              friendMap.set(p.id, {
                id: p.id,
                name: p.name || 'Unknown',
                email: p.email || '',
                color: p.color || '#6366f1',
                avatar_url: p.avatar_url || null,
              });
            }
          }
          setFriends(Array.from(friendMap.values()));
        }
      }
      setLoadingFriends(false);
    }
    loadFriends();
  }, []);

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const { data: zine, error: createError } = await supabase
      .from('zines')
      .insert({ name, owner_id: user.id, release_day: releaseDay })
      .select(`
        id, name, release_day, owner_id,
        memberships(user_id),
        issues(id, status, issue_number, month)
      `)
      .single();

    if (createError) {
      setError(createError.message);
      setLoading(false);
      return;
    }

    // Create first issue
    const now = new Date();
    const releaseDate = new Date(now.getFullYear(), now.getMonth() + 1, releaseDay);
    const editDeadline = new Date(releaseDate);
    editDeadline.setDate(editDeadline.getDate() - 1);

    const { data: issue } = await supabase.from('issues').insert({
      zine_id: zine.id,
      issue_number: 1,
      month: `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`,
      edit_deadline: editDeadline.toISOString(),
      release_date: releaseDate.toISOString(),
    }).select().single();

    // Invite selected friends
    if (selectedFriends.size > 0 && issue) {
      const friendIds = Array.from(selectedFriends);
      
      // Add memberships for friends
      await supabase.from('memberships').insert(
        friendIds.map(userId => ({
          zine_id: zine.id,
          user_id: userId,
          role: 'member',
        }))
      );

      // Create pages for friends in the first issue
      const existingMembers = [user.id, ...friendIds];
      await supabase.from('pages').insert(
        existingMembers.map((userId, index) => ({
          issue_id: issue.id,
          user_id: userId,
          page_number: index + 1,
          content: { blocks: [], background: { type: 'color', value: '#FFFFFF' } },
        }))
      );
    }

    onCreated(zine);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Create a Zine</h2>
        
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Studio Friends"
              required
              autoFocus
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Release Day</label>
            <select
              value={releaseDay}
              onChange={(e) => setReleaseDay(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                </option>
              ))}
            </select>
          </div>

          {/* Friends to invite */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Invite Friends {selectedFriends.size > 0 && `(${selectedFriends.size} selected)`}
            </label>
            {loadingFriends ? (
              <div className="text-white/40 text-sm py-4 text-center">Loading friends...</div>
            ) : friends.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleFriend(friend.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedFriends.has(friend.id)
                        ? 'bg-violet-500/20 border border-violet-500/40'
                        : 'bg-[#0a0a0a] border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {friend.avatar_url ? (
                      <img 
                        src={friend.avatar_url} 
                        alt={friend.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: friend.color }}
                      >
                        {friend.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-medium">{friend.name}</p>
                      <p className="text-white/40 text-xs">{friend.email}</p>
                    </div>
                    {selectedFriends.has(friend.id) && (
                      <span className="text-violet-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-white/40 text-sm py-4 text-center bg-[#0a0a0a] rounded-lg border border-white/10">
                No friends yet — invite them after creating!
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 px-4 py-3 bg-white text-black rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
