import React from 'react';

const RoleInfoHeader = ({
  role ,
  topicsToFocus ,
  experience ,
  description ,
  questions ,
  lastUpdated ,
}) => {
  return (
    <div className='bg-white p-8 -mb-10 w-full'>
    
      {/* Role card */}
      <div className='bg-gradient-to-r from-white to-amber-100 p-8 w-full shadow-md transition-shadow duration-300 border-0 rounded-2xl hover:backdrop-brightness-0 hover:shadow-2xl'>
        <div className='space-y-6'>
          {/* Role title and description */}
          <div className='space-y-3'>
            <h2 className='text-4xl font-bold text-gray-900'>
              {role}
            </h2>
            <p className='text-gray-900 text-lg'>
              {topicsToFocus}
            </p>
    
          </div>
 
          {/* Tags */}
          <div className='flex flex-wrap gap-3'>
            <span className='bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200'>
              Experience: {experience} Years
            </span>
            <span className='bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200'>
              {questions?.length || 0} Q&A
            </span>
            <span className='bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200'>
              Last Updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoHeader;