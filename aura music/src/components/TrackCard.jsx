import React from 'react';
import { Play, Pause, Clock, Plus, Check } from 'lucide-react';

const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const TrackCard = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  isInPlaylist = false,
  showPlaylistButton = true,
}) => {
  const albumImage = track.album.images[0]?.url || track.album.images[1]?.url;
  const hasPreview = !!track.preview_url;

  return (
    <div className={`group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-[1.02] overflow-hidden ${isCurrentTrack ? 'ring-2 ring-purple-400/60 bg-white/10 shadow-lg' : ''}`}>
      {/* Album Image Section */}
      <div className="relative aspect-square">
        {albumImage ? (
          <img
            src={albumImage}
            alt={`${track.album.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Clock className="h-12 w-12 text-white" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        {hasPreview && (
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-play-button-overlay backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80"
          >
            <div className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200">
              {isPlaying && isCurrentTrack ? (
                <Pause className="h-6 w-6 text-black" />
              ) : (
                <Play className="h-6 w-6 text-black ml-0.5" />
              )}
            </div>
          </button>
        )}

        {/* Playlist Button */}
        {showPlaylistButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isInPlaylist) {
                onRemoveFromPlaylist?.(track.id);
              } else {
                onAddToPlaylist?.(track);
              }
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${
              isInPlaylist
                ? 'bg-green-500/90 hover:bg-green-500 border border-green-400'
                : 'bg-purple-500/90 hover:bg-purple-500 border border-purple-400'
            }`}
            title={isInPlaylist ? 'Remove from playlist' : 'Add to playlist'}
          >
            {isInPlaylist ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <Plus className="h-4 w-4 text-white" />
            )}
          </button>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-white text-xs font-medium">
            {formatDuration(track.duration_ms)}
          </span>
        </div>

        {/* No Preview Badge */}
        {!hasPreview && (
          <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-white text-xs font-medium">No preview</span>
          </div>
        )}
      </div>

      {/* Track Info Section */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base truncate group-hover:text-purple-300 transition-colors duration-200 mb-1">
          {track.name}
        </h3>
        <p className="text-gray-400 text-sm truncate mb-2">
          {track.artists.map(artist => artist.name).join(', ')}
        </p>
        <p className="text-gray-500 text-xs truncate">
          {track.year}
        </p>
      </div>

      {/* Current Track Indicator */}
      {isCurrentTrack && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg"></div>
      )}
    </div>
  );
};