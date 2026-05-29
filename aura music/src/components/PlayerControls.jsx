import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerControls = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
}) => {
  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const albumImage = currentTrack.album.images[2]?.url || currentTrack.album.images[0]?.url;

  return (
    <div id="player-controls" className="fixed bottom-0 left-0 right-0 bg-playercontrols backdrop-blur-lg border-t border-white/10 p-2 sm:p-3 md:p-4 z-10">
      <div id="player-controls-inner" className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div id="player-progress" className="mb-2 sm:mb-3 md:mb-4">
          <div id="player-progress-labels" className="flex items-center justify-between text-xs text-gray-400 mb-1 sm:mb-1 md:mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-1 sm:h-1.5 md:h-2 bg-white/10 rounded-full cursor-pointer group">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `calc(${progress}% - 4px)` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-2 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-1 min-w-0">
            {albumImage && (
              <img
                src={albumImage}
                alt={`${currentTrack.album.name} cover`}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md sm:rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <h4 className="text-white font-medium truncate text-xs sm:text-sm md:text-base">
                {currentTrack.name}
              </h4>
              <p className="text-gray-400 text-xs sm:text-xs md:text-sm truncate">
                {currentTrack.artists.map(artist => artist.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-white/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
            </button>
            
            <button
              onClick={onTogglePlayPause}
              className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full bg-white text-black hover:scale-105 transition-transform duration-200"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ml-0.5 sm:ml-0.5 md:ml-1" />
              )}
            </button>
            
            <button
              onClick={onNext}
              disabled={!canGoNext}
              className="p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-white/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center space-x-2 flex-1 justify-end">
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              {volume > 0 ? (
                <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
              ) : (
                <VolumeX className="h-4 w-4 md:h-5 md:w-5 text-white" />
              )}
            </button>
            <div className="w-12 md:w-16 lg:w-20 xl:w-24 relative group">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};