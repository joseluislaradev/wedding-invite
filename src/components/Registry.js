import React, { useState, useEffect } from 'react';
import siteConfig from '../siteConfig';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';

function Registry() {
  const { registries = [], cashFunds = [], thankYouMessage } = siteConfig.registry || {};
  const [reservations, setReservations] = useState({});
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [reserveForm, setReserveForm] = useState({ name: '', email: '' });
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState('');

  // Load gift reservations
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch('/.netlify/functions/gift-status');
        const data = await response.json();
        if (data.success) {
          setReservations(data.reservations || {});
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      }
    };

    if (siteConfig.registry?.enableGiftTracking) {
      loadReservations();
    }
  }, []);

  const handleReserveClick = (gift) => {
    setSelectedGift(gift);
    setShowReserveModal(true);
    setReserveForm({ name: '', email: '' });
    setReserveError('');
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    
    if (!reserveForm.name || !reserveForm.email) {
      setReserveError('Please fill in all fields');
      return;
    }

    setReserveLoading(true);
    setReserveError('');

    try {
      const response = await fetch('/.netlify/functions/gift-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: selectedGift.id,
          giftName: selectedGift.name,
          reservedBy: `${reserveForm.name} (${reserveForm.email})`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setReservations({
          ...reservations,
          [selectedGift.id]: {
            giftName: selectedGift.name,
            reservedBy: `${reserveForm.name} (${reserveForm.email})`,
            reservedDate: new Date().toISOString(),
          },
        });
        setShowReserveModal(false);
        alert('Gift reserved successfully! Thank you!');
      } else {
        setReserveError(data.message || 'Failed to reserve gift');
      }
    } catch (error) {
      console.error('Error reserving gift:', error);
      setReserveError('An error occurred. Please try again.');
    } finally {
      setReserveLoading(false);
    }
  };

  const isReserved = (giftId) => {
    return !!reservations[giftId];
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900 mb-4">
            {siteConfig.registry?.title || 'Wedding Registry'}
          </h1>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.registry?.subtitle || "Your presence is the greatest gift, but if you'd like to honor us with something special..."}
          </p>
        </div>

        {/* Registries */}
        {registries.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Gift Registries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {registries.map((registry, index) => {
                const giftId = `registry-${index}`;
                const reserved = isReserved(giftId);
                
                return (
                  <Card key={index} className="p-6 text-center relative">
                    {reserved && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Reserved
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">
                      {registry.name}
                    </h3>
                    {registry.description && (
                      <p className="text-apple-gray-600 mb-4">{registry.description}</p>
                    )}
                    {reserved && (
                      <p className="text-sm text-apple-gray-500 mb-4 italic">
                        Reserved by: {reservations[giftId]?.reservedBy}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <a href={registry.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" className="w-full">Visit Registry</Button>
                      </a>
                      {siteConfig.registry?.enableGiftTracking && !reserved && (
                        <Button
                          variant="secondary"
                          onClick={() => handleReserveClick({ id: giftId, name: registry.name })}
                          className="w-full"
                        >
                          Mark as Reserved
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Cash Funds */}
        {cashFunds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Cash Funds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {cashFunds.map((fund, index) => (
                <Card key={index} className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">
                    {fund.name}
                  </h3>
                  {fund.description && (
                    <p className="text-apple-gray-600 mb-4">{fund.description}</p>
                  )}
                  <a href={fund.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">Contribute</Button>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Thank You Message */}
        {thankYouMessage && (
          <div className="text-center mt-12">
            <p className="text-lg text-apple-gray-700 italic">{thankYouMessage}</p>
          </div>
        )}

        {registries.length === 0 && cashFunds.length === 0 && (
          <div className="text-center py-20">
            <p className="text-apple-gray-500 text-lg">Registry information coming soon!</p>
          </div>
        )}

        {/* Reserve Gift Modal */}
        <Modal
          isOpen={showReserveModal}
          onClose={() => {
            setShowReserveModal(false);
            setReserveError('');
          }}
          title="Reserve Gift"
        >
          <form onSubmit={handleReserveSubmit} className="space-y-4">
            <p className="text-apple-gray-600 mb-4">
              Reserve <strong>{selectedGift?.name}</strong> to let others know you're planning to purchase it.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={reserveForm.name}
                onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                Your Email
              </label>
              <Input
                type="email"
                placeholder="Your email"
                value={reserveForm.email}
                onChange={(e) => setReserveForm({ ...reserveForm, email: e.target.value })}
                required
              />
            </div>

            {reserveError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {reserveError}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowReserveModal(false);
                  setReserveError('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={reserveLoading}
                className="flex-1"
              >
                {reserveLoading ? 'Reserving...' : 'Reserve Gift'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default Registry;

