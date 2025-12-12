import React from 'react';

/**
 * Apple-style Button component
 * @param {string} variant - 'primary', 'secondary', or 'ghost'
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {boolean} disabled - Whether button is disabled
 */
function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-apple-gray-900 text-white hover:bg-apple-gray-800 shadow-apple hover:shadow-apple-lg hover:scale-105 active:scale-95',
    secondary: 'bg-white text-apple-gray-900 border border-apple-gray-200 hover:bg-apple-gray-50 shadow-apple hover:shadow-apple-lg hover:scale-105 active:scale-95',
    ghost: 'bg-transparent text-apple-gray-900 hover:bg-apple-gray-100',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

