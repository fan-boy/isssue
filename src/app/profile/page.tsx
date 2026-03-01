'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, Avatar, Header, PageContainer, Message } from '@/components/ui';
import type { User } from '@supabase/supabase-js';

// Wrapper to handle Suspense requirement for useSearchParams
function ProfilePageContent() {
  return <ProfilePageInner />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}

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

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  
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
  const [nameError, setNameError] = useState<string | null>(null);

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
        setColor(profileData.color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
        setAvatarUrl(profileData.avatar_url);
      }

      // Get friends (skip if onboarding)
      if (!isOnboarding) {
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
      }

      setLoading(false);
    }

    loadData();
  }, [router, isOnboarding]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to upload photo' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    const newUrl = urlData.publicUrl + '?t=' + Date.now();

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
    
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    
    setNameError(null);
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ name: trimmedName, color })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setSaving(false);
      return;
    }
    
    setProfile(prev => prev ? { ...prev, name: trimmedName, color } : null);
    
    if (isOnboarding) {
      // Redirect to dashboard after onboarding
      router.push('/dashboard');
    } else {
      setMessage({ type: 'success', text: 'Profile saved!' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  // Onboarding mode - simplified UI
  if (isOnboarding) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handlePhotoUpload} 
          className="hidden" 
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-white mb-3">Welcome to Zine</h1>
            <p className="text-white/50">Let's set up your profile</p>
          </div>

          <Card padding="lg">
            {message && (
              <div className="mb-6">
                <Message type={message.type}>{message.text}</Message>
              </div>
            )}

            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-4">
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
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium"
                >
                  {uploading ? '...' : '📷'}
                </button>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                {uploading ? 'Uploading...' : 'Add a photo (optional)'}
              </button>
            </div>

            {/* Name */}
            <div className="mb-6">
              <Input
                label="Your name *"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(null); }}
                placeholder="What should we call you?"
                error={nameError || undefined}
                autoFocus
              />
            </div>

            {/* Color */}
            <div className="mb-8">
              <label className="block text-sm text-white/60 mb-3">Pick a color</label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`aspect-square rounded-full transition-all ${
                      color === c 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-90' 
                        : 'hover:scale-95'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              loading={saving}
              disabled={!name.trim()}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Continue'}
            </Button>
          </Card>
        </motion.div>
      </main>
    );
  }

  // Regular profile page
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handlePhotoUpload} 
        className="hidden" 
      />

      <Header 
        title="Profile"
        backHref="/dashboard"
      />

      <PageContainer size="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {message && <Message type={message.type}>{message.text}</Message>}

          {/* Profile Card */}
          <Card>
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <Avatar src={avatarUrl} name={name} color={color} size="xl" className="w-24 h-24" />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium"
                >
                  {uploading ? '...' : '📷'}
                </button>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <p className="text-white/40 text-xs mt-2">Max 5MB, JPG or PNG</p>
            </div>

            <div className="space-y-5">
              <Input
                label="Display Name *"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(null); }}
                placeholder="Your name"
                error={nameError || undefined}
              />

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Avatar Color {avatarUrl && <span className="text-white/30">(fallback)</span>}
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
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-sm text-white/50 cursor-not-allowed"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={!name.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>

          {/* Friends */}
          <Card>
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
                      <Avatar src={friend.avatar_url} name={friend.name} color={friend.color} size="lg" />
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
          </Card>
        </motion.div>
      </PageContainer>
    </main>
  );
}
