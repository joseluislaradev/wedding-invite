import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import siteConfig from './siteConfig';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';

// Lazy load components for better performance
const OurStory = lazy(() => import('./components/OurStory'));
const EventPage = lazy(() => import('./components/EventPage'));
const PhotoGallery = lazy(() => import('./components/PhotoGallery'));
const UploadPhotos = lazy(() => import('./components/UploadPhotos'));
const QRCodePage = lazy(() => import('./components/QRCodePage'));
const Blessings = lazy(() => import('./components/Blessings'));
const WeddingParty = lazy(() => import('./components/WeddingParty'));
const Registry = lazy(() => import('./components/Registry'));
const Travel = lazy(() => import('./components/Travel'));
const FAQ = lazy(() => import('./components/FAQ'));
const Timeline = lazy(() => import('./components/Timeline'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-apple-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-gray-900 mx-auto mb-4"></div>
      <p className="text-apple-gray-600">Loading...</p>
    </div>
  </div>
);

// Route configuration
const routeMap = {
  ourStory: { path: '/our-story', Component: OurStory },
  events: { path: '/events', Component: EventPage },
  photoGallery: { path: '/gallery', Component: PhotoGallery },
  uploadPhotos: { path: '/upload-photos', Component: UploadPhotos },
  blessings: { path: '/blessings', Component: Blessings },
  weddingParty: { path: '/wedding-party', Component: WeddingParty },
  registry: { path: '/registry', Component: Registry },
  travel: { path: '/travel', Component: Travel },
  faq: { path: '/faq', Component: FAQ },
  timeline: { path: '/timeline', Component: Timeline },
};

const simpleRoutes = ['/', '/upload', '/upload-photos', '/qr'];

function AppContent() {
  const location = useLocation();
  const enabledRoutes = Object.entries(siteConfig.features)
    .filter(([, feature]) => feature.enabled)
    .map(([key]) => routeMap[key]?.path)
    .filter(Boolean);
  const knownRoutes = [...simpleRoutes, '/home', ...enabledRoutes];
  const isSimpleScreen =
    simpleRoutes.includes(location.pathname) || !knownRoutes.includes(location.pathname);

  // Generate routes based on enabled features
  const getRoutes = () => {
    const routes = [];

    Object.entries(siteConfig.features).forEach(([key, feature]) => {
      if (feature.enabled && routeMap[key]) {
        const { path, Component } = routeMap[key];
        routes.push(
          <Route
            key={key}
            path={path}
            element={
              <Suspense fallback={<Loading />}>
                <Component />
              </Suspense>
            }
          />
        );
      }
    });

    return routes;
  };

  return (
    <div className="App flex flex-col min-h-screen bg-apple-gray-50">
      {!isSimpleScreen && <Navbar />}
      <div className="flex-grow">
        <Routes>
          {['/', '/upload', '/upload-photos'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<Loading />}>
                  <UploadPhotos />
                </Suspense>
              }
            />
          ))}
          <Route
            path="/qr"
            element={
              <Suspense fallback={<Loading />}>
                <QRCodePage />
              </Suspense>
            }
          />
          <Route path="/home" element={<HomePage />} />
          {getRoutes()}
          <Route
            path="*"
            element={
              <Suspense fallback={<Loading />}>
                <UploadPhotos />
              </Suspense>
            }
          />
        </Routes>
      </div>
      {!isSimpleScreen && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
