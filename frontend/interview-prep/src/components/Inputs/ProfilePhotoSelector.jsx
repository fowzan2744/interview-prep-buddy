import React from 'react';
import { LuUser, LuTrash, LuUpload } from 'react-icons/lu';

const ProfilePhotoSelector = ({ image, setImage, previewImage, setPreviewImage }) => {
  const inputRef = React.useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewImage?.(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewImage?.(null);
    inputRef.current.value = null;
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const previewSrc = previewImage || (image ? URL.createObjectURL(image) : null);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="relative w-24 h-24 flex items-center justify-center">
        {!previewSrc ? (
          <>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-2 border-black">
              <LuUser size={40} className="text-gray-600" />
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="absolute cursor-pointer bottom-0 right-0 bg-blue-500 text-white rounded-full p-1"
              title="Upload image"
            >
              <LuUpload size={16} />
            </button>
          </>
        ) : (
          <>
            <img
              src={previewSrc}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-full border-2 border-black"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute cursor-pointer bottom-0 right-0 bg-red-500 text-white rounded-full p-1"
              title="Remove image"
            >
              <LuTrash size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoSelector;
