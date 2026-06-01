import { useState, useMemo, useEffect, useRef } from 'react';
import { LayoutGrid, List, ChevronDown, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import TagPill from '@/components/TagPill';
import MetadataLine from '@/components/MetadataLine';
import PDFPageThumbnail from '@/components/PDFPageThumbnail';
import { mockPosts, getAllTags, sortPosts } from '@/data/posts';
import type { Post, ViewMode, SortOption } from '@/types';

function ArchivePostCard({ post }: { post: Post }) {
  return (
    <div
      className="group overflow-hidden transition-all duration-400"
      style={{
        backgroundColor: 'var(--chalk)',
        borderRadius: 12,
        border: '1px solid rgba(214, 207, 197, 0.4)',
        boxShadow: '0 4px 24px rgba(26, 23, 20, 0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(26, 23, 20, 0.12)';
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(26, 23, 20, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <Link to={`/read/${post.slug}`}>
          <PDFPageThumbnail post={post} className="w-full h-full" />
        </Link>
      </div>
      <div className="p-6">
        <div className="mb-3">
          <TagPill tag={post.tags[0]} />
        </div>
        <Link to={`/read/${post.slug}`}>
          <h3 className="font-serif-display text-h4 line-clamp-2" style={{ color: 'var(--ink)' }}>
            {post.title}
          </h3>
        </Link>
        <div className="mt-3">
          <MetadataLine post={post} />
        </div>
        <p className="text-body mt-3 line-clamp-3" style={{ color: 'var(--ink)', opacity: 0.65 }}>
          {post.description}
        </p>
        <div className="flex items-center justify-between mt-5">
          <Link
            to={`/read/${post.slug}`}
            className="text-small font-semibold uppercase tracking-[0.06em] transition-opacity duration-150 hover:opacity-50"
            style={{ color: 'var(--copper)' }}
          >
            Read
          </Link>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ border: '1px solid var(--stone)', color: 'var(--indigo)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ink)';
              e.currentTarget.style.color = 'var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--stone)';
              e.currentTarget.style.color = 'var(--indigo)';
            }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArchivePostRow({ post }: { post: Post }) {
  return (
    <div
      className="flex items-center gap-6 py-5 transition-all duration-300"
      style={{ borderBottom: '1px solid rgba(214, 207, 197, 0.4)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(251, 247, 241, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Link to={`/read/${post.slug}`} className="shrink-0">
        <PDFPageThumbnail post={post} width={80} height={100} className="!rounded" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/read/${post.slug}`}>
          <h3 className="font-serif-display text-h4 truncate" style={{ color: 'var(--ink)' }}>
            {post.title}
          </h3>
        </Link>
        <div className="mt-1.5">
          <MetadataLine post={post} />
        </div>
        <p className="text-body mt-2 line-clamp-1" style={{ color: 'var(--ink)', opacity: 0.6 }}>
          {post.description}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <Link
          to={`/read/${post.slug}`}
          className="pill-button pill-button-primary pill-button-small"
        >
          Read
        </Link>
        <button
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ border: '1px solid var(--stone)', color: 'var(--indigo)' }}
        >
          <Download size={12} />
        </button>
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTag, setActiveTag] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount] = useState(12);
  const listRef = useRef<HTMLDivElement>(null);
  const tags = getAllTags();

  const filteredPosts = useMemo(() => {
    let posts = activeTag === 'All' ? mockPosts : mockPosts.filter((p) => p.tags.includes(activeTag));
    posts = sortPosts(posts, sortOption);
    return posts;
  }, [activeTag, sortOption]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  // Entrance animation
  useEffect(() => {
    const items = listRef.current?.querySelectorAll('.archive-item');
    if (!items) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
    );
  }, [viewMode, activeTag, sortOption]);

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    pages: 'Most Pages',
    az: 'A–Z',
  };

  return (
    <div style={{ backgroundColor: 'var(--parchment)' }}>
      {/* Filter Bar */}
      <div
        className="sticky z-[400] w-full"
        style={{
          top: 72,
          padding: '16px 5vw',
          backgroundColor: 'rgba(244, 237, 226, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(214, 207, 197, 0.4)',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: viewMode === 'grid' ? 'var(--ink)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--chalk)' : 'var(--indigo)',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--ink)' : 'transparent',
                color: viewMode === 'list' ? 'var(--chalk)' : 'var(--indigo)',
              }}
            >
              <List size={16} />
            </button>
          </div>

          {/* Tag Filter */}
          <div className="flex-1 overflow-x-auto flex gap-2" style={{ scrollbarWidth: 'none' }}>
            <TagPill tag="All" active={activeTag === 'All'} onClick={() => setActiveTag('All')} />
            {tags.map((tag) => (
              <TagPill
                key={tag.name}
                tag={tag.name}
                count={tag.count}
                active={activeTag === tag.name}
                onClick={() => setActiveTag(tag.name)}
              />
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-small"
              style={{ color: 'var(--ink)' }}
            >
              {sortLabels[sortOption]}
              <ChevronDown size={14} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-[399]" onClick={() => setSortOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-2 z-[400] overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(251, 247, 241, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(214, 207, 197, 0.3)',
                    borderRadius: 12,
                    boxShadow: '0 4px 24px rgba(26, 23, 20, 0.08)',
                  }}
                >
                  {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortOption(opt); setSortOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-small transition-colors duration-200 hover:bg-[var(--parchment)]"
                      style={{ color: 'var(--ink)' }}
                    >
                      {sortLabels[opt]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="px-[5vw]" style={{ paddingTop: 48, paddingBottom: 120 }}>
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-h3 mb-4" style={{ color: 'var(--stone)' }}>
              No posts found.
            </h3>
            <p className="text-body mb-6" style={{ color: 'var(--indigo)' }}>
              Try a different topic or clear your filters.
            </p>
            <button
              onClick={() => setActiveTag('All')}
              className="pill-button"
              style={{ backgroundColor: 'var(--ink)', color: 'var(--chalk)' }}
            >
              View All
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            ref={listRef}
            className="grid gap-8 md:gap-10"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            }}
          >
            {visiblePosts.map((post) => (
              <div key={post.slug} className="archive-item">
                <ArchivePostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div ref={listRef} className="max-w-[900px] mx-auto">
            {visiblePosts.map((post) => (
              <div key={post.slug} className="archive-item">
                <ArchivePostRow post={post} />
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {visiblePosts.length < filteredPosts.length && (
          <div className="flex justify-center mt-12 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: 'var(--copper)',
                  animation: `pulse-ring 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
