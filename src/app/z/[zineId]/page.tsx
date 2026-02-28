'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { transitions } from '@/lib/utils';

// Mock data
const mockIssue = {
  id: 'issue-1',
  issueNumber: 3,
  month: '2026-03',
  status: 'draft' as const,
  editDeadline: '2026-02-28',
  releaseDate: '2026-03-01',
  pages: [
    { id: 'page-1', user: { name: 'Adi', color: '#e57373' }, hasContent: true },
    { id: 'page-2', user: { name: 'Maya', color: '#64b5f6' }, hasContent: true },
    { id: 'page-3', user: { name: 'Jordan', color: '#81c784' }, hasContent: false },
    { id: 'page-4', user: { name: 'Sam', color: '#ba68c8' }, hasContent: true },
  ],
};

export default function ZineHomePage() {
  const params = useParams();
  const zineId = params.zineId as string;

  const daysUntilDeadline = Math.ceil(
    (new Date(mockIssue.editDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <main className="min-h-screen bg-[#f5f3eb]">
      {/* Header */}
      <header className="border-b border-[#e0ddd5] bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#8a8a8a] hover:text-[#5a5a5a]">
              ←
            </Link>
            <span className="text-xl font-serif text-[#2d2d2d]">Studio Friends</span>
          </div>
          <Link href={`/z/${zineId}/settings`} className="text-sm text-[#8a8a8a] hover:text-[#5a5a5a]">
            Settings
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
        >
          {/* Current Issue Card */}
          <div className="bg-white border border-[#e0ddd5] rounded-xl p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm text-[#8a8a8a] mb-1">Current Issue</div>
                <h1 className="text-4xl font-serif text-[#2d2d2d]">
                  Issue #{mockIssue.issueNumber}
                </h1>
                <p className="text-[#5a5a5a] mt-2">March 2026</p>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                  mockIssue.status === 'draft' 
                    ? 'bg-amber-100 text-amber-700'
                    : mockIssue.status === 'locked'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {mockIssue.status === 'draft' ? 'Editing Open' : 
                   mockIssue.status === 'locked' ? 'Locked' : 'Published'}
                </div>
                {mockIssue.status === 'draft' && (
                  <p className="text-sm text-[#8a8a8a] mt-2">
                    {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Due today!'}
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            {mockIssue.status === 'draft' ? (
              <Link href={`/z/${zineId}/issue/${mockIssue.id}/edit`}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={transitions.snap}
                  className="w-full px-6 py-4 bg-[#2d2d2d] text-white rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors"
                >
                  Edit Your Page
                </motion.button>
              </Link>
            ) : (
              <Link href={`/z/${zineId}/issue/${mockIssue.id}`}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={transitions.snap}
                  className="w-full px-6 py-4 bg-[#2d2d2d] text-white rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors"
                >
                  View Issue
                </motion.button>
              </Link>
            )}
          </div>

          {/* Members Progress */}
          <div className="bg-white border border-[#e0ddd5] rounded-xl p-6">
            <h2 className="text-lg font-medium text-[#2d2d2d] mb-4">Contributors</h2>
            <div className="space-y-3">
              {mockIssue.pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: page.user.color }}
                    />
                    <span className="text-[#2d2d2d]">{page.user.name}</span>
                  </div>
                  <div className={`text-sm ${page.hasContent ? 'text-green-600' : 'text-[#aaa]'}`}>
                    {page.hasContent ? '✓ Started' : 'Not started'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
