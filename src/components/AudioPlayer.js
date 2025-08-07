import React, { useState, useRef, useEffect } from 'react';
import Controls from './Controls';
import '../styles/AudioPlayer.css';

const AudioPlayer = ({ 
  currentTrack, 
  playlist, 
  onTrackChange, 
  onTrackEnd,
  isPlaying,
  onPlayStateChange 
}) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format time in MM:SS format
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle audio loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setIsLoading(true);
    setError(null);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleError = (e) => {
      setError('Failed to load audio file');
      setIsLoading(false);
      console.error('Audio loading error:', e);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      onPlayStateChange(false);
      onTrackEnd();
    };

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(handleError);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    // Load the new track
    audio.src = currentTrack.url;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrack]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
        setError('Playback failed');
        onPlayStateChange(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, onPlayStateChange]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handlePlay = () => {
    onPlayStateChange(true);
  };

  const handlePause = () => {
    onPlayStateChange(false);
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    onPlayStateChange(false);
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    onTrackChange(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    if (!playlist || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    onTrackChange(playlist[prevIndex]);
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return (
      <div className="audio-player audio-player--empty">
        <div className="audio-player__empty-state">
          <p>No track selected</p>
          <span>Upload and select a track to start playing</span>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Track Info */}
      <div className="audio-player__track-info">
        <h3 className="audio-player__track-title">
          {currentTrack.name}
        </h3>
        {currentTrack.artist && (
          <p className="audio-player__track-artist">
            {currentTrack.artist}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="audio-player__progress-section">
        <span className="audio-player__time audio-player__time--current">
          {formatTime(currentTime)}
        </span>
        
        <div 
          className="audio-player__progress-container"
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <div className="audio-player__progress-bar">
            <div 
              className="audio-player__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
            <div 
              className="audio-player__progress-handle"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <span className="audio-player__time audio-player__time--duration">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        isLoading={isLoading}
        volume={volume}
        isMuted={isMuted}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        hasNext={playlist && playlist.length > 1}
        hasPrevious={playlist && playlist.length > 1}
      />

      {/* Error Display */}
      {error && (
        <div className="audio-player__error">
          <span className="audio-player__error-message">
            {error}
          </span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="audio-player__loading">
          <div className="audio-player__loading-spinner" />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;