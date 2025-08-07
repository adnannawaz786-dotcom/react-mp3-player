/**
 * Audio utility functions for MP3 player
 * Handles audio file validation, metadata extraction, and format checking
 */

/**
 * Validates if a file is a supported audio format
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file is a supported audio format
 */
export const isAudioFile = (file) => {
  if (!file) return false;
  
  const supportedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/webm'
  ];
  
  return supportedTypes.includes(file.type) || 
         /\.(mp3|wav|ogg|aac|m4a|webm)$/i.test(file.name);
};

/**
 * Validates file size (max 50MB)
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file size is acceptable
 */
export const isValidFileSize = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  return file && file.size <= maxSize;
};

/**
 * Formats duration from seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Creates an audio URL from a file
 * @param {File} file - The audio file
 * @returns {string} - Object URL for the file
 */
export const createAudioUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revokes an object URL to free memory
 * @param {string} url - The object URL to revoke
 */
export const revokeAudioUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Extracts metadata from an audio file
 * @param {File} file - The audio file
 * @returns {Promise<Object>} - Promise resolving to metadata object
 */
export const extractMetadata = (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = createAudioUrl(file);
    
    const cleanup = () => {
      revokeAudioUrl(url);
      audio.removeEventListener('loadedmetadata', onLoad);
      audio.removeEventListener('error', onError);
    };
    
    const onLoad = () => {
      const metadata = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        duration: audio.duration,
        size: file.size,
        type: file.type || 'audio/mpeg',
        lastModified: file.lastModified
      };
      cleanup();
      resolve(metadata);
    };
    
    const onError = () => {
      const metadata = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        duration: 0,
        size: file.size,
        type: file.type || 'audio/mpeg',
        lastModified: file.lastModified
      };
      cleanup();
      resolve(metadata);
    };
    
    audio.addEventListener('loadedmetadata', onLoad);
    audio.addEventListener('error', onError);
    audio.src = url;
  });
};

/**
 * Validates multiple audio files
 * @param {FileList|File[]} files - Files to validate
 * @returns {Object} - Validation result with valid files and errors
 */
export const validateAudioFiles = async (files) => {
  const fileArray = Array.from(files);
  const validFiles = [];
  const errors = [];
  
  for (const file of fileArray) {
    if (!isAudioFile(file)) {
      errors.push(`${file.name}: Unsupported file format`);
      continue;
    }
    
    if (!isValidFileSize(file)) {
      errors.push(`${file.name}: File size too large (max 50MB)`);
      continue;
    }
    
    try {
      const metadata = await extractMetadata(file);
      validFiles.push({
        file,
        metadata,
        id: generateFileId(file),
        url: createAudioUrl(file)
      });
    } catch (error) {
      errors.push(`${file.name}: Failed to process file`);
    }
  }
  
  return { validFiles, errors };
};

/**
 * Generates a unique ID for a file
 * @param {File} file - The file to generate ID for
 * @returns {string} - Unique file ID
 */
export const generateFileId = (file) => {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
};

/**
 * Calculates progress percentage
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Gets the next track index based on repeat and shuffle modes
 * @param {number} currentIndex - Current track index
 * @param {number} totalTracks - Total number of tracks
 * @param {boolean} shuffle - Shuffle mode enabled
 * @param {Array} shuffledIndices - Array of shuffled indices
 * @returns {number} - Next track index
 */
export const getNextTrackIndex = (currentIndex, totalTracks, shuffle = false, shuffledIndices = []) => {
  if (totalTracks === 0) return -1;
  
  if (shuffle && shuffledIndices.length > 0) {
    const currentShuffleIndex = shuffledIndices.indexOf(currentIndex);
    const nextShuffleIndex = (currentShuffleIndex + 1) % shuffledIndices.length;
    return shuffledIndices[nextShuffleIndex];
  }
  
  return (currentIndex + 1) % totalTracks;
};

/**
 * Gets the previous track index
 * @param {number} currentIndex - Current track index
 * @param {number} totalTracks - Total number of tracks
 * @param {boolean} shuffle - Shuffle mode enabled
 * @param {Array} shuffledIndices - Array of shuffled indices
 * @returns {number} - Previous track index
 */
export const getPreviousTrackIndex = (currentIndex, totalTracks, shuffle = false, shuffledIndices = []) => {
  if (totalTracks === 0) return -1;
  
  if (shuffle && shuffledIndices.length > 0) {
    const currentShuffleIndex = shuffledIndices.indexOf(currentIndex);
    const prevShuffleIndex = currentShuffleIndex === 0 ? shuffledIndices.length - 1 : currentShuffleIndex - 1;
    return shuffledIndices[prevShuffleIndex];
  }
  
  return currentIndex === 0 ? totalTracks - 1 : currentIndex - 1;
};