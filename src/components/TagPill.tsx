interface TagPillProps {
  tag: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export default function TagPill({ tag, active = false, count, onClick }: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xsmall font-semibold uppercase tracking-[0.06em] transition-all duration-300 cursor-pointer shrink-0"
      style={{
        backgroundColor: active ? 'var(--ink)' : 'rgba(122, 143, 114, 0.12)',
        color: active ? 'var(--chalk)' : 'var(--sage)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--sage)';
          e.currentTarget.style.color = 'var(--chalk)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(122, 143, 114, 0.12)';
          e.currentTarget.style.color = 'var(--sage)';
        }
      }}
    >
      {tag}
      {count !== undefined && ` (${count})`}
    </button>
  );
}
