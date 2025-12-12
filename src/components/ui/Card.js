import React from 'react';

/**
 * Apple-style Card component
 */
function Card({ children, className = '', hover = true, ...props }) {
  const hoverClasses = hover 
    ? 'hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300' 
    : '';
  
  return (
    <div
      className={`bg-white rounded-2xl shadow-apple ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;

