'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-serif text-white mb-4">Something went wrong</h2>
        <p className="text-white/50 mb-6">
          We hit an unexpected error. Try refreshing the page.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
