import React, { useState, useEffect } from 'react';
import siteConfig from '../siteConfig';
import Card from './ui/Card';
import Button from './ui/Button';

function Travel() {
  const { hotels = [], transportation = {}, localAttractions = [], maps = {} } = siteConfig.travel || {};
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Fetch weather forecast
  useEffect(() => {
    const fetchWeather = async () => {
      // Get coordinates from config or use wedding location
      const location = siteConfig.wedding?.location || siteConfig.travel?.location;
      const coordinates = siteConfig.travel?.coordinates; // { lat, lon }
      
      if (!coordinates && !location) return;

      setWeatherLoading(true);
      setWeatherError(null);

      try {
        let lat, lon;
        
        if (coordinates) {
          lat = coordinates.lat;
          lon = coordinates.lon;
        } else {
          // Try to geocode location (simplified - in production, use a geocoding service)
          // For now, we'll skip if no coordinates provided
          setWeatherLoading(false);
          return;
        }

        // Get wedding date
        const weddingDate = new Date(siteConfig.wedding?.date || Date.now());
        const today = new Date();
        const daysUntilWedding = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));
        
        // Open-Meteo API (free, no API key needed)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.daily && daysUntilWedding >= 0 && daysUntilWedding < 7) {
          // Get weather for wedding day
          const weddingDayIndex = daysUntilWedding;
          setWeather({
            date: data.daily.time[weddingDayIndex],
            maxTemp: data.daily.temperature_2m_max[weddingDayIndex],
            minTemp: data.daily.temperature_2m_min[weddingDayIndex],
            weatherCode: data.daily.weathercode[weddingDayIndex],
            forecast: data.daily.time.slice(0, 7).map((date, idx) => ({
              date,
              maxTemp: data.daily.temperature_2m_max[idx],
              minTemp: data.daily.temperature_2m_min[idx],
              weatherCode: data.daily.weathercode[idx],
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeatherError('Unable to load weather forecast');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Weather code to description mapping
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };
    return weatherCodes[code] || 'Unknown';
  };

  const getWeatherEmoji = (code) => {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 86) return '🌦️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900">
              {siteConfig.travel?.title || 'Travel & Accommodation'}
            </h1>
            <button
              onClick={() => window.print()}
              className="no-print px-3 py-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors"
              aria-label="Print page"
              title="Print travel info"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.travel?.subtitle || 'Everything you need to know about getting here and staying here'}
          </p>
        </div>

        {/* Hotels */}
        {hotels.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Recommended Hotels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {hotels.map((hotel, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-3">
                    {hotel.name}
                  </h3>
                  <p className="text-apple-gray-600 mb-2">{hotel.address}</p>
                  {hotel.phone && (
                    <p className="text-apple-gray-600 mb-2">Phone: {hotel.phone}</p>
                  )}
                  {hotel.distance && (
                    <p className="text-apple-blue-600 font-medium mb-2">{hotel.distance}</p>
                  )}
                  {hotel.description && (
                    <p className="text-apple-gray-600 mb-4">{hotel.description}</p>
                  )}
                  {hotel.bookingCode && (
                    <p className="text-sm text-apple-gray-500 mb-4">
                      Booking Code: <span className="font-mono">{hotel.bookingCode}</span>
                    </p>
                  )}
                  {hotel.website && (
                    <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="sm">Book Now</Button>
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transportation */}
        {(transportation.airport || transportation.parking || transportation.shuttle) && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Transportation
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {transportation.airport && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 mb-2">
                    Airport Information
                  </h3>
                  <p className="text-apple-gray-600">
                    <strong>{transportation.airport.name}</strong> ({transportation.airport.code})
                    {transportation.airport.distance && ` - ${transportation.airport.distance} from venue`}
                  </p>
                  {transportation.airport.directions && (
                    <p className="text-apple-gray-600 mt-2">{transportation.airport.directions}</p>
                  )}
                </Card>
              )}
              {transportation.parking && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 mb-2">Parking</h3>
                  <p className="text-apple-gray-600">{transportation.parking}</p>
                </Card>
              )}
              {transportation.shuttle && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 mb-2">Shuttle Service</h3>
                  <p className="text-apple-gray-600">{transportation.shuttle}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Local Attractions */}
        {localAttractions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Local Attractions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {localAttractions.map((attraction, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 mb-2">
                    {attraction.name}
                  </h3>
                  {attraction.description && (
                    <p className="text-apple-gray-600 mb-4">{attraction.description}</p>
                  )}
                  {attraction.website && (
                    <a href={attraction.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">Learn More</Button>
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Weather Forecast */}
        {(weather || weatherLoading || weatherError) && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Weather Forecast
            </h2>
            {weatherLoading && (
              <Card className="p-6 text-center max-w-2xl mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-gray-900 mx-auto mb-2"></div>
                <p className="text-apple-gray-600">Loading weather forecast...</p>
              </Card>
            )}
            {weatherError && (
              <Card className="p-6 text-center max-w-2xl mx-auto">
                <p className="text-apple-gray-600">{weatherError}</p>
              </Card>
            )}
            {weather && (
              <div className="max-w-4xl mx-auto">
                {/* Wedding Day Weather */}
                <Card className="p-6 mb-6">
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-4">
                    Wedding Day Forecast
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{getWeatherEmoji(weather.weatherCode)}</div>
                    <div className="flex-1">
                      <p className="text-2xl font-semibold text-apple-gray-900">
                        {getWeatherDescription(weather.weatherCode)}
                      </p>
                      <p className="text-apple-gray-600 mt-1">
                        {new Date(weather.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-lg text-apple-gray-700 mt-2">
                        High: {Math.round(weather.maxTemp)}°C / Low: {Math.round(weather.minTemp)}°C
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* 7-Day Forecast */}
                {weather.forecast && weather.forecast.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-apple-gray-900 mb-4 text-center">
                      7-Day Forecast
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                      {weather.forecast.map((day, index) => (
                        <Card key={index} className="p-4 text-center">
                          <p className="text-sm font-medium text-apple-gray-700 mb-2">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <div className="text-3xl mb-2">{getWeatherEmoji(day.weatherCode)}</div>
                          <p className="text-xs text-apple-gray-600 mb-1">
                            {getWeatherDescription(day.weatherCode)}
                          </p>
                          <p className="text-sm text-apple-gray-900">
                            {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Maps */}
        {maps.venue && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 text-center">
              Venue Location
            </h2>
            <div className="max-w-4xl mx-auto">
              <iframe
                src={maps.venue}
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '1rem' }}
                allowFullScreen=""
                loading="lazy"
                title="Venue Location"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Travel;

