import React from 'react'
import { LuTrash } from 'react-icons/lu';
import { getInitials } from '../../utils/helper';

const SummaryCard = (
    {
        colors,
        role,
        experience,
        topicsToFocus,
        description,
        questions,
        lastUpdated,
        onSelect,
        onDelete
    }
) => {
    
    console.log(colors);
  return (
    <div className='w-fit border border-gray-200 rounded-2xl p-2 overflow-hidden cursor-pointer hover:shadow-2xl relative group' onClick={onSelect}>
      <div className={`rounded-lg cursor-pointer relative shadow-md p-4 `} style={
        {
            background: colors,
        }
      }>
        <div className='flex justify-between items-start'>
            <div className='flex-shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4'>
                <span className='text-lg font-semibold text-gray-900'>{getInitials(role)}</span>
            </div>

            <div className='flex-grow'>
                <div className='flex justify-between items-start'>
                    <div>
                        <h2 className='text-lg font-semibold text-gray-800'>{role}</h2>
                        <p className='text-sm text-gray-600'>{topicsToFocus}</p>
                    </div>
                </div>
            </div>
            </div>

            <button className='hidden group-hover:flex items-center text-white bg-red-700 text-sm font-semibold cursor-pointer px-3 py-1 rounded-full text-nowrap border border-rose-200 hover:border-r-amber-200 absolute top-0 right-0' onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}>
                Delete <LuTrash className='text-lg ml-2 font-bold' />
            </button>
            </div>

            <div className=' px-3 pb-3'>
                <div className='flex flex-wrap items-start gap-2 mt-4'>
                    <div className='text-sm text-gray-600 font-medium px-3 py-1 border border-gray-800 rounded-2xl'> 
                        Experience: {experience} {experience === 1 ? 'Year' : 'Years'}
                    </div>

                    <div className='text-sm text-gray-600 font-medium px-3 py-1 border border-gray-800 rounded-2xl'>
                        {questions.length} Q&A
                    </div>

                    <div className='text-sm text-gray-600 font-medium px-3 py-1 border border-gray-800 rounded-2xl'>
                        Last Updated: {lastUpdated}
                    </div>
                </div>
                <p className='text-gray-700 mt-3 '>
                    {description}
                </p>
            </div>

    </div>
  )
}

export default SummaryCard
