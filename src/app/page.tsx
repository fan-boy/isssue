'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { transitions } from '@/lib/utils';

const floatingElements = [
  { id: 1, rotation: -12, x: '10%', y: '15%', delay: 0 },
  { id: 2, rotation: 8, x: '85%', y: '20%', delay: 0.1 },
  { id: 3, rotation: -5, x: '75%', y: '70%', delay: 0.2 },
  { id: 4, rotation: 15, x: '5%', y: '65%', delay: 0.15 },
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
          transition={{ delay: el.delay + 0.3, ...transitions.easeOutQuint }}
          className="absolute hidden md:block"
          style={{ left: el.x, top: el.y }}
        >
          <FloatingSticker index={el.id} />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Hero section */}
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
            <div className="bg-[#f0e6a0]/80 px-6 py-2 text-sm font-medium text-[#5a5200] tracking-wide uppercase transform -rotate-2">
              Coming Soon
            </div>
          </motion.div>

          {/* Main headline - collage style */}
          <h1 className="relative mb-8">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, ...transitions.easeOutQuint }}
              className="block text-7xl md:text-9xl font-serif text-[#2d2d2d] leading-[0.85]"
            >
              Zine
            </motion.span>
            <motion.span
              initial={{ opacity: 0, rotate: 5 }}
              animate={{ opacity: 1, rotate: 3 }}
              transition={{ delay: 0.2, ...transitions.easeOutQuint }}
              className="absolute -right-4 md:-right-8 top-0 text-2xl md:text-3xl font-hand text-[#e57373] transform rotate-3"
            >
              ✦
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...transitions.easeOutQuint }}
            className="text-xl md:text-2xl text-[#5a5a5a] mb-6 leading-relaxed font-light"
          >
            A monthly collaborative zine where
            <br />
            <span className="font-serif italic">friends each get a page</span>
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...transitions.easeOutQuint }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <FeaturePill rotation={-2}>Create together</FeaturePill>
            <FeaturePill rotation={1}>Reveal together</FeaturePill>
            <FeaturePill rotation={-1}>Annotate & react</FeaturePill>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ...transitions.easeOutQuint }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.snap}
                className="px-8 py-4 bg-[#2d2d2d] text-white rounded-full text-lg font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg"
              >
                Start Your Zine
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.snap}
                className="px-6 py-3 text-[#5a5a5a] hover:text-[#2d2d2d] text-lg transition-colors"
              >
                View Demo →
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Preview section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ...transitions.easeOutQuint }}
          className="mt-20 w-full max-w-4xl"
        >
          <ZinePreview />
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ...transitions.easeOutQuint }}
          className="mt-32 w-full max-w-4xl"
        >
          <h2 className="text-center text-sm uppercase tracking-widest text-[#8a8a8a] mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <HowItWorksCard
              number="01"
              title="Gather your crew"
              description="Invite up to 9 friends. Each person gets their own page in the monthly issue."
              rotation={-2}
              delay={0.9}
            />
            <HowItWorksCard
              number="02"
              title="Create in secret"
              description="Design your page with photos, text, and stickers. No peeking at others' pages."
              rotation={1}
              delay={1}
            />
            <HowItWorksCard
              number="03"
              title="Reveal & react"
              description="On release day, flip through everyone's pages. Highlight, annotate, and react."
              rotation={-1}
              delay={1.1}
            />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, ...transitions.easeOutQuint }}
          className="mt-32 text-center text-sm text-[#aaa]"
        >
          <p>Magazine nostalgia meets modern web</p>
        </motion.footer>
      </div>
    </main>
  );
}

function FeaturePill({ children, rotation }: { children: React.ReactNode; rotation: number }) {
  return (
    <span 
      className="px-4 py-2 bg-white border border-[#e0ddd5] rounded-full text-sm text-[#5a5a5a] shadow-sm"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </span>
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
    <div key="tape" className="w-24 h-8 bg-[#d4edda]/60 transform -rotate-12" />,
    // Arrow
    <div key="arrow" className="text-3xl text-[#64b5f6]/50">→</div>,
  ];
  return stickers[(index - 1) % stickers.length];
}

function ZinePreview() {
  const previewPages = [
    { color: '#e57373', name: 'Adi', rotation: -6, zIndex: 3 },
    { color: '#64b5f6', name: 'Maya', rotation: 4, zIndex: 2 },
    { color: '#81c784', name: 'Jordan', rotation: -2, zIndex: 1 },
  ];

  return (
    <div className="relative h-80 md:h-96 flex items-center justify-center">
      {previewPages.map((page, index) => (
        <motion.div
          key={page.name}
          initial={{ opacity: 0, y: 40, rotate: page.rotation + 10 }}
          animate={{ opacity: 1, y: 0, rotate: page.rotation }}
          transition={{ delay: 0.7 + index * 0.1, ...transitions.easeOutQuint }}
          whileHover={{ scale: 1.05, rotate: page.rotation / 2, zIndex: 10 }}
          className="absolute w-48 md:w-64 aspect-[3/4] bg-white rounded-lg shadow-xl cursor-pointer overflow-hidden"
          style={{ 
            zIndex: page.zIndex,
            transform: `rotate(${page.rotation}deg) translateX(${(index - 1) * 80}px)`,
          }}
        >
          {/* Page content mock */}
          <div className="h-full p-4 flex flex-col">
            <div className="flex-1 bg-[#f8f7f4] rounded-md mb-3 flex items-center justify-center">
              <div className="text-4xl opacity-20">📷</div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#e0ddd5] rounded w-3/4" />
              <div className="h-2 bg-[#e0ddd5] rounded w-1/2" />
            </div>
            {/* Author indicator */}
            <div className="mt-3 flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: page.color }}
              />
              <span className="text-xs text-[#8a8a8a]">{page.name}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
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
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ delay, ...transitions.easeOutQuint }}
      whileHover={{ scale: 1.02, rotate: 0 }}
      className="bg-white border border-[#e0ddd5] rounded-xl p-6 shadow-sm cursor-default"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="text-4xl font-serif text-[#e0ddd5] mb-3">{number}</div>
      <h3 className="text-lg font-medium text-[#2d2d2d] mb-2">{title}</h3>
      <p className="text-sm text-[#8a8a8a] leading-relaxed">{description}</p>
    </motion.div>
  );
}
