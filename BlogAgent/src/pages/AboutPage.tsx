export default function AboutPage() {
  return (
    <div className="mx-auto px-[5vw] py-20" style={{ maxWidth: 720 }}>
      <h1 className="font-serif-display text-h2 mb-6" style={{ color: 'var(--ink)' }}>
        About
      </h1>
      <div className="text-body leading-relaxed" style={{ color: 'var(--ink)', opacity: 0.75 }}>
        <p className="mb-4">
          A quiet space for reading and reflection — collecting PDFs, documents, and writings
          that deserve a closer look.
        </p>
        <p>
          Built with React, TypeScript, and pdfjs-dist. The source is available
          for those who care to look.
        </p>
      </div>
    </div>
  );
}
