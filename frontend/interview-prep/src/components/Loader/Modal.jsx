import React from 'react'
import { ImCross } from "react-icons/im";

const Modal = ({isOpen, onClose, children, title,hideheader}) => {
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 flex justify-center items-center z-50'>
      <div
        className="absolute inset-0 bg-transparent opacity-50 backdrop-filter backdrop-brightness-0"
        onClick={onClose}
      />
      <div className='relative flex flex-col bg-white rounded-lg p-6 w-full max-w-md shadow-lg overflow-hidden' >
        {!hideheader && (
          <div className='flex items-center justify-between mb-4 border-b border-gray-300'> 
            <h3 className='text-2xl font-bold mb-4 text-gray-900'>{title}</h3>
          </div>
        )}

        <button className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer'
        onClick={onClose}
        type='button'
        >
          <ImCross />
        </button>

        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          {children}
        </div>
      
      </div>
    </div>
  )
}

export default Modal ;
