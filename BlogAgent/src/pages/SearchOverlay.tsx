import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import Fuse from 'fuse.js';
import PDFPageThumbnail from '@/components/PDFPageThumbnail';
import { useStore } from '@/store/useStore';
import { mockPosts } from '@/data/posts';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, recentSearches, addRecentSearch } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'titles' | 'tags' | 'content'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  // Close animation
  const handleClose = useCallback(() => {
    gsap.to(containerRef.current, { opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      delay: 0.05,
      onComplete: () => {
        setSearchOpen(false);
        setSearchQuery('');
      },
    });
  }, [setSearchOpen, setSearchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '/') {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
      if (!searchOpen) return;

      if (e.key === 'Escape') { handleClose(); return; }

      const results = getResults();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % results.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + results.length) % results.length);
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        const post = results[selectedIndex];
        addRecentSearch(searchQuery || post.title);
        handleClose();
        setTimeout(() => navigate(`/read/${post.slug}`), 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, handleClose, setSearchOpen, searchQuery, selectedIndex, navigate, addRecentSearch]);

  // Fuse.js search
  const fuse = useMemo(() => {
    const keys: string[] = [];
    if (filter === 'all' || filter === 'titles') keys.push('title');
    if (filter === 'all' || filter === 'content') keys.push('description', 'content');
    if (filter === 'all' || filter === 'tags') keys.push('tags');
    return new Fuse(mockPosts, { threshold: 0.3, keys });
  }, [filter]);

  const getResults = useCallback(() => {
    if (!searchQuery.trim()) return [];
    return fuse.search(searchQuery.trim()).map((r) => r.item);
  }, [searchQuery, fuse]);

  const results = getResults();

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[700]">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(26, 23, 20, 0.92)',
          backdropFilter: 'blur(8px)',
          opacity: 0,
        }}
        onClick={handleClose}
      />

      {/* Container */}
      <div
        ref={containerRef}
        className="absolute left-1/2 top-[15vh] -translate-x-1/2 w-full flex flex-col"
        style={{
          width: 680,
          maxWidth: '90vw',
          backgroundColor: 'var(--chalk)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(26, 23, 20, 0.25)',
          overflow: 'hidden',
          maxHeight: '80vh',
          opacity: 0,
        }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--stone)' }}>
          <Search size={22} style={{ color: 'var(--indigo)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search posts..."
            className="flex-1 h-12 text-lg outline-none bg-transparent"
            style={{ color: 'var(--ink)', fontFamily: 'Space Grotesk, sans-serif' }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
              style={{ color: 'var(--indigo)' }}
            >
              <X size={20} />
            </button>
          )}
          <span
            className="text-xsmall px-2 py-1 rounded"
            style={{ color: 'var(--indigo)', backgroundColor: 'var(--parchment)' }}
          >
            ESC
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-6 py-3" style={{ borderBottom: '1px solid var(--stone)' }}>
          {(['all', 'titles', 'tags', 'content'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedIndex(0); }}
              className="text-xsmall font-semibold rounded-full px-3.5 py-1.5 transition-all duration-200"
              style={{
                backgroundColor: filter === f ? 'var(--ink)' : 'transparent',
                color: filter === f ? 'var(--chalk)' : 'var(--indigo)',
              }}
              onMouseEnter={(e) => {
                if (filter !== f) e.currentTarget.style.backgroundColor = 'var(--parchment)';
              }}
              onMouseLeave={(e) => {
                if (filter !== f) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '8px 0' }}>
          {!searchQuery.trim() ? (
            /* Empty state - recent searches */
            <div className="px-6 py-10 text-center">
              <p className="text-body mb-6" style={{ color: 'var(--indigo)' }}>
                Type to search posts...
              </p>
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xsmall uppercase tracking-[0.1em] mb-3" style={{ color: 'var(--indigo)' }}>
                    Recent searches
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSearchQuery(s); inputRef.current?.focus(); }}
                        className="text-xsmall rounded-full px-3.5 py-1.5 transition-colors duration-200"
                        style={{ backgroundColor: 'var(--parchment)', color: 'var(--ink)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
            /* No results */
            <div className="px-6 py-10 text-center">
              <Search size={48} style={{ color: 'var(--stone)', opacity: 0.5, margin: '0 auto' }} />
              <h3 className="text-h4 mt-4" style={{ color: 'var(--ink)' }}>No posts found.</h3>
              <p className="text-body mt-2" style={{ color: 'var(--indigo)' }}>
                Try different keywords or check your spelling.
              </p>
            </div>
          ) : (
            /* Results list */
            <>
              <p className="text-xsmall px-6 py-3" style={{ color: 'var(--indigo)', borderBottom: '1px solid var(--stone)' }}>
                {results.length} results
              </p>
              {results.map((post, i) => (
                <button
                  key={post.slug}
                  className="w-full text-left flex items-start gap-4 px-6 py-4 transition-all duration-150"
                  style={{
                    borderBottom: '1px solid rgba(214, 207, 197, 0.3)',
                    backgroundColor: i === selectedIndex ? 'rgba(155, 126, 217, 0.08)' : 'transparent',
                    borderLeft: i === selectedIndex ? '3px solid var(--copper)' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (i !== selectedIndex) e.currentTarget.style.backgroundColor = 'var(--parchment)';
                  }}
                  onMouseLeave={(e) => {
                    if (i !== selectedIndex) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => {
                    addRecentSearch(searchQuery);
                    handleClose();
                    setTimeout(() => navigate(`/read/${post.slug}`), 300);
                  }}
                >
                  <div className="shrink-0" style={{ width: 56, height: 72 }}>
                    <PDFPageThumbnail post={post} width={56} height={72} className="!rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif-display text-h5" style={{ color: 'var(--ink)' }}>
                      {post.title}
                    </h4>
                    <p className="text-xsmall mt-1" style={{ color: 'var(--indigo)' }}>
                      {post.tags.join(' · ')} · {new Date(post.date).toLocaleDateString()}
                    </p>
                    <p className="text-small mt-1.5 line-clamp-2" style={{ color: 'var(--ink)', opacity: 0.65 }}>
                      {post.description}
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 mt-4" style={{ color: 'var(--stone)' }} />
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: '1px solid var(--stone)' }}>
          <span className="text-xsmall" style={{ color: 'var(--indigo)' }}>
            ↑↓ to navigate · ↵ to open · esc to close
          </span>
          <span className="text-xsmall" style={{ color: 'var(--indigo)', opacity: 0.5 }}>
            Powered by Fuse.js
          </span>
        </div>
      </div>
    </div>
  );
}
