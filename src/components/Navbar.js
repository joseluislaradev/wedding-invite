import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import siteConfig from '../siteConfig';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Generate navigation links based on enabled features
  const getNavLinks = () => {
    const links = [];
    const routes = {
      ourStory: '/our-story',
      events: '/events',
      photoGallery: '/gallery',
      uploadPhotos: '/upload-photos',
      blessings: '/blessings',
      weddingParty: '/wedding-party',
      registry: '/registry',
      travel: '/travel',
      faq: '/faq',
      timeline: '/timeline',
    };

    Object.entries(siteConfig.features).forEach(([key, feature]) => {
      if (feature.enabled && key !== 'homepage' && routes[key]) {
        links.push({
          path: routes[key],
          label: feature.label,
          key,
        });
      }
    });

    return links;
  };

  const navLinks = getNavLinks();
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-apple shadow-apple'
          : 'bg-apple-gray-900/80 backdrop-blur-apple'
      }`}
    >
      <div className="section-container">
        <div className="flex justify-between items-center py-4">
          {/* Logo or Title */}
          <Link
            to="/"
            className={`text-xl lg:text-2xl font-semibold tracking-wide transition-colors ${
              scrolled ? 'text-apple-gray-900' : 'text-white'
            }`}
          >
            {siteConfig.couple.displayName}
          </Link>

          {/* Hamburger Icon for Mobile */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className={`focus:outline-none p-2 ${
                scrolled ? 'text-apple-gray-900' : 'text-white'
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Links for Large Screens */}
          <div className={`hidden lg:flex lg:items-center lg:space-x-8`}>
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 px-2 py-1 ${
                  isActive(link.path)
                    ? scrolled
                      ? 'text-apple-blue-600 border-b-2 border-apple-blue-600'
                      : 'text-white border-b-2 border-white'
                    : scrolled
                    ? 'text-apple-gray-600 hover:text-apple-gray-900'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className={`lg:hidden pb-6 space-y-4 animate-slide-up ${
              scrolled ? 'text-apple-gray-900' : 'text-white'
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                onClick={toggleMenu}
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? scrolled
                      ? 'bg-apple-blue-50 text-apple-blue-600 font-medium'
                      : 'bg-white/20 text-white font-medium'
                    : scrolled
                    ? 'hover:bg-apple-gray-100'
                    : 'hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
