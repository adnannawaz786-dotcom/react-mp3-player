import React from 'react';
import AudioPlayer from './components/AudioPlayer';
import FileUpload from './components/FileUpload';
import PlaylistItem from './components/PlaylistItem';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { validateAudioFile, formatDuration } from './utils/audioUtils';
import './styles/AudioPlayer.css';

function App() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    play,
    pause,
    stop,
    seek,
    setVolume,
    playTrack,
    removeTrack,
    addTrack
  } = useAudioPlayer();

  const handleFileUpload = async (files) => {
    try {
      const validFiles = [];
      
      for (const file of files) {
        if (validateAudioFile(file)) {
          const audioData = {
            id: Date.now() + Math.random(),
            file,
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: URL.createObjectURL(file),
            size: file.size,
            type: file.type,
            duration: 0
          };
          validFiles.push(audioData);
        }
      }

      if (validFiles.length > 0) {
        validFiles.forEach(track => addTrack(track));
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleTrackSelect = (track) => {
    playTrack(track.id);
  };

  const handleTrackRemove = (trackId) => {
    removeTrack(trackId);
  };

  const handleNext = () => {
    if (!playlist.length) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex].id);
  };

  const handlePrevious = () => {
    if (!playlist.length) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const previousIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playTrack(playlist[previousIndex].id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🎵</span>
            React MP3 Player
          </h1>
          <p className="app-subtitle">Upload and play your favorite music</p>
        </div>
      </header>

      <main className="app-main">
        <div className="player-container">
          <FileUpload onFileUpload={handleFileUpload} />
          
          {currentTrack && (
            <AudioPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onSeek={seek}
              onVolumeChange={setVolume}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={playlist.length > 1}
              hasPrevious={playlist.length > 1}
            />
          )}

          {playlist.length > 0 && (
            <div className="playlist-container">
              <h2 className="playlist-title">
                Playlist ({playlist.length} track{playlist.length !== 1 ? 's' : ''})
              </h2>
              <div className="playlist">
                {playlist.map((track, index) => (
                  <PlaylistItem
                    key={track.id}
                    track={track}
                    index={index + 1}
                    isActive={currentTrack?.id === track.id}
                    isPlaying={isPlaying && currentTrack?.id === track.id}
                    onSelect={() => handleTrackSelect(track)}
                    onRemove={() => handleTrackRemove(track.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {playlist.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎶</div>
              <h3 className="empty-title">No music uploaded yet</h3>
              <p className="empty-description">
                Upload your MP3 files to start listening to your favorite music
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2024 React MP3 Player. Built with React and HTML5 Audio API.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;