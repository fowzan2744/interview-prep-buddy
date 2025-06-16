import React from 'react';
import { LuX } from 'react-icons/lu';

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      className={`fixed top-16 right-0 z-40 h-[calc(100vh-64px)] overflow-y-auto transition-transform bg-white w-full shadow-lg md:w-[40vw] border-l border-gray-200 backdrop-brightness-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      tabIndex={-1}
      aria-labelledby='drawer-title'
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h5 id="drawer-title" className="flex items-center text-base font-semibold text-gray-900">
          {title}
        </h5>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-900 p-2 rounded-lg transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <LuX className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Drawer;