import React, { useRef, useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileSelect, onFilesAdded, multiple = false, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const acceptedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please select a valid audio file (MP3, WAV, OGG)';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    let errorMessage = '';

    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation) {
        errorMessage = validation;
        break;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      return;
    }

    setError('');

    if (multiple) {
      onFilesAdded && onFilesAdded(validFiles);
    } else {
      onFileSelect && onFileSelect(validFiles[0]);
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={multiple ? 'Upload audio files' : 'Upload audio file'}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="file-input-hidden"
          disabled={disabled}
          aria-hidden="true"
        />
        
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="14,2 14,8 20,8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 15L12 12L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="upload-text">
          <h3>{multiple ? 'Upload Audio Files' : 'Upload Audio File'}</h3>
          <p>
            Drag and drop your {multiple ? 'files' : 'file'} here or{' '}
            <span className="upload-link">click to browse</span>
          </p>
          <small>Supports MP3, WAV, OGG files up to 50MB</small>
        </div>

        {isDragOver && (
          <div className="drag-overlay">
            <div className="drag-overlay-content">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="7,10 12,15 17,10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p>Drop {multiple ? 'files' : 'file'} here</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;