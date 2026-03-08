'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { transitions } from '@/lib/utils';

const floatingElements = [
  { id: 1, rotation: -12, x: '8%', y: '18%', delay: 0 },
  { id: 2, rotation: 8, x: '88%', y: '15%', delay: 0.1 },
  { id: 3, rotation: -5, x: '82%', y: '65%', delay: 0.2 },
  { id: 4, rotation: 15, x: '5%', y: '70%', delay: 0.15 },
  { id: 5, rotation: -8, x: '75%', y: '40%', delay: 0.25 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f3eb] relative overflow-hidden">
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating decorative elements */}
      {floatingElements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ opacity: 0, scale: 0.8, rotate: el.rotation - 10 }}
          animate={{ opacity: 1, scale: 1, rotate: el.rotation }}
          transition={{ delay: el.delay + 0.5, ...transitions.easeOutQuint }}
          className="absolute hidden md:block pointer-events-none"
          style={{ left: el.x, top: el.y }}
        >
          <FloatingSticker index={el.id} />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.easeOutQuint}
            className="text-center max-w-3xl"
          >
            {/* Tape decoration */}
            <motion.div
              initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
              animate={{ opacity: 1, rotate: -12, scale: 1 }}
              transition={{ delay: 0.2, ...transitions.easeOutQuint }}
              className="inline-block mb-6"
            >
              <div className="bg-[#f0e6a0]/80 px-6 py-2 text-sm font-medium text-[#5a5200] tracking-wide uppercase transform -rotate-2 shadow-sm">
                ✨ Now Open
              </div>
            </motion.div>

            {/* Main headline */}
            <h1 className="relative mb-8">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, ...transitions.easeOutQuint }}
                className="block text-7xl md:text-9xl font-serif text-[#2d2d2d] leading-[0.85]"
              >
                i<span className="underline decoration-wavy decoration-[#e57373] underline-offset-8">sss</span>ue
              </motion.span>
              <motion.span
                initial={{ opacity: 0, rotate: 5 }}
                animate={{ opacity: 1, rotate: 3 }}
                transition={{ delay: 0.3, ...transitions.easeOutQuint }}
                className="absolute -right-4 md:-right-8 top-0 text-2xl md:text-3xl text-[#e57373]"
              >
                ✦
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...transitions.easeOutQuint }}
              className="text-xl md:text-2xl text-[#5a5a5a] mb-4 leading-relaxed font-light"
            >
              A monthly collaborative magazine where
              <br />
              <span className="font-serif italic">friends each get a page</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ...transitions.easeOutQuint }}
              className="text-base text-[#8a8a8a] mb-10 max-w-lg mx-auto"
            >
              Create your page in secret. On release day, everyone&apos;s pages are revealed at once. 
              React, annotate, and save the moments that matter.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, ...transitions.easeOutQuint }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              <FeaturePill rotation={-2}>Create together</FeaturePill>
              <FeaturePill rotation={1}>Reveal together</FeaturePill>
              <FeaturePill rotation={-1}>React & annotate</FeaturePill>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ...transitions.easeOutQuint }}
            >
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={transitions.snap}
                  className="px-8 py-4 bg-[#2d2d2d] text-white rounded-full text-lg font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg"
                >
                  Start your isssue →
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Preview stack */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ...transitions.easeOutQuint }}
            className="mt-16 w-full max-w-3xl"
          >
            <ZinePreview />
          </motion.div>

        </section>

        {/* Who it&apos;s for Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transitions.easeOutQuint}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-[#2d2d2d] mb-4">
                Who it&apos;s for
              </h2>
              <p className="text-[#8a8a8a] max-w-lg mx-auto">
                Any group that wants to stay connected through creativity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <WhoCard
                emoji="👯"
                title="Friend Groups"
                description="The group chat, but make it a magazine. Monthly updates from everyone&apos;s lives."
                delay={0}
                rotation={-2}
              />
              <WhoCard
                emoji="💕"
                title="Couples"
                description="Document your relationship. A shared scrapbook you both contribute to."
                delay={0.1}
                rotation={1}
              />
              <WhoCard
                emoji="🌍"
                title="Long-distance"
                description="When you can't be there in person, share pages instead. Stay in each other's lives."
                delay={0.2}
                rotation={-1}
              />
              <WhoCard
                emoji="👨‍👩‍👧‍👦"
                title="Families"
                description="Grandparents, cousins, everyone. A family newsletter that's actually fun."
                delay={0.3}
                rotation={2}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transitions.easeOutQuint}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-[#2d2d2d] mb-4">
                How it works
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <HowItWorksCard
                number="01"
                title="Gather your crew"
                description="Start an isssue and invite up to 9 friends. Each person gets their own page in the monthly issue."
                rotation={-2}
                delay={0}
              />
              <HowItWorksCard
                number="02"
                title="Create in secret"
                description="Add photos, write stories, share updates. Your page is private until release day — no peeking."
                rotation={1}
                delay={0.1}
              />
              <HowItWorksCard
                number="03"
                title="Reveal & react"
                description="On the 15th, everyone&apos;s pages are revealed. Flip through, leave comments, highlight your favorite moments."
                rotation={-1}
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-[#2d2d2d] relative overflow-hidden">
          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.3 }}
            viewport={{ once: true }}
            className="absolute top-10 left-10 text-6xl"
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.2 }}
            viewport={{ once: true }}
            className="absolute bottom-10 right-10 w-32 h-32 rounded-full border-2 border-dashed border-white/30"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.3 }}
            viewport={{ once: true }}
            className="absolute top-1/2 right-20 text-4xl hidden md:block"
          >
            →
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transitions.easeOutQuint}
            className="max-w-2xl mx-auto text-center relative z-10"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
              Start your first isssue
            </h2>
            <p className="text-[#888] mb-10 text-lg">
              Free to create. Invite your people. See what everyone&apos;s been up to.
            </p>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.snap}
                className="px-8 py-4 bg-white text-[#2d2d2d] rounded-full text-lg font-medium hover:bg-[#f5f3eb] transition-colors"
              >
                Get started →
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-[#1a1a1a]">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Logo & tagline */}
              <div>
                <h3 className="text-xl font-serif text-white mb-2">isssue</h3>
                <p className="text-sm text-[#666]">Create together, reveal together</p>
              </div>
              
              {/* Links */}
              <div className="flex flex-wrap gap-6 text-sm">
                <Link href="/login" className="text-[#888] hover:text-white transition-colors">
                  Log in
                </Link>
              </div>
            </div>
            
            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs text-[#555]">
                © {new Date().getFullYear()} isssue. All rights reserved.
              </p>
              <p className="text-xs text-[#555]">
                Made with ✦ for friends
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function FeaturePill({ children, rotation }: { children: React.ReactNode; rotation: number }) {
  return (
    <motion.span 
      whileHover={{ scale: 1.05, rotate: 0 }}
      className="px-4 py-2 bg-white border border-[#e0ddd5] rounded-full text-sm text-[#5a5a5a] shadow-sm cursor-default"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </motion.span>
  );
}

function FloatingSticker({ index }: { index: number }) {
  const stickers = [
    // Star burst
    <div key="star" className="w-16 h-16 text-4xl flex items-center justify-center bg-[#fff8e1] rounded-full shadow-md border border-[#f0e6a0]">
      ✦
    </div>,
    // Scribble circle
    <div key="circle" className="w-20 h-20 rounded-full border-2 border-dashed border-[#e57373]/40" />,
    // Tape piece
    <div key="tape" className="w-24 h-8 bg-[#d4edda]/60 transform -rotate-12 shadow-sm" />,
    // Arrow
    <div key="arrow" className="text-4xl text-[#64b5f6]/50">→</div>,
    // Another star
    <div key="star2" className="text-3xl text-[#ffb74d]/60">✦</div>,
  ];
  return stickers[(index - 1) % stickers.length];
}

function ZinePreview() {
  const previewPages = [
    { color: '#e57373', name: 'Maya', rotation: -8, zIndex: 3, x: -60 },
    { color: '#64b5f6', name: 'Jordan', rotation: 3, zIndex: 4, x: 0 },
    { color: '#81c784', name: 'Alex', rotation: 6, zIndex: 2, x: 60 },
  ];

  return (
    <div className="relative h-72 md:h-80 flex items-center justify-center">
      {previewPages.map((page, index) => (
        <motion.div
          key={page.name}
          initial={{ opacity: 0, y: 40, rotate: page.rotation + 10 }}
          animate={{ opacity: 1, y: 0, rotate: page.rotation }}
          transition={{ delay: 0.7 + index * 0.1, ...transitions.easeOutQuint }}
          whileHover={{ scale: 1.08, rotate: 0, zIndex: 10 }}
          className="absolute w-44 md:w-56 aspect-[3/4] bg-white rounded-lg shadow-2xl cursor-pointer overflow-hidden border border-[#e8e6e1]"
          style={{ 
            zIndex: page.zIndex,
            transform: `rotate(${page.rotation}deg) translateX(${page.x}px)`,
          }}
        >
          {/* Tape on top */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#f0e6a0]/80 transform -rotate-2 z-10" />
          
          {/* Page content mock */}
          <div className="h-full p-4 flex flex-col">
            <div className="flex-1 bg-[#f8f7f4] rounded-md mb-3 flex items-center justify-center overflow-hidden">
              <div className="text-4xl opacity-30">📷</div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#e8e6e1] rounded w-3/4" />
              <div className="h-2 bg-[#e8e6e1] rounded w-1/2" />
            </div>
            {/* Author indicator */}
            <div className="mt-3 flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full shadow-sm"
                style={{ backgroundColor: page.color }}
              />
              <span className="text-xs text-[#8a8a8a] font-medium">{page.name}&apos;s page</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function WhoCard({ 
  emoji, 
  title, 
  description,
  delay,
  rotation
}: { 
  emoji: string;
  title: string;
  description: string;
  delay: number;
  rotation: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ delay, ...transitions.easeOutQuint }}
      whileHover={{ scale: 1.03, rotate: 0 }}
      className="bg-white border border-[#e0ddd5] rounded-xl p-6 text-center shadow-sm cursor-default"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="font-medium text-[#2d2d2d] mb-2">{title}</h3>
      <p className="text-sm text-[#8a8a8a] leading-relaxed">{description}</p>
    </motion.div>
  );
}

function HowItWorksCard({ 
  number, 
  title, 
  description, 
  rotation,
  delay 
}: { 
  number: string;
  title: string;
  description: string;
  rotation: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ delay, ...transitions.easeOutQuint }}
      whileHover={{ scale: 1.02, rotate: 0 }}
      className="bg-[#f5f3eb] border border-[#e0ddd5] rounded-xl p-6 cursor-default"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="text-4xl font-serif text-[#e0ddd5] mb-3">{number}</div>
      <h3 className="text-lg font-medium text-[#2d2d2d] mb-2">{title}</h3>
      <p className="text-sm text-[#8a8a8a] leading-relaxed">{description}</p>
    </motion.div>
  );
}
