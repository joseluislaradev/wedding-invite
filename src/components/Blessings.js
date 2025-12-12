import React, { useState, useEffect } from 'react';
import siteConfig from '../siteConfig';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

function Blessings() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [allBlessings, setAllBlessings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [likes, setLikes] = useState(() => {
    // Load likes from localStorage
    try {
      const stored = localStorage.getItem('blessings-likes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Save likes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('blessings-likes', JSON.stringify(likes));
    } catch (error) {
      console.error('Failed to save likes:', error);
    }
  }, [likes]);

  // Load all blessings (mock data for now - in production, fetch from Google Sheets)
  useEffect(() => {
    // This would fetch from your backend/Google Sheets API
    // For now, we'll use empty array
    setAllBlessings([]);
  }, []);

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (formData.name && formData.email && formData.message) {
      setErrorMessage('');
      setLoading(true);

      try {
        const response = await fetch('/.netlify/functions/submit-blessings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setSubmitted(true);
          setFormData({ name: '', email: '', message: '' });
          // Refresh blessings list
          setTimeout(() => {
            setSubmitted(false);
            if (siteConfig.blessings?.showAllBlessings) {
              setShowForm(false);
            }
          }, 2000);
        } else {
          setErrorMessage(result.message || 'Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting blessing:', error);
        setErrorMessage('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredBlessings = allBlessings.filter((blessing) =>
    blessing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blessing.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLike = (blessingId) => {
    if (!siteConfig.blessings?.enableLikes) return;
    
    setLikes((prevLikes) => {
      const newLikes = { ...prevLikes };
      if (newLikes[blessingId]) {
        delete newLikes[blessingId];
      } else {
        newLikes[blessingId] = true;
      }
      return newLikes;
    });
  };

  const getLikeCount = (blessingId) => {
    return likes[blessingId] ? 1 : 0; // Simple implementation - in production, this would come from backend
  };

  const isLiked = (blessingId) => {
    return !!likes[blessingId];
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900 mb-4">
            {siteConfig.blessings?.title || 'Drop Us Your Blessing'}
          </h1>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.blessings?.subtitle || "Your blessings mean the world to us. Share your thoughts, prayers, and kind words as we embark on this new journey together."}
          </p>
        </div>

        {/* Toggle between form and view all */}
        {siteConfig.blessings?.showAllBlessings && allBlessings.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={showForm ? 'primary' : 'secondary'}
              onClick={() => setShowForm(true)}
            >
              Leave a Blessing
            </Button>
            <Button
              variant={!showForm ? 'primary' : 'secondary'}
              onClick={() => setShowForm(false)}
            >
              View All ({allBlessings.length})
            </Button>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-12">
            {!submitted ? (
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Your Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      error={errorMessage.includes('email')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      className="input-apple min-h-[120px] resize-none"
                      placeholder="Your message for us"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Sending...' : 'Send Blessing'}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-semibold text-apple-gray-900 mb-2">
                  Thank You!
                </h2>
                <p className="text-apple-gray-600">
                  We are so grateful for your kind words and blessings!
                </p>
              </Card>
            )}
          </div>
        )}

        {/* View All Blessings */}
        {!showForm && siteConfig.blessings?.showAllBlessings && (
          <div className="max-w-4xl mx-auto">
            {/* Search */}
            {siteConfig.blessings?.enableSearch && (
              <div className="mb-8">
                <Input
                  type="text"
                  placeholder="Search blessings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Blessings List */}
            {filteredBlessings.length > 0 ? (
              <div className="grid gap-6">
                {filteredBlessings.map((blessing, index) => {
                  const blessingId = blessing.id || `blessing-${index}`;
                  const liked = isLiked(blessingId);
                  
                  return (
                    <Card key={index} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-apple-gray-900">{blessing.name}</h3>
                          {blessing.email && (
                            <p className="text-sm text-apple-gray-500">{blessing.email}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {blessing.timestamp && (
                            <p className="text-sm text-apple-gray-400">{blessing.timestamp}</p>
                          )}
                          {siteConfig.blessings?.enableLikes && (
                            <button
                              onClick={() => toggleLike(blessingId)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                                liked
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200'
                              }`}
                              aria-label={liked ? 'Unlike' : 'Like'}
                            >
                              <svg
                                className={`w-5 h-5 ${liked ? 'fill-current' : 'fill-none'}`}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span className="text-sm font-medium">{getLikeCount(blessingId)}</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-apple-gray-700 leading-relaxed">{blessing.message}</p>
                    </Card>
                  );
                })}
              </div>
            ) : allBlessings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-apple-gray-500 text-lg">
                  No blessings yet. Be the first to leave one!
                </p>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-apple-gray-500 text-lg">
                  No blessings found matching your search.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Blessings;
