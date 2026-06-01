import { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { Post } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

interface PDFPageThumbnailProps {
  post: Post;
  width?: number;
  height?: number;
  className?: string;
}

export default function PDFPageThumbnail({ post, width, height, className = '' }: PDFPageThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [renderSize, setRenderSize] = useState<{ w: number; h: number } | null>(
    width != null && height != null ? { w: width, h: height } : null,
  );

  // Measure container when no explicit dimensions are provided
  useEffect(() => {
    if (width != null && height != null) return; // explicit dimensions → skip observer

    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (w > 0 && h > 0) {
        setRenderSize({ w, h });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  // Render PDF page to canvas
  useEffect(() => {
    if (!post.pdfUrl || !canvasRef.current || !renderSize) return;

    let cancelled = false;

    const render = async () => {
      try {
        setLoading(true);
        setFailed(false);
        const pdf = await pdfjsLib.getDocument(post.pdfUrl).promise;
        if (cancelled) { pdf.destroy(); return; }

        const page = await pdf.getPage(1);
        const viewport1 = page.getViewport({ scale: 1 });

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const scale = Math.min(renderSize.w / viewport1.width, renderSize.h / viewport1.height);
        const viewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width * window.devicePixelRatio);
        canvas.height = Math.floor(viewport.height * window.devicePixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        page.cleanup();
        pdf.destroy();

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [post.pdfUrl, renderSize]);

  const isResponsive = width == null || height == null;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: isResponsive ? '100%' : width,
        height: isResponsive ? '100%' : height,
        borderRadius: 4,
        border: '1px solid var(--stone)',
        boxShadow: '0 4px 24px rgba(26, 23, 20, 0.08)',
        backgroundColor: 'var(--chalk)',
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--parchment)' }}>
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--stone)', borderTopColor: 'transparent' }}
          />
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--parchment)' }}>
          <FileText size={32} style={{ color: 'var(--stone)' }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          margin: '0 auto',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  );
}
