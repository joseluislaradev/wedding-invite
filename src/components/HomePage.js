import React from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../siteConfig';
import Countdown from './ui/Countdown';
import Card from './ui/Card';
import Button from './ui/Button';
import ShareButtons from './ui/ShareButtons';

function HomePage() {
  // Get enabled features for quick navigation cards
  const getQuickNavCards = () => {
    const cards = [];
    const routes = {
      ourStory: { path: '/our-story', icon: '📖' },
      events: { path: '/events', icon: '📅' },
      photoGallery: { path: '/gallery', icon: '📸' },
      uploadPhotos: { path: '/upload-photos', icon: '⬆️' },
      blessings: { path: '/blessings', icon: '💌' },
      weddingParty: { path: '/wedding-party', icon: '👥' },
      registry: { path: '/registry', icon: '🎁' },
      travel: { path: '/travel', icon: '✈️' },
      faq: { path: '/faq', icon: '❓' },
      timeline: { path: '/timeline', icon: '⏱️' },
    };

    Object.entries(siteConfig.features).forEach(([key, feature]) => {
      if (feature.enabled && key !== 'homepage' && routes[key]) {
        cards.push({
          ...routes[key],
          label: feature.label,
          key,
        });
      }
    });

    return cards.slice(0, 6); // Show max 6 cards
  };

  const quickNavCards = getQuickNavCards();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${siteConfig.homepage.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-4 sm:px-8 max-w-4xl">
          <h1 className="text-5xl sm:text-display-sm lg:text-display font-bold mb-6 animate-fade-in">
            {siteConfig.homepage.title}
          </h1>
          <p className="text-xl sm:text-2xl mb-12 max-w-2xl text-white/90 animate-slide-up">
            {siteConfig.homepage.subtitle}
          </p>

          {/* Countdown Timer */}
          {siteConfig.homepage.showCountdown && siteConfig.wedding?.date && (
            <div className="mb-12 animate-scale-in">
              <p className="text-lg mb-4 text-white/80">Counting down to our special day</p>
              <Countdown targetDate={siteConfig.wedding.date} />
            </div>
          )}

          {/* CTA Button */}
          <div className="animate-scale-in mb-8">
            <Link to="/upload-photos">
              <Button variant="secondary" size="lg">
                {siteConfig.homepage.ctaButton}
              </Button>
            </Link>
          </div>

          {/* Share Buttons */}
          <div className="animate-fade-in">
            <ShareButtons
              title={siteConfig.homepage.title}
              description={siteConfig.homepage.subtitle}
              className="justify-center"
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      {quickNavCards.length > 0 && (
        <section className="section-container py-20 bg-apple-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-title font-semibold text-apple-gray-900 mb-4">
              Explore Our Wedding
            </h2>
            <p className="text-apple-gray-600 max-w-2xl mx-auto">
              Discover all the details about our special day
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickNavCards.map((card) => (
              <Link key={card.key} to={card.path}>
                <Card className="p-6 text-center cursor-pointer h-full">
                  <div className="text-4xl mb-4">{card.icon}</div>
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">
                    {card.label}
                  </h3>
                  <p className="text-apple-gray-600 text-sm">
                    Click to explore
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
