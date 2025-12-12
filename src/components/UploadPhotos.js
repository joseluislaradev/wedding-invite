import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import siteConfig from '../siteConfig';
import Card from './ui/Card';
import Button from './ui/Button';

function UploadPhotos() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter((file) => {
      const maxSize = (siteConfig.uploadPhotos?.maxFileSize || 10) * 1024 * 1024; // Convert to bytes
      const allowedTypes = siteConfig.uploadPhotos?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image type.`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is ${siteConfig.uploadPhotos?.maxFileSize || 10}MB.`);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
    
    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileChange(e.target.files);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // Simulate upload progress
  const simulateProgress = () => {
    return new Promise((resolve) => {
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 10;
        setProgress(progressValue);
        if (progressValue >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one file to upload.');
      return;
    }

    setUploading(true);
    setMessage('');
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      await simulateProgress();

      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Files uploaded successfully!');
        setTimeout(() => {
          navigate('/gallery');
        }, 2000);
      } else {
        setMessage(result.message || 'Failed to upload files.');
      }
    } catch (error) {
      console.error('Error during upload:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-title font-semibold text-apple-gray-900 mb-4">
            {siteConfig.uploadPhotos?.title || 'Upload Your Photos'}
          </h1>
          <p className="text-lg text-apple-gray-600 max-w-2xl mx-auto">
            {siteConfig.uploadPhotos?.subtitle || 'Share your favorite moments from our special day!'}
          </p>
        </div>

        {/* Drag and Drop Area */}
        <Card
          className={`p-12 mb-8 transition-all ${
            isDragging ? 'border-2 border-apple-blue-500 bg-apple-blue-50' : 'border-2 border-dashed border-apple-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop photos here'}
            </h3>
            <p className="text-apple-gray-600 mb-6">or</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choose Files
            </Button>
            <p className="text-sm text-apple-gray-500 mt-4">
              Supported: JPEG, PNG, WebP (Max {siteConfig.uploadPhotos?.maxFileSize || 10}MB per file)
            </p>
          </div>
        </Card>

        {/* File Previews */}
        {previews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-apple-gray-900 mb-4">
              Selected Photos ({previews.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <Card key={index} className="relative group overflow-hidden">
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="p-2 text-xs text-apple-gray-600 truncate">{preview.file.name}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button and Progress */}
        {files.length > 0 && (
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpload}
              disabled={uploading}
              className="mb-6"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length > 1 ? 's' : ''}`}
            </Button>

            {uploading && (
              <div className="max-w-md mx-auto">
                <div className="w-full bg-apple-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-apple-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-apple-gray-600">{progress}% complete</p>
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-xl text-center ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPhotos;
