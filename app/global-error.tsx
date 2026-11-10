'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Critical Application Error</h2>
          <p className="text-sm text-gray-500 mb-4">{error.message || 'Something went wrong.'}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Reload Admin
          </button>
        </div>
      </body>
    </html>
  );
}

