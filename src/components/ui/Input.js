import React from 'react';

/**
 * Apple-style Input component
 */
function Input({ className = '', error = false, ...props }) {
  const errorClasses = error 
    ? 'border-red-300 focus:ring-red-500' 
    : 'border-apple-gray-200 focus:ring-apple-blue-500';
  
  return (
    <input
      className={`input-apple ${errorClasses} ${className}`}
      {...props}
    />
  );
}

export default Input;

