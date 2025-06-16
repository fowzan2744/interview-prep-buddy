import React, { useState, useEffect, useRef } from 'react';
import { LuChevronDown, LuPinOff, LuPin, LuSparkles } from 'react-icons/lu';
import AIresponsePreview from '../AIresponsePreview';

const QuestionCard = ({
  question,
  answer,
  isPinned,
  onTogglePin,
  onLearnMore,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + 10);
    } else {
      setHeight(0);
    }
  }, [isExpanded]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 group transition-all duration-300 border border-gray-200">
      <div className="flex items-start justify-between ">
        <div className="flex flex-col gap-1 w-full md:cursor-pointer" onClick={toggleExpand}>
          <span className="text-sm font-medium text-gray-500">Q:</span>
          <h3 className="text-lg font-semibold text-gray-800 hover:underline">
            {question}
          </h3>
        </div>

        <div className="flex cursor-pointer items-center gap-3 opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity ml-4">
          <button
            className={`transition-colors ${
              isPinned 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={onTogglePin}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? (
              <LuPin className="w-5 h-5 cursor-pointer fill-current" />
            ) : (
              <LuPinOff className="w-5 h-5 cursor-pointer fill-current" />
            )}
          </button>

          <button
            className="text-gray-500 hover:text-yellow-500 flex items-center gap-1 text-sm"
            onClick={() => {
              setIsExpanded(true);
              onLearnMore();
            }}
          >
            <LuSparkles className="w-5 h-5 cursor-pointer" />
            <span className='hidden md:block'>Learn More</span>
          </button>

          <button
            className="text-gray-500 hover:text-black transition-transform"
            onClick={toggleExpand}
            title="Toggle Answer"
          >
            <LuChevronDown
              className={`w-5 h-5 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-300 mt-4"
        style={{ maxHeight: `${height}px` }}
      >
        <div ref={contentRef}>
          <span className="text-sm font-medium text-gray-500">A:</span>
          <AIresponsePreview content={answer} />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
