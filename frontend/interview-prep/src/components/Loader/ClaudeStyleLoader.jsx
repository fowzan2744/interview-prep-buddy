import React, { useState, useEffect } from 'react';

const ClaudeStyleLoading = ({ mode = 'default' }) => {
  const [dots, setDots] = useState('');
  const [currentText, setCurrentText] = useState('');
  
  const loadingMessages = mode === 'update' 
    ? [
        'Creating questions',
        'Generating explanations',
        'Formatting response',
        'Almost ready'
      ]
    : [
        'Analyzing your question',
        'Generating explanation',
        'Formatting response',
        'Almost ready'
      ];

  useEffect(() => {
    let dotInterval;
    let textInterval;
    let messageIndex = 0;

    // Animate dots
    dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Cycle through messages
    textInterval = setInterval(() => {
      setCurrentText(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 2000);

    // Set initial message
    setCurrentText(loadingMessages[0]);

    return () => {
      clearInterval(dotInterval);
      clearInterval(textInterval);
    };
  }, [loadingMessages]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-8">
        <div className="flex flex-col space-y-6">
          {/* Main loading message */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 text-lg font-medium">
              {currentText}{dots}
            </span>
          </div>

          {/* Simulated text blocks being generated */}
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {/* First paragraph simulation */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-4/5"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>

            {/* Second paragraph simulation */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>

            {/* Third paragraph simulation */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-4/5"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>

            {/* Fourth paragraph simulation */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
            </div>

            {/* Typing indicator */}
            <div className="flex items-center justify-center space-x-2 pt-4">
              <div className="w-1 h-5 bg-blue-500 animate-pulse rounded"></div>
              <span className="text-sm text-gray-500">Generating...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default ClaudeStyleLoading;