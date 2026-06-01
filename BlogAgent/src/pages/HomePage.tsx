import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import PostCard from '@/sections/PostCard';
import { mockPosts } from '@/data/posts';

export default function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showScroll, setShowScroll] = useState(true);

  // Title character reveal animation
  useEffect(() => {
    if (!titleRef.current) return;
    const words = titleRef.current.querySelectorAll('.word');
    const chars: HTMLElement[] = [];
    words.forEach((word) => {
      word.querySelectorAll('.char').forEach((c) => chars.push(c as HTMLElement));
    });

    gsap.fromTo(
      chars,
      { opacity: 0, y: 60, rotateZ: 3 },
      {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        duration: 1.0,
        stagger: 0.03,
        ease: 'power3.out',
        delay: 0.3,
      }
    );

    // Ampersand color flash
    const ampersand = titleRef.current.querySelector('.ampersand');
    if (ampersand) {
      gsap.fromTo(
        ampersand,
        { color: 'var(--ink)' },
        {
          color: 'var(--copper)',
          duration: 0.4,
          delay: 1.2,
          yoyo: true,
          repeat: 1,
        }
      );
    }
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!titleRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      titleRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll indicator visibility
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY < 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section entrance animations
  useEffect(() => {
    const sections = document.querySelectorAll('.animate-section');
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
        }
      );
    });
  }, []);

  const splitChars = (text: string) =>
    text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ opacity: 0 }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  const featuredPosts = mockPosts.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="flex flex-col items-center justify-center relative"
        style={{
          minHeight: '100dvh',
          backgroundColor: 'var(--parchment)',
        }}
      >
        <div className="text-center max-w-[800px] px-6">
          <p
            className="text-small uppercase tracking-[0.1em] mb-6"
            style={{ color: 'var(--indigo)' }}
          >
            A PERSONAL BLOG
          </p>

          <h1
            ref={titleRef}
            className="text-display transition-transform duration-300 ease-out"
            style={{ color: 'var(--ink)' }}
          >
            <span className="word inline-block">{splitChars('MILK')}</span>
            <br />
            <span className="word inline-block">
              <span className="ampersand font-serif-display" style={{ color: 'var(--ink)' }}>
                {splitChars('\u0026')}
              </span>
              {splitChars(' INK')}
            </span>
          </h1>

          <p
            className="text-large mt-8 max-w-[560px] mx-auto"
            style={{ color: 'var(--indigo)' }}
          >
            Thoughts on design, code, creativity, and the quiet art of making things that matter.
          </p>

          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => navigate('/archive')}
              className="pill-button pill-button-primary"
            >
              Browse Posts
            </button>
            <button
              onClick={() => navigate('/about')}
              className="pill-button pill-button-outline"
            >
              About
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300"
          style={{
            opacity: showScroll ? 1 : 0,
            animation: showScroll ? 'float 2s ease-in-out infinite' : 'none',
          }}
        >
          <ChevronDown size={16} style={{ color: 'var(--stone)' }} />
        </div>
      </section>

      {/* Featured Shelf */}
      <section
        className="animate-section"
        style={{ padding: '120px 0', backgroundColor: 'var(--chalk)' }}
      >
        <div className="text-center mb-16 px-[5vw]">
          <p
            className="text-xsmall uppercase tracking-[0.12em] mb-3"
            style={{ color: 'var(--indigo)' }}
          >
            FEATURED
          </p>
          <h2 className="text-h2" style={{ color: 'var(--ink)' }}>
Recent Writings
          </h2>
        </div>

        <div className="px-[5vw]">
          <div
            className="flex gap-8 overflow-x-auto pb-4"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
            }}
          >
            {featuredPosts.map((post) => (
              <div
                key={post.slug}
                className="shrink-0"
                style={{ scrollSnapAlign: 'start', width: 320 }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
