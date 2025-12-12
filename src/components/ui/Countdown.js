import React, { useState, useEffect } from 'react';

/**
 * Countdown Timer component
 * @param {string} targetDate - Target date in ISO format (e.g., '2025-02-22T12:00:00')
 */
function Countdown({ targetDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);
  
  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];
  
  return (
    <div className={`flex gap-4 justify-center ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={index} className="text-center">
          <div className="bg-white rounded-xl shadow-apple px-6 py-4 min-w-[80px]">
            <div className="text-3xl font-bold text-apple-gray-900">
              {String(unit.value).padStart(2, '0')}
            </div>
          </div>
          <div className="mt-2 text-sm text-apple-gray-600 font-medium">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Countdown;

