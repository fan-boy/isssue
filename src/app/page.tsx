'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { transitions } from '@/lib/utils';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f6] relative overflow-hidden">
      {/* Paper texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating trinkets */}
      <Trinket type="stamp" x="6%" y="15%" rotation={-8} delay={0.3} />
      <Trinket type="star" x="92%" y="12%" rotation={12} delay={0.4} />
      <Trinket type="tape" x="85%" y="55%" rotation={-15} delay={0.5} />
      <Trinket type="paperclip" x="4%" y="60%" rotation={20} delay={0.35} />
      <Trinket type="scribble" x="88%" y="80%" rotation={0} delay={0.45} />
      <Trinket type="heart" x="10%" y="38%" rotation={-10} delay={0.55} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
          className="text-center max-w-2xl"
        >
          {/* Small label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...transitions.easeOutQuint }}
            className="mb-8"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#999]">
              A collaborative magazine
            </span>
          </motion.div>

          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...transitions.easeOutQuint }}
            className="mb-8"
          >
            <span className="text-6xl md:text-8xl font-medium tracking-tight text-[#1a1a1a]">
              i
              <span className="relative">
                sss
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#ff6b6b] origin-left"
                />
              </span>
              ue
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ...transitions.easeOutQuint }}
            className="text-lg md:text-xl text-[#666] mb-10 leading-relaxed"
          >
            Friends each get a page.<br />
            Nobody sees the others until release day.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, ...transitions.easeOutQuint }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.snap}
                className="px-8 py-4 bg-[#1a1a1a] text-white rounded-full text-base font-medium hover:bg-[#333] transition-colors"
              >
                Start your isssue →
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, ...transitions.easeOutQuint }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            <Tag>Monthly drops</Tag>
            <Tag>Up to 10 friends</Tag>
            <Tag>React & annotate</Tag>
          </motion.div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, ...transitions.easeOutQuint }}
          className="mt-20 w-full max-w-3xl"
        >
          <IsssuePreview />
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, ...transitions.easeOutQuint }}
          className="mt-32 w-full max-w-3xl"
        >
          <h2 className="text-center text-xs tracking-[0.2em] uppercase text-[#bbb] mb-12">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number="1"
              title="Gather your crew"
              description="Invite your closest friends. Each person claims a page."
              delay={0.75}
            />
            <StepCard
              number="2"
              title="Create in secret"
              description="Fill your page with photos, text, stickers. No peeking."
              delay={0.85}
            />
            <StepCard
              number="3"
              title="Reveal together"
              description="First of the month, the issue drops. Flip through & react."
              delay={0.95}
            />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, ...transitions.easeOutQuint }}
          className="mt-32 text-center text-sm text-[#ccc]"
        >
          Made for friends who miss magazines
        </motion.footer>
      </div>
    </main>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-full text-xs text-[#888] shadow-sm">
      {children}
    </span>
  );
}

function Trinket({ 
  type, 
  x, 
  y, 
  rotation, 
  delay 
}: { 
  type: 'stamp' | 'star' | 'tape' | 'paperclip' | 'scribble' | 'heart';
  x: string;
  y: string;
  rotation: number;
  delay: number;
}) {
  const trinkets = {
    stamp: (
      <div className="w-16 h-16 border-2 border-dashed border-[#ddd] rounded-lg flex flex-col items-center justify-center gap-0.5 bg-white/50">
        <span className="text-[10px] text-[#bbb] font-mono">MAR</span>
        <span className="text-lg text-[#ccc] font-mono font-bold">01</span>
      </div>
    ),
    star: (
      <div className="text-4xl text-amber-300/60">✦</div>
    ),
    tape: (
      <div className="w-24 h-8 bg-[#fef3c7]/70 shadow-sm" />
    ),
    paperclip: (
      <div className="text-3xl text-[#ccc]">📎</div>
    ),
    scribble: (
      <svg width="60" height="30" viewBox="0 0 60 30" className="text-[#ddd]">
        <path d="M5 15 Q 15 5, 25 15 T 45 15 T 55 15" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    heart: (
      <div className="text-2xl text-rose-300/50">♥</div>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ delay, ...transitions.easeOutQuint }}
      className="absolute hidden md:block pointer-events-none"
      style={{ left: x, top: y }}
    >
      {trinkets[type]}
    </motion.div>
  );
}

function IsssuePreview() {
  const pages = [
    { color: '#f87171', initial: 'A', rotation: -6, offset: -90 },
    { color: '#60a5fa', initial: 'M', rotation: 2, offset: 0 },
    { color: '#4ade80', initial: 'J', rotation: -3, offset: 90 },
  ];

  return (
    <div className="relative h-64 md:h-80 flex items-center justify-center">
      {pages.map((page, index) => (
        <motion.div
          key={page.initial}
          initial={{ opacity: 0, y: 40, rotate: page.rotation + 10 }}
          animate={{ opacity: 1, y: 0, rotate: page.rotation }}
          transition={{ delay: 0.6 + index * 0.08, ...transitions.easeOutQuint }}
          whileHover={{ 
            scale: 1.05, 
            rotate: 0, 
            zIndex: 10,
            y: -10,
            transition: { duration: 0.2 }
          }}
          className="absolute w-36 md:w-48 aspect-[3/4] bg-white border border-[#e5e5e5] rounded-lg shadow-lg cursor-pointer overflow-hidden"
          style={{ 
            zIndex: 3 - index,
            transform: `translateX(${page.offset}px) rotate(${page.rotation}deg)`,
          }}
        >
          <div className="h-full p-3 md:p-4 flex flex-col">
            {/* Image area */}
            <div className="flex-1 bg-[#f8f8f8] rounded mb-2 md:mb-3 flex items-center justify-center">
              <span className="text-[#ddd] text-2xl">📷</span>
            </div>
            {/* Text lines */}
            <div className="space-y-1.5">
              <div className="h-1.5 bg-[#eee] rounded w-4/5" />
              <div className="h-1.5 bg-[#eee] rounded w-3/5" />
            </div>
            {/* Author */}
            <div className="mt-2 md:mt-3 flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                style={{ backgroundColor: page.color }}
              >
                {page.initial}
              </div>
              <div className="h-1.5 bg-[#eee] rounded w-10" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description, 
  delay 
}: { 
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...transitions.easeOutQuint }}
      className="text-center"
    >
      <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
        <span className="text-sm font-medium text-[#999]">{number}</span>
      </div>
      <h3 className="text-base font-medium text-[#333] mb-2">{title}</h3>
      <p className="text-sm text-[#999] leading-relaxed">{description}</p>
    </motion.div>
  );
}
