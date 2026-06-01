import { Routes, Route } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import GrainOverlay from '@/components/GrainOverlay';
import Footer from '@/components/Footer';
import SearchOverlay from '@/pages/SearchOverlay';
import HomePage from '@/pages/HomePage';
import ArchivePage from '@/pages/ArchivePage';
import ReadingPage from '@/pages/ReadingPage';
import AboutPage from '@/pages/AboutPage';
import ColophonPage from '@/pages/ColophonPage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--parchment)' }}>
      <GrainOverlay />
      <NavigationHeader />
      <ScrollProgressBar />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HomePage />
                <Footer />
              </>
            }
          />
          <Route
            path="/archive"
            element={
              <>
                <ArchivePage />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <div className="flex flex-col" style={{ minHeight: '100vh' }}>
                <div className="flex-1 flex items-center justify-center"><AboutPage /></div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/colophon"
            element={
              <div className="flex flex-col" style={{ minHeight: '100vh' }}>
                <div className="flex-1 flex items-center justify-center"><ColophonPage /></div>
                <Footer />
              </div>
            }
          />
          <Route path="/read/:slug" element={<ReadingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <SearchOverlay />
    </div>
  );
}
