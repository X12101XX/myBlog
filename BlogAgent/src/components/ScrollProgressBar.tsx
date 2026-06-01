import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  const isReadingPage = location.pathname.startsWith('/read/');

  useEffect(() => {
    if (isReadingPage) return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(p, 1));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReadingPage]);

  if (isReadingPage) return null;

  return (
    <div
      className="fixed top-[72px] left-0 right-0 z-[490] h-[2px]"
      style={{ backgroundColor: 'var(--copper)', transformOrigin: 'left', transform: `scaleX(${progress})` }}
    />
  );
}
