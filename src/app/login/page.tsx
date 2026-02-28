'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { transitions } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3eb] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.easeOutQuint}
        className="w-full max-w-md"
      >
        <Link href="/" className="text-sm text-[#8a8a8a] hover:text-[#5a5a5a] mb-8 block">
          ← Back
        </Link>

        <h1 className="text-3xl font-serif text-[#2d2d2d] mb-2">
          Welcome
        </h1>
        <p className="text-[#5a5a5a] mb-8">
          Enter your email to sign in or create an account.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white border border-[#e0ddd5] rounded-lg text-[#2d2d2d] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent disabled:opacity-50"
            />
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              transition={transitions.snap}
              className="w-full px-4 py-3 bg-[#2d2d2d] text-white rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </motion.button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e0ddd5] rounded-lg p-6 text-center"
          >
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-xl font-medium text-[#2d2d2d] mb-2">Check your email</h2>
            <p className="text-[#5a5a5a]">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="mt-4 text-sm text-[#8a8a8a] hover:text-[#5a5a5a]"
            >
              Use a different email
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
