'use client';

import { useEffect, useState, useRef } from 'react';
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
  avatar_url: string | null;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  color: string;
  avatar_url: string | null;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        .select('id, name, email, color, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || '');
        setColor(profileData.color || '#6366f1');
        setAvatarUrl(profileData.avatar_url);
      }

      // Get friends (people who share zines with this user)
      const { data: userMemberships } = await supabase
        .from('memberships')
        .select('zine_id')
        .eq('user_id', user.id);

      if (userMemberships && userMemberships.length > 0) {
        const zineIds = userMemberships.map(m => m.zine_id);
        
        const { data: otherMemberships } = await supabase
          .from('memberships')
          .select('user_id, zine_id, profiles(id, name, email, color, avatar_url)')
          .in('zine_id', zineIds)
          .neq('user_id', user.id);

        if (otherMemberships) {
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
                avatar_url: p.avatar_url,
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Delete old avatar if exists
    if (avatarUrl) {
      const oldPath = avatarUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
      }
    }

    // Upload new avatar
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to upload photo' });
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    const newUrl = urlData.publicUrl + '?t=' + Date.now(); // Cache bust

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', user.id);

    if (updateError) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } else {
      setAvatarUrl(newUrl);
      setMessage({ type: 'success', text: 'Photo uploaded!' });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = async () => {
    if (!user || !avatarUrl) return;

    setUploading(true);
    const supabase = createClient();

    // Update profile to remove avatar
    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    setAvatarUrl(null);
    setUploading(false);
    setMessage({ type: 'success', text: 'Photo removed' });
  };

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
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handlePhotoUpload} 
        className="hidden" 
      />

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
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={name || 'Profile'} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                
                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium"
                >
                  {uploading ? '...' : '📷'}
                </button>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <p className="text-white/40 text-xs mt-2">Max 5MB, JPG or PNG</p>
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
                <label className="block text-sm text-white/60 mb-2">
                  Avatar Color {avatarUrl && <span className="text-white/30">(used as fallback)</span>}
                </label>
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

              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <input
                  type="text"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
                />
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
                      {friend.avatar_url ? (
                        <img 
                          src={friend.avatar_url} 
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: friend.color }}
                        >
                          {friend.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
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
