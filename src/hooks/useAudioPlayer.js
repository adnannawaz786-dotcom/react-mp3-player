import { useState, useRef, useEffect, useCallback } from 'react';

const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadStart = () => {
      setIsLoading(true);
      setIsBuffering(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-play next track if available
      if (playlist.length > 0 && currentTrackIndex < playlist.length - 1) {
        playNext();
      }
    };

    const handleError = (e) => {
      setIsPlaying(false);
      setIsLoading(false);
      setIsBuffering(false);
      setError('Failed to load audio file');
      console.error('Audio error:', e);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlayThrough = () => {
      setIsBuffering(false);
    };

    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [playlist, currentTrackIndex]);

  // Load track
  const loadTrack = useCallback((track) => {
    if (!audioRef.current || !track) return;

    const audio = audioRef.current;
    
    // Stop current playback
    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);

    // Load new track
    audio.src = track.url;
    audio.load();
    setCurrentTrack(track);
  }, []);

  // Play audio
  const play = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      setError(null);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to play audio');
      setIsPlaying(false);
      console.error('Play error:', err);
    }
  }, [currentTrack]);

  // Pause audio
  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Stop audio
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Seek to specific time
  const seek = useCallback((time) => {
    if (!audioRef.current) return;

    const clampedTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }, [duration]);

  // Set volume
  const changeVolume = useCallback((newVolume) => {
    if (!audioRef.current) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
    
    // Unmute if volume is set above 0
    if (clampedVolume > 0 && isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    if (!audioRef.current) return;

    const clampedRate = Math.max(0.25, Math.min(4, rate));
    audioRef.current.playbackRate = clampedRate;
    setPlaybackRate(clampedRate);
  }, []);

  // Add track to playlist
  const addToPlaylist = useCallback((track) => {
    setPlaylist(prev => [...prev, { ...track, id: Date.now() + Math.random() }]);
  }, []);

  // Remove track from playlist
  const removeFromPlaylist = useCallback((trackId) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(track => track.id !== trackId);
      
      // Adjust current track index if necessary
      const removedIndex = prev.findIndex(track => track.id === trackId);
      if (removedIndex !== -1 && removedIndex <= currentTrackIndex) {
        setCurrentTrackIndex(prevIndex => Math.max(0, prevIndex - 1));
      }
      
      return newPlaylist;
    });
  }, [currentTrackIndex]);

  // Clear playlist
  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentTrackIndex(0);
    stop();
    setCurrentTrack(null);
  }, [stop]);

  // Play specific track from playlist
  const playTrack = useCallback((trackIndex) => {
    if (trackIndex < 0 || trackIndex >= playlist.length) return;

    const track = playlist[trackIndex];
    setCurrentTrackIndex(trackIndex);
    loadTrack(track);
  }, [playlist, loadTrack]);

  // Play next track
  const playNext = useCallback(() => {
    if (playlist.length === 0) return;

    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
  }, [playlist.length, currentTrackIndex, playTrack]);

  // Play previous track
  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;

    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  }, [playlist.length, currentTrackIndex, playTrack]);

  // Skip forward/backward
  const skipForward = useCallback((seconds = 10) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);

  const skipBackward = useCallback((seconds = 10) => {
    seek(currentTime - seconds);
  }, [currentTime, seek]);

  // Get progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get buffered percentage
  const getBufferedPercentage = useCallback(() => {
    if (!audioRef.current || duration === 0) return 0;

    const buffered = audioRef.current.buffered;
    if (buffered.length === 0) return 0;

    const bufferedEnd = buffered.end(buffered.length - 1);
    return (bufferedEnd / duration) * 100;
  }, [duration]);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (isNaN(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isPlaying,
    isLoading,
    isBuffering,
    duration,
    currentTime,
    volume,
    isMuted,
    playbackRate,
    currentTrack,
    playlist,
    currentTrackIndex,
    error,
    progress,
    
    // Actions
    loadTrack,
    play,
    pause,
    togglePlayPause,
    stop,
    seek,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    playTrack,
    playNext,
    playPrevious,
    skipForward,
    skipBackward,
    
    // Utilities
    getBufferedPercentage,
    formatTime,
    
    // Audio element ref
    audioRef
  };
};

export default useAudioPlayer;