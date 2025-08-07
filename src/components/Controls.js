import React from 'react';
import PropTypes from 'prop-types';
import './Controls.css';

const Controls = ({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onPrevious,
  onNext,
  volume,
  onVolumeChange,
  currentTime,
  duration,
  onSeek,
  isLoading,
  hasPrevious,
  hasNext,
  isMuted,
  onToggleMute
}) => {
  const handleSeekChange = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    onSeek(seekTime);
  };

  const handleVolumeChange = (e) => {
    onVolumeChange(e.target.value / 100);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  return (
    <div className="controls">
      {/* Progress Bar */}
      <div className="progress-section">
        <span className="time-display current-time">
          {formatTime(currentTime)}
        </span>
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeekChange}
            className="progress-slider"
            disabled={!duration || isLoading}
            aria-label="Seek audio position"
          />
        </div>
        <span className="time-display total-time">
          {formatTime(duration)}
        </span>
      </div>

      {/* Main Controls */}
      <div className="main-controls">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious || isLoading}
          className="control-btn previous-btn"
          aria-label="Previous track"
          title="Previous track"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={isLoading}
          className={`control-btn play-pause-btn ${isPlaying ? 'playing' : 'paused'}`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <button
          onClick={onStop}
          disabled={isLoading}
          className="control-btn stop-btn"
          aria-label="Stop"
          title="Stop"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext || isLoading}
          className="control-btn next-btn"
          aria-label="Next track"
          title="Next track"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-control">
        <button
          onClick={onToggleMute}
          className="control-btn volume-btn"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : volume < 0.5 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>
        <div className="volume-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={volumePercentage}
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Volume control"
            title={`Volume: ${Math.round(volumePercentage)}%`}
          />
          <div 
            className="volume-fill"
            style={{ width: `${volumePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  onSeek: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  hasPrevious: PropTypes.bool,
  hasNext: PropTypes.bool,
  isMuted: PropTypes.bool,
  onToggleMute: PropTypes.func.isRequired
};

Controls.defaultProps = {
  currentTime: 0,
  duration: 0,
  isLoading: false,
  hasPrevious: false,
  hasNext: false,
  isMuted: false
};

export default Controls;