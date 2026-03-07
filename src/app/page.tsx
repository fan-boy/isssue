'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f7]">
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
      <section className="min-h-screen flex flex-col justify-center px-6 pt-20">
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
              your closest friends
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
                <button className="px-8 py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.15em] hover:bg-[#333] transition-colors">
                  Start your isssue
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Visual */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <div className="aspect-[4/5] relative overflow-hidden bg-[#e8e6e1]">
                <img 
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
                  alt="Friends gathering"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-5 flex flex-col justify-end">
              <div className="aspect-[4/3] relative overflow-hidden bg-[#e8e6e1] mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&q=80"
                  alt="Personal moment"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-[#999] leading-relaxed">
                Pages from Issue 03 — featuring weekend trips, kitchen experiments, and life updates from a group of friends scattered across three cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Editorial style */}
      <section className="px-6 py-32 bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-4">
              <p className="text-sm uppercase tracking-[0.2em] text-[#666] mb-4">How it works</p>
              <h2 className="text-4xl leading-tight tracking-tight">
                Three steps to your first issue
              </h2>
            </div>
            <div className="md:col-span-8">
              <div className="space-y-16">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <span className="text-sm text-[#666]">01</span>
                    <h3 className="text-xl mt-2 mb-4">Gather</h3>
                    <p className="text-[#888] leading-relaxed">
                      Start an isssue and invite your people — up to 10 friends, each with their own page in every issue.
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[#666]">02</span>
                    <h3 className="text-xl mt-2 mb-4">Create</h3>
                    <p className="text-[#888] leading-relaxed">
                      Fill your page with whatever you want to share — photos, stories, recipes, playlists. It stays private until release.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <span className="text-sm text-[#666]">03</span>
                    <h3 className="text-xl mt-2 mb-4">Reveal</h3>
                    <p className="text-[#888] leading-relaxed">
                      On release day, everyone's pages unlock at once. Flip through, react, comment. See what your friends have been up to.
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[#666]">04</span>
                    <h3 className="text-xl mt-2 mb-4">Repeat</h3>
                    <p className="text-[#888] leading-relaxed">
                      Next month, do it all again. Build an archive of shared moments over time.
                    </p>
                  </div>
                </div>
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
            <article className="group">
              <div className="aspect-[3/4] overflow-hidden bg-[#e8e6e1] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
                  alt="Desert landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-sm text-[#999] mb-2">Maya · March 2026</p>
              <h3 className="text-lg mb-2">A weekend in the desert</h3>
              <p className="text-[#666] text-sm leading-relaxed">
                "Drove four hours to see nothing. It was exactly what I needed."
              </p>
            </article>

            <article className="group">
              <div className="aspect-[3/4] overflow-hidden bg-[#e8e6e1] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                  alt="Coffee"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-sm text-[#999] mb-2">Jordan · February 2026</p>
              <h3 className="text-lg mb-2">The coffee report</h3>
              <p className="text-[#666] text-sm leading-relaxed">
                "I've been to 23 coffee shops this month. Here are the rankings."
              </p>
            </article>

            <article className="group">
              <div className="aspect-[3/4] overflow-hidden bg-[#e8e6e1] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600&q=80"
                  alt="Cooking"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-sm text-[#999] mb-2">Alex · February 2026</p>
              <h3 className="text-lg mb-2">Learning to cook</h3>
              <p className="text-[#666] text-sm leading-relaxed">
                "Week three of trying to make something my mom would be proud of."
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-6 py-32 bg-[#f0efec]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#999] mb-4">Who it's for</p>
              <h2 className="text-4xl tracking-tight text-[#1a1a1a] leading-tight">
                For any group that wants to stay in each other's lives
              </h2>
            </div>
            <div className="md:col-span-7">
              <div className="space-y-12">
                <div className="border-t border-[#ddd] pt-6">
                  <h3 className="text-lg mb-2">Friend groups</h3>
                  <p className="text-[#666] leading-relaxed">
                    The group chat, elevated. A monthly ritual that gives everyone a reason to share something real.
                  </p>
                </div>
                <div className="border-t border-[#ddd] pt-6">
                  <h3 className="text-lg mb-2">Long-distance relationships</h3>
                  <p className="text-[#666] leading-relaxed">
                    When you can't be there in person, this is the next best thing. Stay present in each other's daily lives.
                  </p>
                </div>
                <div className="border-t border-[#ddd] pt-6">
                  <h3 className="text-lg mb-2">Families</h3>
                  <p className="text-[#666] leading-relaxed">
                    Grandparents, cousins, everyone. A family newsletter that people actually want to read.
                  </p>
                </div>
                <div className="border-t border-[#ddd] pt-6">
                  <h3 className="text-lg mb-2">Couples</h3>
                  <p className="text-[#666] leading-relaxed">
                    A shared scrapbook. Document your relationship, one month at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight text-[#1a1a1a] mb-8">
            Start something worth keeping
          </h2>
          <p className="text-xl text-[#666] mb-12">
            Free to create. No ads. Just you and your people.
          </p>
          <Link href="/login">
            <button className="px-10 py-5 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.15em] hover:bg-[#333] transition-colors">
              Create your first isssue
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[#e8e6e1]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-[#999]">© 2026 isssue</span>
          <span className="text-sm text-[#999]">Create together, reveal together</span>
        </div>
      </footer>
    </main>
  );
}
