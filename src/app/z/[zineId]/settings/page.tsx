'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { transitions } from '@/lib/utils';

interface ZineData {
  id: string;
  name: string;
  release_day: number;
  owner_id: string;
}

interface MemberData {
  id: string;
  user_id: string;
  role: string;
  profiles: { id: string; name: string; email: string; color: string };
}

export default function ZineSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const zineId = params.zineId as string;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [zine, setZine] = useState<ZineData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [zineName, setZineName] = useState('');
  const [releaseDay, setReleaseDay] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: zineData, error: zineError } = await supabase
        .from('zines').select('*').eq('id', zineId).single();
      if (zineError || !zineData) { router.push('/dashboard'); return; }
      
      setZine(zineData);
      setZineName(zineData.name);
      setReleaseDay(zineData.release_day);

      const { data: membersData } = await supabase
        .from('memberships')
        .select('id, user_id, role, profiles(id, name, email, color)')
        .eq('zine_id', zineId);
      if (membersData) setMembers(membersData as unknown as MemberData[]);

      setLoading(false);
    }

    loadData();
  }, [zineId, router]);

  const handleSave = async () => {
    if (!zine) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('zines')
      .update({ name: zineName, release_day: releaseDay })
      .eq('id', zine.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Saved!' });
      setZine({ ...zine, name: zineName, release_day: releaseDay });
    }
    setSaving(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !zine) return;
    
    setInviting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), zineId: zine.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to send invite' });
      } else {
        setMessage({ type: 'success', text: data.message });
        
        if (data.alreadyUser) {
          const supabase = createClient();
          const { data: membersData } = await supabase
            .from('memberships')
            .select('id, user_id, role, profiles(id, name, email, color)')
            .eq('zine_id', zineId);
          if (membersData) setMembers(membersData as unknown as MemberData[]);
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to send invite' });
    }

    setInviteEmail('');
    setInviting(false);
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === zine?.owner_id) return;
    const supabase = createClient();
    await supabase.from('memberships').delete().eq('id', memberId);
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleDeleteZine = async () => {
    if (!zine || !confirm('Delete this zine? This cannot be undone.')) return;
    const supabase = createClient();
    await supabase.from('zines').delete().eq('id', zine.id);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  if (!zine) return null;
  const isOwner = userId === zine.owner_id;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/z/${zineId}`} className="text-white/50 hover:text-white transition-colors">
            ← Back
          </Link>
          <span className="font-medium text-white">Settings</span>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
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

          {/* Zine Details */}
          <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-6">Zine Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Name</label>
                <input
                  type="text"
                  value={zineName}
                  onChange={(e) => setZineName(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Release Day</label>
                <select
                  value={releaseDay}
                  onChange={(e) => setReleaseDay(parseInt(e.target.value))}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 disabled:opacity-50"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                    </option>
                  ))}
                </select>
              </div>
              {isOwner && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white text-black rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </section>

          {/* Members */}
          <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-6">
              Members ({members.length}/10)
            </h2>
            
            {/* Invite Form */}
            {isOwner && members.length < 10 && (
              <form onSubmit={handleInvite} className="flex gap-3 mb-6">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
                <motion.button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-3 bg-white text-black rounded-lg font-medium disabled:opacity-50"
                >
                  {inviting ? '...' : 'Invite'}
                </motion.button>
              </form>
            )}

            {/* Member List */}
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-full"
                      style={{ backgroundColor: member.profiles?.color || '#6366f1' }}
                    />
                    <div>
                      <div className="text-white font-medium">{member.profiles?.name || 'Unknown'}</div>
                      <div className="text-sm text-white/40">{member.profiles?.email}</div>
                    </div>
                  </div>
                  <div>
                    {member.role === 'owner' ? (
                      <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                        Owner
                      </span>
                    ) : isOwner && (
                      <button 
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          {isOwner && (
            <section className="bg-[#1a1a1a] border border-red-500/30 rounded-xl p-6">
              <h2 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-white/50 mb-4">
                Permanently delete this zine and all its content.
              </p>
              <button 
                onClick={handleDeleteZine}
                className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
              >
                Delete Zine
              </button>
            </section>
          )}
        </motion.div>
      </div>
    </main>
  );
}
