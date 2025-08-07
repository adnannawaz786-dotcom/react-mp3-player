import React from 'react';
import PropTypes from 'prop-types';

const PlaylistItem = ({ 
  track, 
  isActive, 
  isPlaying, 
  onSelect, 
  onRemove, 
  index 
}) => {
  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return '--:--';
    
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '--';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(track, index);
    }
  };

  const handleRemoveKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onRemove(index);
    }
  };

  return (
    <div 
      className={`playlist-item ${isActive ? 'active' : ''} ${isPlaying && isActive ? 'playing' : ''}`}
      onClick={() => onSelect(track, index)}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Play ${track.name || 'Unknown track'}`}
    >
      <div className="playlist-item-content">
        <div className="track-number">
          {isActive && isPlaying ? (
            <div className="playing-indicator">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          ) : (
            <span className="track-index">{index + 1}</span>
          )}
        </div>
        
        <div className="track-info">
          <div className="track-name" title={track.name || 'Unknown track'}>
            {track.name ? track.name.replace(/\.[^/.]+$/, '') : 'Unknown track'}
          </div>
          <div className="track-details">
            <span className="track-duration">{formatDuration(track.duration)}</span>
            <span className="track-size">{formatFileSize(track.size)}</span>
          </div>
        </div>
        
        <button
          className="remove-button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          onKeyPress={handleRemoveKeyPress}
          aria-label={`Remove ${track.name || 'track'} from playlist`}
          title="Remove from playlist"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M18 6L6 18M6 6L18 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      <style jsx>{`
        .playlist-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .playlist-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .playlist-item:focus {
          outline: none;
          border-color: #4a9eff;
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.3);
        }
        
        .playlist-item.active {
          background: rgba(74, 158, 255, 0.15);
          border-color: rgba(74, 158, 255, 0.4);
        }
        
        .playlist-item.active.playing {
          background: rgba(74, 158, 255, 0.2);
          border-color: rgba(74, 158, 255, 0.6);
        }
        
        .playlist-item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        
        .track-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .track-index {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          font-weight: 500;
        }
        
        .playing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          height: 16px;
        }
        
        .wave-bar {
          width: 3px;
          height: 100%;
          background: #4a9eff;
          border-radius: 2px;
          animation: wave 1.5s ease-in-out infinite;
        }
        
        .wave-bar:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .wave-bar:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        
        .track-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .track-name {
          color: white;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        
        .track-details {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .remove-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0;
          transform: scale(0.8);
          flex-shrink: 0;
        }
        
        .playlist-item:hover .remove-button {
          opacity: 1;
          transform: scale(1);
        }
        
        .remove-button:hover {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
        }
        
        .remove-button:focus {
          outline: none;
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
          opacity: 1;
          transform: scale(1);
        }
        
        @media (max-width: 768px) {
          .playlist-item {
            padding: 10px 12px;
          }
          
          .playlist-item-content {
            gap: 10px;
          }
          
          .track-number {
            width: 28px;
            height: 28px;
          }
          
          .track-name {
            font-size: 13px;
          }
          
          .track-details {
            font-size: 11px;
            gap: 8px;
          }
          
          .remove-button {
            opacity: 1;
            transform: scale(1);
            padding: 6px;
          }
        }
        
        @media (max-width: 480px) {
          .track-details {
            flex-direction: column;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
};

PlaylistItem.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string,
    duration: PropTypes.number,
    size: PropTypes.number,
    url: PropTypes.string,
    file: PropTypes.object
  }).isRequired,
  isActive: PropTypes.bool,
  isPlaying: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired
};

PlaylistItem.defaultProps = {
  isActive: false,
  isPlaying: false
};

export default PlaylistItem;