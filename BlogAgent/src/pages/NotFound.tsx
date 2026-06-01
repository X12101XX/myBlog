import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center relative overflow-hidden"
      style={{ minHeight: '100dvh', backgroundColor: 'var(--ink)', color: 'var(--chalk)' }}
    >
      {/* Decorative ampersand */}
      <div
        className="absolute pointer-events-none select-none font-serif-display"
        style={{
          fontSize: 400,
          opacity: 0.03,
          color: 'var(--chalk)',
          animation: 'spin-slow 60s linear infinite',
        }}
      >
        &amp;
      </div>

      <h1 className="text-display relative z-10">404</h1>
      <p className="text-h4 mt-4 relative z-10" style={{ color: 'var(--stone)' }}>
        This page is still being written.
      </p>
      <Link
        to="/archive"
        className="pill-button pill-button-primary mt-8 relative z-10"
      >
        Back to Blog
      </Link>
    </div>
  );
}
