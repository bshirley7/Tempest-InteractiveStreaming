import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h2>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Page Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
} 