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
  issues: { id: string; status: string; issue_number: number }[];
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, color')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Get zines with membership and latest issue
      const { data: zinesData } = await supabase
        .from('zines')
        .select(`
          id,
          name,
          release_day,
          owner_id,
          memberships(user_id),
          issues(id, status, issue_number)
        `)
        .order('created_at', { ascending: false });

      if (zinesData) {
        setZines(zinesData);
      }

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
      <main className="min-h-screen bg-[#f5f3eb] flex items-center justify-center">
        <div className="text-[#8a8a8a]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3eb]">
      {/* Header */}
      <header className="border-b border-[#e0ddd5] bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-[#2d2d2d]">
            Zine
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-sm text-[#8a8a8a] hover:text-[#5a5a5a]"
            >
              Sign out
            </button>
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: profile?.color || '#e57373' }}
              title={profile?.name || user?.email || ''}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif text-[#2d2d2d]">Your Zines</h1>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={transitions.snap}
              className="px-5 py-2.5 bg-[#2d2d2d] text-white rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
            >
              + Create Zine
            </motion.button>
          </div>

          {/* Zine Grid */}
          {zines.length > 0 ? (
            <div className="grid gap-4">
              {zines.map((zine, index) => {
                const latestIssue = zine.issues?.[0];
                const memberCount = zine.memberships?.length || 1;
                
                return (
                  <motion.div
                    key={zine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, ...transitions.easeOutQuint }}
                  >
                    <Link href={`/z/${zine.id}`}>
                      <div className="bg-white border border-[#e0ddd5] rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-xl font-medium text-[#2d2d2d] mb-1">
                              {zine.name}
                            </h2>
                            <p className="text-sm text-[#8a8a8a]">
                              {memberCount} member{memberCount !== 1 ? 's' : ''}
                              {latestIssue && ` · Issue #${latestIssue.issue_number}`}
                            </p>
                          </div>
                          {latestIssue && (
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              latestIssue.status === 'draft' 
                                ? 'bg-amber-100 text-amber-700'
                                : latestIssue.status === 'locked'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {latestIssue.status === 'draft' ? 'Editing' : 
                               latestIssue.status === 'locked' ? 'Locked' : 'Published'}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#f0ede5] text-sm text-[#8a8a8a]">
                          Releases on the {zine.release_day}
                          {zine.release_day === 1 ? 'st' : 
                           zine.release_day === 2 ? 'nd' : 
                           zine.release_day === 3 ? 'rd' : 'th'} of each month
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">No zines yet</h2>
              <p className="text-[#8a8a8a] mb-6">Create your first zine and invite some friends</p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-[#2d2d2d] text-white rounded-full font-medium"
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

    // Create the zine
    const { data: zine, error: createError } = await supabase
      .from('zines')
      .insert({
        name,
        owner_id: user.id,
        release_day: releaseDay,
      })
      .select(`
        id,
        name,
        release_day,
        owner_id,
        memberships(user_id),
        issues(id, status, issue_number)
      `)
      .single();

    if (createError) {
      setError(createError.message);
      setLoading(false);
      return;
    }

    // Create the first issue
    const now = new Date();
    const releaseDate = new Date(now.getFullYear(), now.getMonth() + 1, releaseDay);
    const editDeadline = new Date(releaseDate);
    editDeadline.setDate(editDeadline.getDate() - 1);

    await supabase
      .from('issues')
      .insert({
        zine_id: zine.id,
        issue_number: 1,
        month: `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`,
        edit_deadline: editDeadline.toISOString(),
        release_date: releaseDate.toISOString(),
      });

    onCreated(zine);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-medium text-[#2d2d2d] mb-4">Create a Zine</h2>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-[#5a5a5a] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Studio Friends"
              required
              className="w-full px-4 py-2 bg-[#f5f3eb] border border-[#e0ddd5] rounded-lg text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d]"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#5a5a5a] mb-1">Release Day</label>
            <select
              value={releaseDay}
              onChange={(e) => setReleaseDay(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-[#f5f3eb] border border-[#e0ddd5] rounded-lg text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d]"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#e0ddd5] rounded-lg text-[#5a5a5a] hover:bg-[#f5f3eb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 px-4 py-2 bg-[#2d2d2d] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
