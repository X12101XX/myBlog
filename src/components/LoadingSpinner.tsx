interface LoadingSpinnerProps {
  size?: number;
}

export default function LoadingSpinner({ size = 48 }: LoadingSpinnerProps) {
  return (
    <div
      className="inline-block"
      style={{
        width: size,
        height: size,
        animation: 'spin 1s linear infinite',
      }}
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="var(--copper)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="120"
          strokeDashoffset="30"
        />
        <circle cx="24" cy="2" r="3" fill="var(--copper)" />
      </svg>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
