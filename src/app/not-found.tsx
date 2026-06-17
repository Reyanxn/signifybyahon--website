import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-display font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block bg-[#111111] text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-[#2a2a2a] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
