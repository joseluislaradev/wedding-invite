import React, { useState } from 'react';

/**
 * Highlight text matching search query
 */
const highlightText = (text, query) => {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-apple-gray-900 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

/**
 * Apple-style Accordion component
 */
function Accordion({ items, className = '', highlightQuery = '' }) {
  const [openIndex, setOpenIndex] = useState(null);
  
  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="border border-apple-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle(index)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-apple-gray-50 transition-colors text-left"
          >
            <span className="font-medium text-apple-gray-900">
              {highlightQuery ? highlightText(item.title, highlightQuery) : item.title}
            </span>
            <svg
              className={`w-5 h-5 text-apple-gray-500 transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-apple-gray-50 border-t border-apple-gray-200 animate-slide-up">
              <p className="text-apple-gray-700">
                {highlightQuery ? highlightText(item.content, highlightQuery) : item.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Accordion;

