import React, { useState } from 'react';
import siteConfig from '../siteConfig';
import Accordion from './ui/Accordion';
import Input from './ui/Input';

function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const questions = siteConfig.faq?.questions || [];

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900 mb-4">
            {siteConfig.faq?.title || 'Frequently Asked Questions'}
          </h1>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.faq?.subtitle || 'Everything you need to know'}
          </p>
        </div>

        {/* Search */}
        {questions.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* FAQ Items */}
        {filteredQuestions.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <Accordion
              items={filteredQuestions.map((q) => ({
                title: q.title,
                content: q.content,
              }))}
              highlightQuery={searchQuery}
            />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-apple-gray-500 text-lg">FAQ information coming soon!</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-apple-gray-500 text-lg">No questions found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQ;

