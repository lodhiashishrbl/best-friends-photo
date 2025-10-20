
import React, { useState, useRef } from 'react';
import { UploadedFile } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageUpload: (file: UploadedFile | null) => void;
  uploadedFile: UploadedFile | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageUpload, uploadedFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          if (base64) {
            onImageUpload({
              base64,
              mimeType: file.type,
              name: file.name,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="w-full md:w-1/2 p-3">
      <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
        <label
          htmlFor={id}
          className={`relative w-full h-64 border-2 border-dashed rounded-xl flex flex-col justify-center items-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <img src={`data:${uploadedFile.mimeType};base64,${uploadedFile.base64}`} alt="Preview" className="object-contain h-full w-full rounded-lg" />
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <UploadIcon className="w-12 h-12 mb-2"/>
              <p className="font-medium">Click to upload or drag & drop</p>
              <p className="text-sm text-gray-400">PNG, JPG, WEBP, etc.</p>
            </div>
          )}
          <input
            id={id}
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </label>
        {uploadedFile && (
            <button
              onClick={() => {
                onImageUpload(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          )}
      </div>
    </div>
  );
};

export default ImageUploader;
