import React from 'react';

/**
 * Visual Timeline component for milestones
 */
function Timeline({ items, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-apple-gray-200" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <div key={index} className="relative pl-20">
            {/* Timeline dot */}
            <div className="absolute left-6 top-2 w-4 h-4 bg-apple-blue-500 rounded-full border-4 border-white shadow-apple" />
            
            {/* Content */}
            <div className="card-apple p-6">
              <div className="text-sm text-apple-gray-500 font-medium mb-2">
                {item.date}
              </div>
              <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-apple-gray-600">{item.description}</p>
              )}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="mt-4 rounded-xl w-full max-w-md"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;

