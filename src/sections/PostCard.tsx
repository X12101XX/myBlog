import { Link } from 'react-router-dom';
import PDFPageThumbnail from '@/components/PDFPageThumbnail';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div
      className="group transition-all duration-400"
      style={{
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative overflow-hidden mb-5"
        style={{ aspectRatio: '3/4', borderRadius: 8 }}
      >
        <Link to={`/read/${post.slug}`}>
          <PDFPageThumbnail
            post={post}
            className="w-full h-full transition-transform duration-600"
          />
        </Link>
        {/* Tag pill */}
        <div
          className="absolute top-0 left-0 text-xsmall font-semibold uppercase tracking-[0.06em]"
          style={{
            backgroundColor: 'var(--copper)',
            color: 'var(--chalk)',
            padding: '4px 12px',
            borderRadius: '0 0 8px 0',
          }}
        >
          {post.tags[0]}
        </div>
        {/* Hover zoom effect handled by group */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-600"
          style={{ transform: 'scale(1)' }}
        />
      </div>

      {/* Content */}
      <Link to={`/read/${post.slug}`}>
        <h3
          className="font-serif-display text-h4 line-clamp-2 transition-opacity duration-150 hover:opacity-50"
          style={{ color: 'var(--ink)' }}
        >
          {post.title}
        </h3>
      </Link>
      <p className="text-small mt-2" style={{ color: 'var(--indigo)' }}>
        By {post.author} · {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
      <p className="text-body mt-3 line-clamp-3" style={{ color: 'var(--ink)', opacity: 0.7 }}>
        {post.description}
      </p>
      <Link
        to={`/read/${post.slug}`}
        className="inline-block text-small font-semibold uppercase tracking-[0.06em] mt-4 transition-opacity duration-150 hover:opacity-50"
        style={{ color: 'var(--copper)' }}
      >
        Read →
      </Link>
    </div>
  );
}
