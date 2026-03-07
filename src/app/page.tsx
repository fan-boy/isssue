'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f7] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <span className="text-lg tracking-tight font-medium">isssue</span>
          <Link 
            href="/login"
            className="text-sm text-[#666] hover:text-[#000] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-20 relative">
        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0, rotate: -20 }}
          animate={{ opacity: 1, rotate: -12 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-32 right-[15%] hidden lg:block"
        >
          <div className="w-20 h-8 bg-[#e8dba0]/60 transform -rotate-6" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-32 left-[10%] hidden lg:block text-6xl"
        >
          ✦
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-1/2 right-[8%] hidden lg:block w-24 h-24 rounded-full border-2 border-dashed border-[#e57373]/30"
        />

        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-sm uppercase tracking-[0.2em] text-[#999] mb-8"
            >
              A new kind of magazine
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-tight font-normal text-[#1a1a1a] mb-8"
            >
              Create a monthly
              <br />
              magazine with
              <br />
              <span className="relative inline-block">
                your closest friends
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute -bottom-2 left-0 w-full h-4"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 8 Q 75 2, 150 8 T 298 6"
                    stroke="#e57373"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </motion.svg>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-[#666] max-w-xl leading-relaxed mb-12"
            >
              Everyone gets a page. Create in secret. Reveal together on release day.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-[#1a1a1a] text-white rounded-full text-base hover:bg-[#333] transition-colors"
                >
                  Start your isssue →
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Visual */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 40, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-7"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-[#e8e6e1] rounded-lg shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
                  alt="Friends gathering"
                  className="w-full h-full object-cover"
                />
                {/* Tape decoration */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#e8dba0]/80 transform -rotate-2" />
              </div>
            </motion.div>
            <div className="md:col-span-5 flex flex-col justify-end gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 40, rotate: 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="aspect-[4/3] relative overflow-hidden bg-[#e8e6e1] rounded-lg shadow-xl"
              >
                <img 
                  src="https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&q=80"
                  alt="Personal moment"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-sm text-[#888] leading-relaxed font-hand text-lg"
              >
                Pages from Issue 03 — weekend trips, kitchen experiments, and life updates ✦
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-32 bg-[#1a1a1a] text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-20 right-20 text-6xl opacity-20">→</div>
        <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full border border-white/10" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-4">
              <p className="text-sm uppercase tracking-[0.2em] text-[#666] mb-4">How it works</p>
              <h2 className="text-4xl leading-tight tracking-tight">
                Three steps to your first issue
              </h2>
            </div>
            <div className="md:col-span-8">
              <div className="space-y-12">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-6"
                >
                  <span className="text-4xl font-hand text-[#e57373]">01</span>
                  <div>
                    <h3 className="text-xl mb-2">Gather your people</h3>
                    <p className="text-[#888] leading-relaxed">
                      Start an isssue and invite up to 10 friends. Each person gets their own page in every issue.
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-6"
                >
                  <span className="text-4xl font-hand text-[#64b5f6]">02</span>
                  <div>
                    <h3 className="text-xl mb-2">Create in secret</h3>
                    <p className="text-[#888] leading-relaxed">
                      Fill your page with whatever you want to share — photos, stories, recipes. It stays private until release.
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-6"
                >
                  <span className="text-4xl font-hand text-[#81c784]">03</span>
                  <div>
                    <h3 className="text-xl mb-2">Reveal together</h3>
                    <p className="text-[#888] leading-relaxed">
                      On release day, everyone's pages unlock at once. Flip through, react, and see what your friends have been up to.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example pages */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-[#999] mb-4">From recent issues</p>
          <h2 className="text-4xl tracking-tight text-[#1a1a1a] mb-16">
            What people are sharing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.article 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0, rotate: -2 }}
              viewport={{ once: true }}
              whileHover={{ rotate: 0, y: -8 }}
              className="group cursor-pointer"
              style={{ rotate: '-2deg' }}
            >
              <div className="aspect-[3/4] overflow-hidden bg-white rounded-lg shadow-xl mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
                  alt="Desert landscape"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded p-3">
                  <p className="font-hand text-lg">"Drove 4 hours to see nothing. Exactly what I needed."</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#e57373]" />
                <p className="text-sm text-[#666]">Maya · March 2026</p>
              </div>
            </motion.article>

            <motion.article 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ rotate: 0, y: -8 }}
              className="group cursor-pointer md:mt-12"
              style={{ rotate: '1deg' }}
            >
              <div className="aspect-[3/4] overflow-hidden bg-white rounded-lg shadow-xl mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                  alt="Coffee"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded p-3">
                  <p className="font-hand text-lg">"23 coffee shops this month. Here are the rankings."</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#64b5f6]" />
                <p className="text-sm text-[#666]">Jordan · February 2026</p>
              </div>
            </motion.article>

            <motion.article 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ rotate: 0, y: -8 }}
              className="group cursor-pointer"
              style={{ rotate: '-1deg' }}
            >
              <div className="aspect-[3/4] overflow-hidden bg-white rounded-lg shadow-xl mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600&q=80"
                  alt="Cooking"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded p-3">
                  <p className="font-hand text-lg">"Week 3 of making Mom proud (still failing)"</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#81c784]" />
                <p className="text-sm text-[#666]">Alex · February 2026</p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-6 py-32 bg-[#f0efec]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#999] mb-4">Who it's for</p>
              <h2 className="text-4xl tracking-tight text-[#1a1a1a] leading-tight mb-6">
                For any group that wants to stay close
              </h2>
              <p className="text-6xl">👋</p>
            </div>
            <div className="md:col-span-7">
              <div className="space-y-8">
                {[
                  { emoji: '👯', title: 'Friend groups', desc: 'The group chat, elevated. A monthly ritual that gives everyone a reason to share something real.' },
                  { emoji: '🌍', title: 'Long-distance friends', desc: "When you can't be there in person, this is the next best thing. Stay present in each other's lives." },
                  { emoji: '👨‍👩‍👧‍👦', title: 'Families', desc: 'Grandparents, cousins, everyone. A family newsletter that people actually want to read.' },
                  { emoji: '💕', title: 'Couples', desc: 'A shared scrapbook. Document your relationship, one month at a time.' },
                ].map((item, i) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                      <p className="text-[#666] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32 relative">
        {/* Decorative */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute top-20 left-[15%] text-5xl hidden md:block"
        >
          ✦
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          className="absolute bottom-20 right-[10%] w-20 h-20 rounded-full border-2 border-dashed border-[#64b5f6]/30 hidden md:block"
        />
        
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight text-[#1a1a1a] mb-8"
          >
            Start something
            <br />
            <span className="font-hand">worth keeping</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#666] mb-12"
          >
            Free to create. No ads. Just you and your people.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-[#1a1a1a] text-white rounded-full text-base hover:bg-[#333] transition-colors"
              >
                Create your first isssue →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[#e8e6e1]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-[#999]">© 2026 isssue</span>
          <span className="text-sm text-[#999]">Create together, reveal together ✦</span>
        </div>
      </footer>
    </main>
  );
}
