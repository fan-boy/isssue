'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  color: string;
  sharedZines: number;
}

const AVATAR_COLORS = [
  '#e57373', '#f06292', '#ba68c8', '#9575cd',
  '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
  '#4db6ac', '#81c784', '#aed581', '#ffd54f',
  '#ffb74d', '#ff8a65', '#a1887f', '#90a4ae',
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, email, color')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || '');
        setColor(profileData.color || '#6366f1');
      }

      // Get friends (people who share zines with this user)
      // First get all zines the user is part of
      const { data: userMemberships } = await supabase
        .from('memberships')
        .select('zine_id')
        .eq('user_id', user.id);

      if (userMemberships && userMemberships.length > 0) {
        const zineIds = userMemberships.map(m => m.zine_id);
        
        // Get all other members of those zines
        const { data: otherMemberships } = await supabase
          .from('memberships')
          .select('user_id, zine_id, profiles(id, name, email, color)')
          .in('zine_id', zineIds)
          .neq('user_id', user.id);

        if (otherMemberships) {
          // Group by user and count shared zines
          const friendMap = new Map<string, Friend>();
          for (const m of otherMemberships) {
            const p = m.profiles as unknown as Profile;
            if (!p) continue;
            
            if (friendMap.has(p.id)) {
              friendMap.get(p.id)!.sharedZines++;
            } else {
              friendMap.set(p.id, {
                id: p.id,
                name: p.name || 'Unknown',
                email: p.email || '',
                color: p.color || '#6366f1',
                sharedZines: 1,
              });
            }
          }
          setFriends(Array.from(friendMap.values()));
        }
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ name, color })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile saved!' });
      setProfile(prev => prev ? { ...prev, name, color } : null);
    }
    setSaving(false);
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
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors">
            ← Back
          </Link>
          <span className="font-medium text-white">Profile</span>
          <div className="w-12" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Profile Card */}
          <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-6 mb-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: color }}
              >
                {name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">{name || 'Your Name'}</h1>
                <p className="text-white/50">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Avatar Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`aspect-square rounded-lg transition-all ${
                        color === c 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-90' 
                          : 'hover:scale-95'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium disabled:opacity-50 hover:bg-white/90 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </section>

          {/* Friends */}
          <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Friends</h2>
            <p className="text-sm text-white/50 mb-6">People you share zines with</p>

            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: friend.color }}
                      >
                        {friend.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{friend.name}</p>
                        <p className="text-sm text-white/40">{friend.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                      {friend.sharedZines} zine{friend.sharedZines !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-3">👋</p>
                <p className="text-white/50">No friends yet</p>
                <p className="text-sm text-white/30 mt-1">Invite people to your zines to connect!</p>
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </main>
  );
}
