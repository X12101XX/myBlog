export default function ColophonPage() {
  return (
    <div className="mx-auto px-[5vw] py-20" style={{ maxWidth: 720 }}>
      <h1 className="font-serif-display text-h2 mb-6" style={{ color: 'var(--ink)' }}>
        Colophon
      </h1>
      <div className="text-body leading-relaxed" style={{ color: 'var(--ink)', opacity: 0.75 }}>
        <p className="mb-4">
          This site is a static single-page application built with Vite and React.
          PDF rendering is handled client-side by pdfjs-dist. The typography
          uses a serif display face for headings and a clean sans for body text.
        </p>
        <p className="mb-4">
          No tracking, no cookies, no JavaScript frameworks you didn't ask for.
        </p>
        <p>
          Set in motion in 2025.
        </p>
      </div>
    </div>
  );
}
