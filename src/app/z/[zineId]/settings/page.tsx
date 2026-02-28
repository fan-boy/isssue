'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { transitions } from '@/lib/utils';

const mockMembers = [
  { id: '1', name: 'Adi', email: 'adi@example.com', role: 'owner', color: '#e57373' },
  { id: '2', name: 'Maya', email: 'maya@example.com', role: 'member', color: '#64b5f6' },
  { id: '3', name: 'Jordan', email: 'jordan@example.com', role: 'member', color: '#81c784' },
  { id: '4', name: 'Sam', email: 'sam@example.com', role: 'member', color: '#ba68c8' },
];

export default function ZineSettingsPage() {
  const params = useParams();
  const zineId = params.zineId as string;
  const [zineName, setZineName] = useState('Studio Friends');
  const [releaseDay, setReleaseDay] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
  };

  return (
    <main className="min-h-screen bg-[#f5f3eb]">
      {/* Header */}
      <header className="border-b border-[#e0ddd5] bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/z/${zineId}`} className="text-[#8a8a8a] hover:text-[#5a5a5a]">
            ← Back
          </Link>
          <span className="font-medium text-[#2d2d2d]">Settings</span>
          <div className="w-8" />
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
          {/* Zine Details */}
          <section className="bg-white border border-[#e0ddd5] rounded-xl p-6">
            <h2 className="text-lg font-medium text-[#2d2d2d] mb-4">Zine Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#5a5a5a] mb-1">Name</label>
                <input
                  type="text"
                  value={zineName}
                  onChange={(e) => setZineName(e.target.value)}
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
            </div>
          </section>

          {/* Members */}
          <section className="bg-white border border-[#e0ddd5] rounded-xl p-6">
            <h2 className="text-lg font-medium text-[#2d2d2d] mb-4">
              Members ({mockMembers.length}/10)
            </h2>
            
            {/* Invite Form */}
            <form onSubmit={handleInvite} className="flex gap-2 mb-6">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email..."
                className="flex-1 px-4 py-2 bg-[#f5f3eb] border border-[#e0ddd5] rounded-lg text-[#2d2d2d] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d]"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-[#2d2d2d] text-white rounded-lg font-medium"
              >
                Invite
              </motion.button>
            </form>

            {/* Member List */}
            <div className="space-y-3">
              {mockMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <div>
                      <div className="text-[#2d2d2d] font-medium">{member.name}</div>
                      <div className="text-sm text-[#8a8a8a]">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'owner' ? (
                      <span className="text-xs text-[#8a8a8a] bg-[#f0f0f0] px-2 py-1 rounded">
                        Owner
                      </span>
                    ) : (
                      <button className="text-sm text-red-500 hover:text-red-600">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
            <p className="text-sm text-[#5a5a5a] mb-4">
              Once you delete a zine, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors">
              Delete Zine
            </button>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
