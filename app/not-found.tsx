import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="pt-32 pb-24 min-h-[60vh] flex items-center">
      <div className="container-luxury text-center max-w-lg mx-auto">
        <p className="eyebrow mb-4">404</p>
        <h1 className="heading-section mb-6">Page Not Found</h1>
        <p className="body-elegant mb-8">
          We couldn&apos;t find the page you were looking for. It may have been moved or no longer exists.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/shop" className="btn-secondary">Explore Collection</Link>
        </div>
      </div>
    </main>
  );
}
