import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Wordmark from './Wordmark';
import { useStore } from '@/store/useStore';

export default function NavigationHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { setSearchOpen } = useStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isReadingPage = location.pathname.startsWith('/read/');
  if (isReadingPage) return null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[500] transition-all duration-400"
        style={{
          height: 72,
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(8px)',
          backgroundColor: scrolled ? 'rgba(251, 247, 241, 0.92)' : 'rgba(251, 247, 241, 0.5)',
          borderBottom: '1px solid rgba(214, 207, 197, 0.3)',
        }}
      >
        <div className="mx-auto flex h-full items-center justify-between px-[5vw]">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Archive', to: '/archive' },
              { label: 'Search', action: () => setSearchOpen(true) },
              { label: 'Tags', to: '/archive' },
            ].map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-small font-semibold uppercase tracking-[0.06em] transition-opacity duration-150 hover:opacity-50"
                  style={{ color: 'var(--ink)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-small font-semibold uppercase tracking-[0.06em] transition-opacity duration-150 hover:opacity-50"
                  style={{ color: 'var(--ink)' }}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/about"
              className="pill-button pill-button-outline pill-button-small"
            >
              About
            </Link>
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} style={{ color: 'var(--ink)' }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[600] flex flex-col items-center justify-center"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileOpen(false)}
          >
            <X size={24} style={{ color: 'var(--chalk)' }} />
          </button>
          <nav className="flex flex-col items-center gap-8">
            {[
              { label: 'Home', to: '/' },
              { label: 'Archive', to: '/archive' },
              { label: 'Search', action: () => { setMobileOpen(false); setSearchOpen(true); } },
            ].map((item, i) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-h3 font-semibold transition-all duration-500"
                  style={{
                    color: 'var(--chalk)',
                    animationDelay: `${i * 0.08}s`,
                    animation: 'fadeSlideIn 0.5s ease forwards',
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-h3 font-semibold transition-all duration-500"
                  style={{
                    color: 'var(--chalk)',
                    animationDelay: `${i * 0.08}s`,
                    animation: 'fadeSlideIn 0.5s ease forwards',
                  }}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
