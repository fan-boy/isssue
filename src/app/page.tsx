'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { transitions } from '@/lib/utils';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating trinkets */}
      <Trinket type="stamp" x="8%" y="12%" rotation={-12} delay={0.3} />
      <Trinket type="star" x="88%" y="8%" rotation={15} delay={0.4} />
      <Trinket type="tape" x="82%" y="65%" rotation={-8} delay={0.5} />
      <Trinket type="paperclip" x="5%" y="70%" rotation={25} delay={0.35} />
      <Trinket type="ticket" x="90%" y="40%" rotation={-5} delay={0.45} />
      <Trinket type="heart" x="12%" y="45%" rotation={10} delay={0.55} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.easeOutQuint}
          className="text-center max-w-3xl"
        >
          {/* Handwritten label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ delay: 0.15, ...transitions.easeOutQuint }}
            className="inline-block mb-8"
          >
            <span className="text-sm text-white/40 font-mono tracking-widest uppercase">
              A collaborative magazine
            </span>
          </motion.div>

          {/* Logo / Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...transitions.easeOutQuint }}
            className="relative mb-6"
          >
            <span className="text-8xl md:text-[12rem] font-serif text-white leading-[0.85] tracking-tight">
              isssue
            </span>
            {/* Decorative elements around title */}
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="absolute -right-2 md:-right-6 -top-2 md:-top-4 text-2xl md:text-4xl"
            >
              ✳︎
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="absolute -left-4 md:-left-8 bottom-4 text-xl md:text-2xl text-white/20"
            >
              ✦
            </motion.span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ...transitions.easeOutQuint }}
            className="text-lg md:text-xl text-white/50 mb-10 leading-relaxed max-w-md mx-auto"
          >
            Friends each get a page. Nobody sees the others until release day.
          </motion.p>

          {/* Feature tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, ...transitions.easeOutQuint }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            <Tag>Monthly drops</Tag>
            <Tag>Up to 10 friends</Tag>
            <Tag>Collaborative chaos</Tag>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, ...transitions.easeOutQuint }}
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.snap}
                className="group relative px-8 py-4 bg-white text-black rounded-full text-lg font-medium hover:bg-white/90 transition-colors"
              >
                Start your isssue
                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ...transitions.easeOutQuint }}
          className="mt-24 w-full max-w-3xl"
        >
          <IsssuePreview />
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ...transitions.easeOutQuint }}
          className="mt-32 w-full max-w-4xl"
        >
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="h-px w-12 bg-white/10" />
            <h2 className="text-sm uppercase tracking-widest text-white/30">
              How it works
            </h2>
            <div className="h-px w-12 bg-white/10" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              number="01"
              title="Gather your crew"
              description="Invite your closest friends. Each person claims a page in the monthly issue."
              icon="👥"
              delay={0.9}
            />
            <StepCard
              number="02"
              title="Create in secret"
              description="Fill your page with photos, thoughts, doodles. No peeking at others."
              icon="✏️"
              delay={1}
            />
            <StepCard
              number="03"
              title="Reveal together"
              description="First of the month, the issue drops. Flip through, react, annotate."
              icon="🎉"
              delay={1.1}
            />
          </div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, ...transitions.easeOutQuint }}
          className="mt-32 flex items-center gap-3 text-white/20"
        >
          <span>✦</span>
          <span className="text-sm">Made for friends who miss magazines</span>
          <span>✦</span>
        </motion.div>
      </div>
    </main>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/60">
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
  type: 'stamp' | 'star' | 'tape' | 'paperclip' | 'ticket' | 'heart';
  x: string;
  y: string;
  rotation: number;
  delay: number;
}) {
  const trinkets = {
    stamp: (
      <div className="w-14 h-14 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
        <span className="text-white/30 text-xs font-mono">2026</span>
      </div>
    ),
    star: (
      <div className="text-3xl text-amber-400/40">✳︎</div>
    ),
    tape: (
      <div className="w-20 h-6 bg-amber-200/20 rounded-sm" />
    ),
    paperclip: (
      <div className="text-2xl text-white/20">📎</div>
    ),
    ticket: (
      <div className="w-8 h-16 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
        <span className="text-white/20 text-[8px] font-mono rotate-90">ADMIT ONE</span>
      </div>
    ),
    heart: (
      <div className="text-2xl text-rose-400/30">♥</div>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation - 15 }}
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
    { color: '#f87171', initial: 'A', rotation: -8, offset: -100 },
    { color: '#60a5fa', initial: 'M', rotation: 3, offset: 0 },
    { color: '#4ade80', initial: 'J', rotation: -4, offset: 100 },
  ];

  return (
    <div className="relative h-72 md:h-80 flex items-center justify-center">
      {pages.map((page, index) => (
        <motion.div
          key={page.initial}
          initial={{ opacity: 0, y: 50, rotate: page.rotation + 15 }}
          animate={{ opacity: 1, y: 0, rotate: page.rotation }}
          transition={{ delay: 0.65 + index * 0.08, ...transitions.easeOutQuint }}
          whileHover={{ 
            scale: 1.05, 
            rotate: 0, 
            zIndex: 10,
            transition: { duration: 0.2 }
          }}
          className="absolute w-40 md:w-52 aspect-[3/4] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl cursor-pointer overflow-hidden"
          style={{ 
            zIndex: 3 - index,
            transform: `translateX(${page.offset}px) rotate(${page.rotation}deg)`,
          }}
        >
          <div className="h-full p-4 flex flex-col">
            {/* Image placeholder */}
            <div className="flex-1 bg-white/5 rounded mb-3 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/30">📷</span>
              </div>
            </div>
            {/* Text lines */}
            <div className="space-y-2">
              <div className="h-1.5 bg-white/10 rounded w-3/4" />
              <div className="h-1.5 bg-white/10 rounded w-1/2" />
            </div>
            {/* Author */}
            <div className="mt-3 flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                style={{ backgroundColor: page.color }}
              >
                {page.initial}
              </div>
              <div className="h-1 bg-white/10 rounded w-12" />
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute -bottom-8 text-white/20 text-sm"
      >
        ↑ hover to peek
      </motion.div>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description, 
  icon,
  delay 
}: { 
  number: string;
  title: string;
  description: string;
  icon: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...transitions.easeOutQuint }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs font-mono text-white/20">{number}</span>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}
