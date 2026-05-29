import React, { useCallback, useMemo, useState } from 'react';
import { Music } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { SearchBar } from './components/SearchBar';
import { TrackList } from './components/TrackList';
import { PlaylistPage } from './components/PlaylistPage';
import { PlayerControls } from './components/PlayerControls';
import { Footer } from './components/Footer';
import { AboutUs } from './components/AboutUs';
import { TrendingMusic } from './components/TrendingMusic';
import { InstallPrompt } from './components/InstallPrompt';
import { usePlayer } from './hooks/usePlayer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { searchTracks } from './services/auraMusicApi';
import { useMusicHistory } from './hooks/useMusicHistory';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useLocalStorage('auramusic-playlists', [
    {
      id: 'default',
      name: 'Aura Vibes',
      color: 'from-purple-500/20 via-pink-500/20 to-blue-500/20',
      image: '',
      tracks: [],
    },
  ]);
  const [activePlaylistId, setActivePlaylistId] = useState('default');
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistImage, setNewPlaylistImage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [listenHistory, setListenHistory] = useLocalStorage('auramusic-listen-history', []);

  const {
    audioRef,
    playerState,
    playTrack,
    togglePlayPause,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
  } = usePlayer();

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setTracks([]);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchQuery(query);

    try {
      const response = await searchTracks(query);
      setTracks(response.tracks.items);
    } catch (err) {
      setError('Failed to search tracks. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const activePlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === activePlaylistId) || playlists[0],
    [playlists, activePlaylistId]
  );

  const updatePlaylist = useCallback(
    (playlistId, updater) => {
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId ? updater(playlist) : playlist
        )
      );
    },
    [setPlaylists]
  );

  // Track listen history when a track plays
  const trackPlayback = useCallback((track) => {
    if (!track || !track.id) return;
    setListenHistory((prev) => {
      const updated = [...prev];
      const existing = updated.findIndex((item) => item.id === track.id);
      if (existing >= 0) {
        updated[existing].count += 1;
      } else {
        updated.push({ ...track, count: 1 });
      }
      return updated.sort((a, b) => b.count - a.count);
    });
  }, [setListenHistory]);

  const handleTrackPlay = useCallback(
    (track, trackList, index) => {
      if (playerState.currentTrack?.id === track.id) {
        togglePlayPause();
      } else {
        trackPlay(track);
        playTrack(track, trackList, index);
      }
    },
    [playerState.currentTrack, togglePlayPause, playTrack, trackPlayback]
  );

  const handleAddToPlaylist = useCallback(
    (track) => {
      if (playlists.length === 1) {
        updatePlaylist(playlists[0].id, (playlist) => {
          if (playlist.tracks.some((playlistTrack) => playlistTrack.id === track.id)) {
            return playlist;
          }
          return { ...playlist, tracks: [...playlist.tracks, track] };
        });
        return;
      }
      setPlaylistModalTrack(track);
      setShowPlaylistModal(true);
    },
    [playlists, updatePlaylist]
  );

  const handleSelectPlaylist = useCallback(
    (playlistId) => {
      if (!playlistModalTrack) return;
      updatePlaylist(playlistId, (playlist) => {
        if (playlist.tracks.some((playlistTrack) => playlistTrack.id === playlistModalTrack.id)) {
          return playlist;
        }
        return { ...playlist, tracks: [...playlist.tracks, playlistModalTrack] };
      });
      setPlaylistModalTrack(null);
      setShowPlaylistModal(false);
    },
    [playlistModalTrack, updatePlaylist]
  );

  const handleRemoveFromPlaylist = useCallback(
    (trackId) => {
      updatePlaylist(activePlaylist.id, (playlist) => ({
        ...playlist,
        tracks: playlist.tracks.filter((track) => track.id !== trackId),
      }));
    },
    [activePlaylist.id, updatePlaylist]
  );

  const handleReorderPlaylist = useCallback(
    (newTracks) => {
      updatePlaylist(activePlaylist.id, (playlist) => ({
        ...playlist,
        tracks: newTracks,
      }));
    },
    [activePlaylist.id, updatePlaylist]
  );

  const handleCreatePlaylist = useCallback(() => {
    if (playlists.length >= 5) return;
    const nextId = `playlist-${Date.now()}`;
    const colorOptions = [
      'from-purple-500/20 via-pink-500/20 to-blue-500/20',
      'from-sky-500/20 via-cyan-500/20 to-blue-500/20',
      'from-fuchsia-500/20 via-violet-500/20 to-indigo-500/20',
      'from-emerald-500/20 via-lime-500/20 to-teal-500/20',
      'from-rose-500/20 via-orange-500/20 to-yellow-500/20',
    ];
    const color = colorOptions[playlists.length % colorOptions.length];
    setPlaylists((prev) => [
      ...prev,
      {
        id: nextId,
        name: newPlaylistName.trim() || `Playlist ${prev.length + 1}`,
        color,
        image: newPlaylistImage.trim(),
        tracks: [],
      },
    ]);
    setActivePlaylistId(nextId);
    setNewPlaylistName('');
    setNewPlaylistImage('');
    setShowCreateModal(false);
  }, [newPlaylistImage, newPlaylistName, playlists.length, setPlaylists]);

  const handleUpdatePlaylistMeta = useCallback(
    (playlistId, updates) => {
      updatePlaylist(playlistId, (playlist) => ({ ...playlist, ...updates }));
    },
    [updatePlaylist]
  );

  const handleDeletePlaylist = useCallback(
    (playlistId) => {
      setPlaylists((prev) => {
        const next = prev.filter((playlist) => playlist.id !== playlistId);
        if (next.length === 0) {
          return [
            {
              id: 'default',
              name: 'Aura Vibes',
              color: 'from-purple-500/20 via-pink-500/20 to-blue-500/20',
              image: '',
              tracks: [],
            },
          ];
        }
        if (activePlaylistId === playlistId) {
          setActivePlaylistId(next[0].id);
        }
        return next;
      });
    },
    [activePlaylistId, setPlaylists]
  );

  const handleImportPlaylists = useCallback(
    (importedPlaylists) => {
      setPlaylists(importedPlaylists);
      if (importedPlaylists.length > 0) {
        setActivePlaylistId(importedPlaylists[0].id);
      }
    },
    [setPlaylists]
  );

  // Get most-listened track
  const {
    recentTracks,
    topArtists,
    topTracks,
    trackPlay,
  } = useMusicHistory();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)]"></div>
      </div>

      <div className="relative z-10 flex-1">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 lg:pt-8">
          <InstallPrompt />
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>

        {currentPage === 'home' && (
          <div className="mb-4 px-3 sm:mb-6 sm:px-4 md:mb-8 md:px-6 lg:mb-10 lg:px-8">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>
        )}

        {error && (
          <div className="mb-4 px-3 sm:mb-6 sm:px-4 md:mb-8 md:px-6 lg:px-8">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400 shadow-xl backdrop-blur-md sm:rounded-xl sm:p-4 sm:text-sm lg:rounded-2xl md:p-6 md:text-base">
              {error}
            </div>
          </div>
        )}

        <main className="px-3 pb-28 sm:px-4 sm:pb-32 md:px-6 md:pb-36 lg:px-8 lg:pb-40">
          {currentPage === 'home' && !searchQuery && tracks.length === 0 && (
            <div className="mx-auto max-w-6xl">
              <TrendingMusic
                currentTrack={playerState.currentTrack}
                isPlaying={playerState.isPlaying}
                onTrackPlay={handleTrackPlay}
                onAddToPlaylist={handleAddToPlaylist}
                recentTracks={recentTracks}
                topArtists={topArtists}
                topTracks={topTracks}
              />
            </div>
          )}

          {currentPage === 'home' && (tracks.length > 0 || isSearching) && (
            <div className="mx-auto max-w-5xl">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-24">
                  <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-purple-400 border-t-transparent shadow-xl sm:mb-4 sm:h-12 sm:w-12 md:mb-6 md:h-14 md:w-14 md:border-4 lg:h-16 lg:w-16"></div>
                  <p className="px-3 text-center text-sm font-medium text-gray-400 sm:px-4 sm:text-base md:text-lg lg:text-xl">
                    Searching for "{searchQuery}"...
                  </p>
                </div>
              ) : (
                <TrackList
                  tracks={tracks}
                  currentTrack={playerState.currentTrack}
                  isPlaying={playerState.isPlaying}
                  onTrackPlay={handleTrackPlay}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlist={activePlaylist?.tracks || []}
                />
              )}
            </div>
          )}

          {currentPage === 'playlist' && (
            <PlaylistPage
              playlists={playlists}
              activePlaylistId={activePlaylistId}
              onSelectPlaylist={setActivePlaylistId}
              onCreatePlaylist={() => setShowCreateModal(true)}
              onUpdatePlaylistMeta={handleUpdatePlaylistMeta}
              onDeletePlaylist={handleDeletePlaylist}
              onImportPlaylists={handleImportPlaylists}
              playlist={activePlaylist}
              currentTrack={playerState.currentTrack}
              isPlaying={playerState.isPlaying}
              onTrackPlay={handleTrackPlay}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              onReorderPlaylist={handleReorderPlaylist}
            />
          )}

          {currentPage === 'about' && <AboutUs />}
        </main>

        <PlayerControls
          currentTrack={playerState.currentTrack}
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          volume={playerState.volume}
          onTogglePlayPause={togglePlayPause}
          onSeek={seekTo}
          onVolumeChange={setVolume}
          onNext={nextTrack}
          onPrevious={previousTrack}
          canGoNext={playerState.currentIndex < playerState.queue.length - 1}
          canGoPrevious={playerState.currentIndex > 0}
        />

        <audio ref={audioRef} preload="metadata" />

        {showPlaylistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
            <div className="w-full max-w-xl rounded-3xl bg-slate-950/95 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Add to Playlist</h2>
                  <p className="text-sm text-gray-400">Choose where your track should be saved.</p>
                </div>
                <button
                  onClick={() => {
                    setShowPlaylistModal(false);
                    setPlaylistModalTrack(null);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {playlists.map((playlistItem) => (
                  <button
                    key={playlistItem.id}
                    onClick={() => handleSelectPlaylist(playlistItem.id)}
                    className="group rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-purple-400/60 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-blue-500/10"
                  >
                    <div className={`h-32 rounded-3xl overflow-hidden bg-gradient-to-br ${playlistItem.color}`}>
                      <div className="h-full w-full bg-black/20 flex items-end p-3 text-white text-xs font-semibold">
                        {playlistItem.name}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-300">
                      {playlistItem.tracks.length} tracks • {playlistItem.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-slate-950/95 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
                  <p className="text-sm text-gray-400">Make up to 5 playlists for your Aura collection.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Playlist name</label>
                <input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Aura Chill"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-purple-400/70 focus:ring-4 focus:ring-purple-400/10"
                />
                <label className="block text-sm font-medium text-gray-300">Cover image URL</label>
                <input
                  value={newPlaylistImage}
                  onChange={(e) => setNewPlaylistImage(e.target.value)}
                  placeholder="Optional image URL"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-purple-400/70 focus:ring-4 focus:ring-purple-400/10"
                />
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlaylist}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:brightness-110"
                  >
                    Create Playlist
                  </button>
                </div>
                {playlists.length >= 5 && (
                  <p className="text-sm text-rose-400">Maximum of 5 playlists reached.</p>
                )}
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;
