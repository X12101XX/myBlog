import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search, Download,
  ZoomIn, ZoomOut, X, Info, Settings, ArrowLeft, Check, Share2,
  FileText, BookOpen, Tag, Clock, Calendar,
} from 'lucide-react';
import gsap from 'gsap';
import * as pdfjsLib from 'pdfjs-dist';
import { getPostBySlug } from '@/data/posts';
import type { Post } from '@/types';
import TagPill from '@/components/TagPill';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const BASE_SCALE = 1.5;

// PDF Page Canvas renderer
function PDFPageCanvas({
  pageNum,
  pdfDoc,
  zoom,
  containerWidth,
  onVisible,
}: {
  pageNum: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  zoom: 'fit-width' | 'fit-page' | number;
  containerWidth: number;
  onVisible?: (page: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !wrapperRef.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) { page.cleanup(); return; }

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        let scale: number;
        const viewport1 = page.getViewport({ scale: 1 });

        if (zoom === 'fit-width') {
          scale = Math.max(0.3, (containerWidth - 32) / viewport1.width);
        } else if (zoom === 'fit-page') {
          const containerHeight = window.innerHeight - 200;
          scale = Math.min(
            Math.max(0.3, (containerWidth - 32) / viewport1.width),
            Math.max(0.3, containerHeight / viewport1.height)
          );
        } else {
          scale = Math.max(0.3, (zoom as number) / 100 * BASE_SCALE);
        }

        const viewport = page.getViewport({ scale });
        canvas.width = Math.floor(viewport.width * window.devicePixelRatio);
        canvas.height = Math.floor(viewport.height * window.devicePixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        page.cleanup();
        renderedRef.current = true;
      } catch {
        // ignore render errors on unmount
      }
    };

    render();
    return () => { cancelled = true; };
  }, [pageNum, pdfDoc, zoom, containerWidth]);

  // Intersection observer for tracking visible page
  useEffect(() => {
    if (!wrapperRef.current || !onVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(pageNum);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [pageNum, onVisible]);

  return (
    <div
      ref={wrapperRef}
      data-page={pageNum}
      className="mx-auto"
      style={{
        marginBottom: 32,
        boxShadow: '0 2px 16px rgba(26, 23, 20, 0.08)',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: 'var(--chalk)',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
    </div>
  );
}

// Search Panel
function SearchPanel({
  isOpen,
  onClose,
  totalPages,
  onJumpToPage,
}: {
  isOpen: boolean;
  onClose: () => void;
  totalPages: number;
  onJumpToPage: (page: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWords, setWholeWords] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: isOpen ? 0 : '100%',
        duration: 0.35,
        ease: 'power2.inOut',
      });
    }
  }, [isOpen]);

  // Simulate search results
  const results = query.length > 1
    ? Array.from({ length: Math.min(8, totalPages) }).map((_, i) => ({
        pageNumber: i + 1,
        snippet: `...context around the match for "${query}" on page ${i + 1}...`,
        matchText: query,
      }))
    : [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[540]"
          style={{ backgroundColor: 'rgba(26, 23, 20, 0.3)' }}
          onClick={onClose}
        />
      )}
      <div
        ref={panelRef}
        className="fixed right-0 z-[550] flex flex-col"
        style={{
          top: 56,
          width: 380,
          maxWidth: '90vw',
          height: 'calc(100vh - 56px)',
          backgroundColor: 'var(--chalk)',
          borderLeft: '1px solid var(--stone)',
          boxShadow: '-4px 0 24px rgba(26, 23, 20, 0.08)',
          transform: 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--stone)' }}>
          <h3 className="text-h5" style={{ color: 'var(--ink)' }}>Search</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center" style={{ color: 'var(--indigo)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pt-4 pb-3 relative">
          <Search size={18} className="absolute left-10 top-1/2 -translate-y-1/2" style={{ color: 'var(--indigo)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in document..."
            className="w-full h-11 rounded-full pl-11 pr-4 text-body outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--parchment)',
              border: '1px solid var(--stone)',
              color: 'var(--ink)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--copper)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(155, 126, 217, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--stone)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Options */}
        <div className="px-6 pb-3 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200"
              style={{
                border: '1px solid var(--stone)',
                backgroundColor: matchCase ? 'var(--copper)' : 'transparent',
                borderColor: matchCase ? 'var(--copper)' : 'var(--stone)',
              }}
              onClick={() => setMatchCase(!matchCase)}
            >
              {matchCase && <Check size={10} style={{ color: 'var(--chalk)' }} />}
            </div>
            <span className="text-xsmall" style={{ color: 'var(--indigo)' }}>Match case</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200"
              style={{
                border: '1px solid var(--stone)',
                backgroundColor: wholeWords ? 'var(--copper)' : 'transparent',
                borderColor: wholeWords ? 'var(--copper)' : 'var(--stone)',
              }}
              onClick={() => setWholeWords(!wholeWords)}
            >
              {wholeWords && <Check size={10} style={{ color: 'var(--chalk)' }} />}
            </div>
            <span className="text-xsmall" style={{ color: 'var(--indigo)' }}>Whole words</span>
          </label>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6">
          {query.length > 1 && (
            <p className="text-small py-3" style={{ color: 'var(--indigo)', borderBottom: '1px solid var(--stone)' }}>
              {results.length} matches
            </p>
          )}
          {results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.pageNumber}
                className="w-full text-left py-3 transition-colors duration-200"
                style={{ borderBottom: '1px solid rgba(214, 207, 197, 0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(244, 237, 226, 0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                onClick={() => { onJumpToPage(r.pageNumber); onClose(); }}
              >
                <span className="text-xsmall font-semibold" style={{ color: 'var(--copper)' }}>
                  Page {r.pageNumber}
                </span>
                <p className="text-small mt-1" style={{ color: 'var(--ink)' }}>
                  {r.snippet.split(r.matchText).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <mark style={{ backgroundColor: 'rgba(155, 126, 217, 0.3)', color: 'inherit' }}>
                          {r.matchText}
                        </mark>
                      )}
                    </span>
                  ))}
                </p>
              </button>
            ))
          ) : query.length > 1 ? (
            <p className="text-body py-8 text-center" style={{ color: 'var(--indigo)' }}>
              No matches found.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

// Info Sidebar
function InfoSidebar({
  isOpen,
  onClose,
  post,
  totalPages,
}: {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  totalPages: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: isOpen ? 0 : '100%',
        duration: 0.35,
        ease: 'power2.inOut',
      });
    }
  }, [isOpen]);

  const metadataFields = [
    { label: 'Pages', value: String(totalPages || post.pageCount), icon: BookOpen },
    { label: 'File Size', value: post.fileSize, icon: FileText },
    { label: 'Format', value: post.format, icon: FileText },
    { label: 'Date', value: new Date(post.date).toLocaleDateString(), icon: Calendar },
    { label: 'Category', value: post.tags[0], icon: Tag },
    { label: 'Language', value: post.language, icon: Clock },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[540]"
          style={{ backgroundColor: 'rgba(26, 23, 20, 0.3)' }}
          onClick={onClose}
        />
      )}
      <div
        ref={panelRef}
        className="fixed right-0 z-[550] overflow-y-auto"
        style={{
          top: 56,
          width: 380,
          maxWidth: '90vw',
          height: 'calc(100vh - 56px)',
          backgroundColor: 'var(--chalk)',
          borderLeft: '1px solid var(--stone)',
          boxShadow: '-4px 0 24px rgba(26, 23, 20, 0.08)',
          transform: 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--stone)' }}>
          <h3 className="text-h5" style={{ color: 'var(--ink)' }}>Post Info</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center" style={{ color: 'var(--indigo)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Thumbnail */}
        <div className="p-6 flex justify-center">
          <div
            className="w-[200px] h-[260px] rounded-lg overflow-hidden"
            style={{
              boxShadow: '0 4px 24px rgba(26, 23, 20, 0.08)',
              border: '1px solid var(--stone)',
              backgroundColor: 'var(--parchment)',
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <FileText size={48} style={{ color: 'var(--stone)' }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pb-4">
          <h2 className="font-serif-display text-h3" style={{ color: 'var(--ink)' }}>
            {post.title}
          </h2>
          <p className="text-body mt-1" style={{ color: 'var(--indigo)' }}>
            By {post.author}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          {metadataFields.map((field) => (
            <div key={field.label}>
              <p className="text-xsmall uppercase" style={{ color: 'var(--indigo)' }}>
                {field.label}
              </p>
              <p className="text-small font-semibold" style={{ color: 'var(--ink)' }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="px-6 py-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="text-body" style={{ color: 'var(--ink)', opacity: 0.7 }}>
            {post.description}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <a
            href={post.pdfUrl}
            download
            className="pill-button pill-button-primary w-full"
          >
            <Download size={14} />
            Download
          </a>
          <button className="pill-button pill-button-outline w-full">
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>
    </>
  );
}

// Settings Popover
function SettingsPopover({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState<'single' | 'double'>('single');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-4 z-[560] overflow-hidden"
      style={{
        top: 64,
        width: 280,
        backgroundColor: 'var(--chalk)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(214, 207, 197, 0.3)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(26, 23, 20, 0.12)',
      }}
    >
      {/* Spread mode */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--stone)' }}>
        <p className="text-xsmall mb-3" style={{ color: 'var(--indigo)' }}>View</p>
        <div className="flex items-center justify-between">
          <span className="text-small" style={{ color: 'var(--ink)' }}>Two-page spread</span>
          <button
            onClick={() => setSpread(spread === 'single' ? 'double' : 'single')}
            className="relative w-10 h-5 rounded-full transition-colors duration-200"
            style={{ backgroundColor: spread === 'double' ? 'var(--copper)' : 'var(--stone)' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
              style={{
                backgroundColor: 'var(--chalk)',
                left: spread === 'double' ? 22 : 2,
              }}
            />
          </button>
        </div>
      </div>

      {/* Scroll direction */}
      <div className="p-4">
        <p className="text-xsmall mb-3" style={{ color: 'var(--indigo)' }}>Scroll</p>
        <div className="flex items-center justify-between">
          <span className="text-small" style={{ color: 'var(--ink)' }}>Horizontal</span>
          <div className="relative w-10 h-5 rounded-full" style={{ backgroundColor: 'var(--stone)' }}>
            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--chalk)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReadingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getPostBySlug(slug) : undefined;
  const viewerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState<'fit-width' | 'fit-page' | number>('fit-width');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [pageInput, setPageInput] = useState('1');

  const totalPages = numPages || post?.pageCount || 1;

  // Load PDF
  useEffect(() => {
    if (!post?.pdfUrl) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(post.pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) { pdf.destroy(); return; }
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      setPdfDoc((prev) => {
        if (prev) prev.destroy();
        return null;
      });
    };
  }, [post?.pdfUrl]);

  // Container width observer
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Jump to page helper
  const jumpToPage = useCallback((page: number) => {
    const el = viewerRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-page="${page}"]`) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchPanelOpen) { setSearchPanelOpen(false); return; }
        if (infoSidebarOpen) { setInfoSidebarOpen(false); return; }
        if (settingsOpen) { setSettingsOpen(false); return; }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') { e.preventDefault(); setSearchPanelOpen(true); }
        if (e.key === '+' || e.key === '=') { e.preventDefault(); handleZoomIn(); }
        if (e.key === '-') { e.preventDefault(); handleZoomOut(); }
        if (e.key === '0') { e.preventDefault(); setZoom('fit-width'); }
      }
      if (e.key === 'Home') jumpToPage(1);
      if (e.key === 'End') jumpToPage(totalPages);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchPanelOpen, infoSidebarOpen, settingsOpen, totalPages, jumpToPage]);

  // Header auto-hide
  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const y = viewerRef.current?.scrollTop || 0;
      setHeaderVisible(y < lastScrollY || y < 50);
      lastScrollY = y;
    };
    const el = viewerRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // Toolbar auto-hide
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      setToolbarVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setToolbarVisible(false), 3000);
    };
    resetTimer();
    const el = viewerRef.current;
    el?.addEventListener('mousemove', resetTimer);
    el?.addEventListener('scroll', resetTimer, { passive: true });
    return () => {
      clearTimeout(timer);
      el?.removeEventListener('mousemove', resetTimer);
      el?.removeEventListener('scroll', resetTimer);
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      if (z === 'fit-width') return 125;
      if (z === 'fit-page') return 100;
      const next = Math.min(200, (z as number) + 25);
      return next;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      if (z === 'fit-width') return 'fit-width';
      if (z === 'fit-page') return 'fit-page';
      const next = Math.max(50, (z as number) - 25);
      return next <= 75 ? 'fit-width' : next;
    });
  }, []);

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput);
      if (page >= 1 && page <= totalPages) {
        jumpToPage(page);
      }
    }
  };

  const zoomLabel = typeof zoom === 'number' ? `${zoom}%` : zoom === 'fit-width' ? 'Fit Width' : 'Fit Page';

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = viewerRef.current;
      if (!el) return;
      const p = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(p, 1));
    };
    const el = viewerRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [numPages]);

  // Track visible page
  const handlePageVisible = useCallback((page: number) => {
    setCurrentPage(page);
    setPageInput(String(page));
  }, []);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '100dvh', backgroundColor: 'var(--ink)', color: 'var(--chalk)' }}>
        <h1 className="text-display">404</h1>
        <p className="text-h4 mt-4" style={{ color: 'var(--stone)' }}>This page has gone to print.</p>
        <Link to="/archive" className="pill-button pill-button-primary mt-8">
          Return to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--parchment)' }}>
      {/* Compact Header */}
      <header
        className="fixed top-0 left-0 right-0 z-[500] transition-transform duration-300 ease-out"
        style={{
          height: 56,
          backgroundColor: 'rgba(251, 247, 241, 0.95)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(214, 207, 197, 0.3)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/archive')}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 hover:bg-[var(--ink)] hover:text-[var(--chalk)]"
              style={{ border: '1px solid var(--stone)', color: 'var(--ink)' }}
            >
              <ArrowLeft size={14} />
            </button>
            <span className="text-small font-serif-display truncate" style={{ color: 'var(--ink)' }}>
              {post.title}
            </span>
          </div>

          <span className="text-xsmall font-semibold hidden sm:block" style={{ color: 'var(--indigo)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => { setSearchPanelOpen(true); setInfoSidebarOpen(false); }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[var(--ink)] hover:text-[var(--chalk)]"
              style={{ border: '1px solid var(--stone)', color: 'var(--ink)' }}
            >
              <Search size={14} />
            </button>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[var(--ink)] hover:text-[var(--chalk)]"
              style={{ border: '1px solid var(--stone)', color: 'var(--ink)' }}
            >
              <Settings size={14} />
            </button>
            <a
              href={post.pdfUrl}
              download
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[var(--ink)] hover:text-[var(--chalk)]"
              style={{ border: '1px solid var(--stone)', color: 'var(--ink)' }}
            >
              <Download size={14} />
            </a>
            {settingsOpen && (
              <SettingsPopover
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                anchorRef={{ current: null }}
              />
            )}
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <div
        ref={viewerRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: 56, backgroundColor: 'var(--parchment)' }}
      >
        <div className="py-10 px-4 sm:px-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
                style={{ borderColor: 'var(--stone)', borderTopColor: 'transparent' }}
              />
              <p className="text-body" style={{ color: 'var(--indigo)' }}>Loading PDF...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-h4 mb-2" style={{ color: 'var(--ink)' }}>Failed to load PDF</p>
              <p className="text-body" style={{ color: 'var(--indigo)' }}>{error}</p>
            </div>
          )}
          {pdfDoc && Array.from({ length: totalPages }).map((_, i) => (
            <PDFPageCanvas
              key={i}
              pageNum={i + 1}
              pdfDoc={pdfDoc}
              zoom={zoom}
              containerWidth={containerWidth}
              onVisible={handlePageVisible}
            />
          ))}
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div
        className="fixed right-0 z-[480]"
        style={{
          top: 56,
          width: 3,
          height: 'calc(100vh - 56px)',
          backgroundColor: 'rgba(214, 207, 197, 0.3)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--copper)',
            transformOrigin: 'top',
            transform: `scaleY(${scrollProgress})`,
            transition: 'transform 0.1s linear',
          }}
        />
      </div>

      {/* Floating Toolbar */}
      <div
        className="fixed left-1/2 z-[600] flex items-center gap-1 sm:gap-2 transition-all duration-300"
        style={{
          bottom: 24,
          transform: `translateX(-50%) translateY(${toolbarVisible ? 0 : 20}px)`,
          opacity: toolbarVisible ? 1 : 0,
          backgroundColor: 'rgba(26, 23, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 100,
          padding: '10px 16px',
          boxShadow: '0 4px 24px rgba(26, 23, 20, 0.2)',
        }}
      >
        <button
          onClick={() => jumpToPage(Math.max(1, currentPage - 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1 px-2">
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={handlePageInput}
            className="w-8 h-7 text-center text-xsmall rounded"
            style={{
              backgroundColor: 'rgba(251, 247, 241, 0.1)',
              color: 'var(--chalk)',
              border: '1px solid rgba(251, 247, 241, 0.2)',
            }}
          />
          <span className="text-xsmall" style={{ color: 'rgba(251, 247, 241, 0.6)' }}>/ {totalPages}</span>
        </div>

        <button
          onClick={() => jumpToPage(Math.min(totalPages, currentPage + 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <ChevronRight size={16} />
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'rgba(251, 247, 241, 0.2)' }} />

        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <ZoomOut size={14} />
        </button>

        <span className="text-xsmall px-1 hidden sm:inline" style={{ color: 'rgba(251, 247, 241, 0.7)' }}>
          {zoomLabel}
        </span>

        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <ZoomIn size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'rgba(251, 247, 241, 0.2)' }} />

        <button
          onClick={() => { setSearchPanelOpen(true); setInfoSidebarOpen(false); }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <Search size={14} />
        </button>

        <button
          onClick={() => { setInfoSidebarOpen(true); setSearchPanelOpen(false); }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <Info size={14} />
        </button>

        <a
          href={post.pdfUrl}
          download
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(251,247,241,0.15)]"
          style={{ color: 'var(--chalk)' }}
        >
          <Download size={14} />
        </a>
      </div>

      {/* Panels */}
      <SearchPanel
        isOpen={searchPanelOpen}
        onClose={() => setSearchPanelOpen(false)}
        totalPages={totalPages}
        onJumpToPage={jumpToPage}
      />
      <InfoSidebar
        isOpen={infoSidebarOpen}
        onClose={() => setInfoSidebarOpen(false)}
        post={post}
        totalPages={totalPages}
      />
    </div>
  );
}