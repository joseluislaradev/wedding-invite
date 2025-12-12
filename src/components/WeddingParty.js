import React from 'react';
import siteConfig from '../siteConfig';
import Card from './ui/Card';

function WeddingParty() {
  const { bridesmaids = [], groomsmen = [] } = siteConfig.weddingParty || {};

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900 mb-4">
            {siteConfig.weddingParty?.title || 'Our Wedding Party'}
          </h1>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.weddingParty?.subtitle || 'Meet the amazing people standing with us'}
          </p>
        </div>

        {/* Bridesmaids */}
        {bridesmaids.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-semibold text-apple-gray-900 mb-8 text-center">
              Bridesmaids
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bridesmaids.map((person, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-1">
                    {person.name}
                  </h3>
                  <p className="text-apple-blue-600 font-medium mb-3">{person.role}</p>
                  {person.bio && (
                    <p className="text-apple-gray-600 text-sm">{person.bio}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Groomsmen */}
        {groomsmen.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold text-apple-gray-900 mb-8 text-center">
              Groomsmen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groomsmen.map((person, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-1">
                    {person.name}
                  </h3>
                  <p className="text-apple-blue-600 font-medium mb-3">{person.role}</p>
                  {person.bio && (
                    <p className="text-apple-gray-600 text-sm">{person.bio}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {bridesmaids.length === 0 && groomsmen.length === 0 && (
          <div className="text-center py-20">
            <p className="text-apple-gray-500 text-lg">Wedding party information coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeddingParty;

