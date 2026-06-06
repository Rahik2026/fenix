import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <p className="serif-title text-6xl text-primary mb-2">404</p>
        <h1 className="serif-title text-2xl mb-3">Page not found</h1>
        <p className="text-muted mb-6">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="btn">Back home</Link>
      </div>
    </div>
  );
}
