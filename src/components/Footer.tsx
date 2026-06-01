import { useNavigate } from 'react-router-dom';
import Wordmark from './Wordmark';
import { mockPosts, getAllTags } from '@/data/posts';

export default function Footer() {
  const navigate = useNavigate();
  const tags = getAllTags();
  const recentPosts = mockPosts.slice(0, 5);

  return (
    <footer style={{ backgroundColor: 'var(--ink)', color: 'var(--chalk)', padding: '80px 0 40px' }}>
      <div className="mx-auto px-[5vw]">
        <div className="flex items-center justify-between">
          <Wordmark light />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pill-button"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--chalk)',
              border: '1px solid var(--chalk)',
            }}
          >
            Back to Top
          </button>
        </div>

        <div
          className="my-10"
          style={{ borderTop: '1px solid rgba(251, 247, 241, 0.15)' }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h4 className="text-xsmall font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: 'var(--stone)' }}>
              Collection
            </h4>
            <ul className="flex flex-col gap-3">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <button
                    onClick={() => navigate(`/read/${post.slug}`)}
                    className="text-small transition-colors duration-300 hover:text-[var(--copper)]"
                    style={{ color: 'var(--chalk)' }}
                  >
                    {post.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xsmall font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: 'var(--stone)' }}>
              Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => navigate('/archive')}
                  className="rounded-full px-4 py-1.5 text-xsmall transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(251, 247, 241, 0.08)',
                    color: 'var(--chalk)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--copper)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(251, 247, 241, 0.08)';
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xsmall font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: 'var(--stone)' }}>
              Info
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-small transition-colors duration-300 hover:text-[var(--copper)]"
                  style={{ color: 'var(--chalk)' }}
                >
                  About
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate('/colophon')}
                  className="text-small transition-colors duration-300 hover:text-[var(--copper)]"
                  style={{ color: 'var(--chalk)' }}
                >
                  Colophon
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between">
          <span className="text-xsmall" style={{ color: 'var(--stone)' }}>
            Built with care, written with love.
          </span>
          <span className="text-xsmall" style={{ color: 'var(--stone)' }}>
            2026
          </span>
        </div>
      </div>
    </footer>
  );
}
