'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        {error.message && (
          <p className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {error.message}
          </p>
        )}
        <Button
          onClick={reset}
          variant="outline"
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  );
} 