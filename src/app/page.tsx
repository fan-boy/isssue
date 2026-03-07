'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { transitions } from '@/lib/utils';

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
              Create your page in secret. On release day, everyone's pages are revealed at once. 
              React, annotate, and save the moments that matter.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ...transitions.easeOutQuint }}
            >
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={transitions.snap}
                  className="px-8 py-4 bg-[#2d2d2d] text-white rounded-full text-lg font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg"
                >
                  Start your isssue →
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, ...transitions.easeOutQuint }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#aaa] text-sm flex flex-col items-center gap-2"
            >
              <span>See examples</span>
              <span>↓</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Example Pages Section */}
        <section className="py-24 px-6 bg-[#1a1a1a]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transitions.easeOutQuint}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
                Pages from real isssues
              </h2>
              <p className="text-[#888] max-w-lg mx-auto">
                Every page tells a story. Here's what people are creating.
              </p>
            </motion.div>

            {/* Example pages grid */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <ExamplePage
                image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
                title="Weekend in Joshua Tree"
                author="Maya"
                authorColor="#e57373"
                caption="Finally escaped the city. The stars out here are unreal."
                rotation={-2}
                delay={0}
              />
              <ExamplePage
                image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                title="Coffee Shop Discoveries"
                author="Jordan"
                authorColor="#64b5f6"
                caption="Rating every cortado in Brooklyn. Current winner: 94 points."
                rotation={1}
                delay={0.1}
                featured
              />
              <ExamplePage
                image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
                title="Friendsgiving 2024"
                author="Sam"
                authorColor="#81c784"
                caption="Everyone brought their specialty. We ate for 4 hours straight."
                rotation={-1}
                delay={0.2}
              />
            </div>

            {/* Second row */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-8 max-w-4xl mx-auto">
              <ExamplePage
                image="https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=600&q=80"
                title="Plant Dad Update"
                author="Alex"
                authorColor="#ffb74d"
                caption="Monstera is thriving. Named her Delilah. She's my pride and joy."
                rotation={2}
                delay={0.3}
              />
              <ExamplePage
                image="https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600&q=80"
                title="Learning to Cook"
                author="Riley"
                authorColor="#ba68c8"
                caption="Attempted Mom's pasta recipe. It was... edible? Progress!"
                rotation={-2}
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Who it's for Section */}
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
                Who it's for
              </h2>
              <p className="text-[#8a8a8a] max-w-lg mx-auto">
                Any group that wants to stay connected through creativity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <WhoCard
                emoji="👯"
                title="Friend Groups"
                description="The group chat, but make it a magazine. Monthly updates from everyone's lives."
                delay={0}
              />
              <WhoCard
                emoji="💕"
                title="Couples"
                description="Document your relationship. A shared scrapbook you both contribute to."
                delay={0.1}
              />
              <WhoCard
                emoji="🌍"
                title="Long-distance Friends"
                description="When you can't be there in person, share pages instead. Stay in each other's lives."
                delay={0.2}
              />
              <WhoCard
                emoji="👨‍👩‍👧‍👦"
                title="Families"
                description="Grandparents, cousins, everyone. A family newsletter that's actually fun."
                delay={0.3}
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
                delay={0}
              />
              <HowItWorksCard
                number="02"
                title="Create in secret"
                description="Add photos, write stories, share updates. Your page is private until release day — no peeking."
                delay={0.1}
              />
              <HowItWorksCard
                number="03"
                title="Reveal & react"
                description="On the 15th, everyone's pages are revealed. Flip through, leave comments, highlight your favorite moments."
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-[#2d2d2d]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transitions.easeOutQuint}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
              Start your first isssue
            </h2>
            <p className="text-[#888] mb-10 text-lg">
              Free to create. Invite your people. See what everyone's been up to.
            </p>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
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
        <footer className="py-8 px-6 bg-[#1a1a1a] text-center">
          <p className="text-sm text-[#666]">
            isssue — Create together, reveal together
          </p>
        </footer>
      </div>
    </main>
  );
}

function ExamplePage({ 
  image, 
  title, 
  author, 
  authorColor, 
  caption, 
  rotation,
  delay,
  featured = false
}: { 
  image: string;
  title: string;
  author: string;
  authorColor: string;
  caption: string;
  rotation: number;
  delay: number;
  featured?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotation * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ delay, ...transitions.easeOutQuint }}
      whileHover={{ scale: 1.02, rotate: 0, y: -8 }}
      className={`bg-[#faf9f6] rounded-xl overflow-hidden shadow-2xl cursor-pointer ${featured ? 'md:-mt-4 md:mb-4' : ''}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg text-[#2d2d2d] mb-2">{title}</h3>
        <p className="text-sm text-[#666] mb-4 leading-relaxed">{caption}</p>
        
        {/* Author */}
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: authorColor }}
          />
          <span className="text-xs text-[#999]">{author}</span>
        </div>
      </div>
    </motion.div>
  );
}

function WhoCard({ 
  emoji, 
  title, 
  description,
  delay
}: { 
  emoji: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, ...transitions.easeOutQuint }}
      className="bg-white border border-[#e0ddd5] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
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
  delay 
}: { 
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, ...transitions.easeOutQuint }}
      className="text-center"
    >
      <div className="w-12 h-12 rounded-full bg-[#f5f3eb] flex items-center justify-center mx-auto mb-4">
        <span className="font-serif text-lg text-[#2d2d2d]">{number}</span>
      </div>
      <h3 className="text-lg font-medium text-[#2d2d2d] mb-2">{title}</h3>
      <p className="text-sm text-[#8a8a8a] leading-relaxed">{description}</p>
    </motion.div>
  );
}
