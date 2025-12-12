import React, { useState } from 'react';
import siteConfig from '../siteConfig';
import TimelineComponent from './ui/Timeline';
import Button from './ui/Button';

function Timeline() {
  const relationshipItems = siteConfig.timeline?.items || [];
  const planningItems = siteConfig.timeline?.planningItems || [];
  const showPlanning = siteConfig.timeline?.showPlanningTimeline && planningItems.length > 0;
  
  const [activeTab, setActiveTab] = useState('relationship');

  // Combine items if showing both
  const allItems = showPlanning && activeTab === 'all'
    ? [...relationshipItems, ...planningItems].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      )
    : activeTab === 'planning'
    ? planningItems
    : relationshipItems;

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900 mb-4">
            {siteConfig.timeline?.title || 'Our Journey'}
          </h1>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.timeline?.subtitle || 'Milestones in our relationship'}
          </p>
        </div>

        {/* Tabs */}
        {showPlanning && (
          <div className="flex justify-center gap-3 mb-12">
            <Button
              variant={activeTab === 'relationship' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('relationship')}
              size="sm"
            >
              Our Relationship
            </Button>
            <Button
              variant={activeTab === 'planning' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('planning')}
              size="sm"
            >
              Wedding Planning
            </Button>
            <Button
              variant={activeTab === 'all' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('all')}
              size="sm"
            >
              All Together
            </Button>
          </div>
        )}

        {/* Timeline */}
        {allItems.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <TimelineComponent items={allItems} />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-apple-gray-500 text-lg">Timeline information coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timeline;

