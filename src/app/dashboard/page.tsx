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
  const [profile, setProfile] = useState<{ name: string; color: string } | null>(null);
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
        .select('name, color')
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
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: profile?.color || '#6366f1' }}
              title={profile?.name || user?.email || ''}
            />
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
                        whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                        className={`aspect-[3/4] rounded-xl p-5 flex flex-col cursor-pointer relative overflow-hidden group ${
                          isDraft 
                            ? '' 
                            : 'bg-[#1a1a1a] border border-white/10 hover:border-white/25'
                        }`}
                      >
                        {/* Gradient background for active drafts */}
                        {isDraft && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-transparent to-pink-500/40 rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl" />
                          </>
                        )}
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full">
                          {/* Top */}
                          <div className="flex items-start justify-between">
                            <span className={`text-[11px] font-mono ${isDraft ? 'text-white/60' : 'text-white/40'}`}>
                              {latestIssue ? `#${String(latestIssue.issue_number).padStart(2, '0')}` : 'NEW'}
                            </span>
                            {isDraft && (
                              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium rounded">
                                ✨ Active
                              </span>
                            )}
                          </div>
                          
                          {/* Center */}
                          <div className="flex-1 flex flex-col items-center justify-center text-center">
                            {isDraft && <span className="text-2xl mb-2">🎨</span>}
                            <h2 className="text-lg font-semibold text-white mb-1">
                              {zine.name}
                            </h2>
                            {zine.owner_id === user?.id && (
                              <span className={`text-[11px] ${isDraft ? 'text-white/50' : 'text-white/30'}`}>Owner</span>
                            )}
                          </div>
                          
                          {/* Bottom */}
                          <div className={`flex items-end justify-between text-[11px] ${isDraft ? 'text-white/60' : 'text-white/40'}`}>
                            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                            <span>Day {zine.release_day}</span>
                          </div>
                        </div>
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

function CreateZineModal({ 
  onClose, 
  onCreated 
}: { 
  onClose: () => void;
  onCreated: (zine: Zine) => void;
}) {
  const [name, setName] = useState('');
  const [releaseDay, setReleaseDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const now = new Date();
    const releaseDate = new Date(now.getFullYear(), now.getMonth() + 1, releaseDay);
    const editDeadline = new Date(releaseDate);
    editDeadline.setDate(editDeadline.getDate() - 1);

    await supabase.from('issues').insert({
      zine_id: zine.id,
      issue_number: 1,
      month: `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`,
      edit_deadline: editDeadline.toISOString(),
      release_date: releaseDate.toISOString(),
    });

    onCreated(zine);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md"
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
