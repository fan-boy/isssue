'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { transitions } from '@/lib/utils';

const ONBOARDING_KEY = 'isssue_onboarding_seen';

const steps = [
  {
    emoji: '📖',
    title: 'A magazine with your friends',
    description: 'Each person gets their own page to fill with photos, text, and stickers.',
  },
  {
    emoji: '🙈',
    title: "Can't peek until release",
    description: "You won't see anyone else's page until the issue drops on the 1st.",
  },
  {
    emoji: '🎉',
    title: 'Reveal day is the best day',
    description: 'Flip through together, react to pages, and see what everyone made.',
  },
];

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(ONBOARDING_KEY);
  });

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setNeedsOnboarding(false);
  };

  return { needsOnboarding, completeOnboarding };
}

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex items-center justify-center p-6">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        Skip
      </button>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={transitions.easeOutQuint}
            className="text-center"
          >
            {/* Emoji */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-7xl mb-8"
            >
              {current.emoji}
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-white mb-3">
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-white/50 text-lg leading-relaxed mb-12">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-white text-black rounded-full text-lg font-medium"
        >
          {step < steps.length - 1 ? 'Next' : "Let's go"}
        </motion.button>
      </div>
    </div>
  );
}
