import { Link } from 'react-router-dom';

interface WordmarkProps {
  light?: boolean;
}

export default function Wordmark({ light = false }: WordmarkProps) {
  return (
    <Link
      to="/"
      className="text-[18px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-150 hover:opacity-50"
      style={{ color: light ? 'var(--chalk)' : 'var(--ink)' }}
    >
      MILK & INK
    </Link>
  );
}
