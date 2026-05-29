import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TrackCard } from './TrackCard';
import { Trash2, Hash, Plus, Edit3, Check, ArrowLeft, X, Database, Download, Upload, MoreVertical } from 'lucide-react';
import { createArtnFile, parseArtnFile } from '../services/artnService';

export const PlaylistPage = ({
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onCreatePlaylist,
  onUpdatePlaylistMeta,
  onDeletePlaylist,
  onImportPlaylists,
  playlist,
  currentTrack,
  isPlaying,
  onTrackPlay,
  onRemoveFromPlaylist,
  onReorderPlaylist,
}) => {
  const [draggedTrackId, setDraggedTrackId] = useState(null);
  const [isViewingPlaylist, setIsViewingPlaylist] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalPlaylist, setEditModalPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);
  const STORAGE_LIMIT = 5 * 1024 * 1024; // 5 MB

  const handleEditPlaylist = (playlistToEdit) => {
    setEditModalPlaylist(playlistToEdit);
    setEditName(playlistToEdit.name || '');
    setShowEditModal(true);
  };

  const handleSavePlaylistEdit = () => {
    if (!editModalPlaylist) return;
    onUpdatePlaylistMeta(editModalPlaylist.id, {
      name: editName.trim() || editModalPlaylist.name,
      image: editImage.trim(),
    });
    setShowEditModal(false);
    setEditModalPlaylist(null);
  };

  const handleBackToLibrary = () => {
    setIsViewingPlaylist(false);
  };

  const handleSelectPlaylistView = (playlistId) => {
    onSelectPlaylist(playlistId);
    setIsViewingPlaylist(true);
  };

  const getLocalStorageBytes = () => {
    if (typeof window === 'undefined') return 0;
    let bytes = 0;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      const value = window.localStorage.getItem(key);
      if (key && value != null) {
        bytes += key.length + value.length;
      }
    }
    return bytes;
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const storagePercent = Math.min(100, Math.max(0, Math.round((storageUsed / STORAGE_LIMIT) * 100)));
  const storageAvailable = Math.max(0, STORAGE_LIMIT - storageUsed);

  useEffect(() => {
    setStorageUsed(getLocalStorageBytes());
  }, [playlists]);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (actionsOpen && actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [actionsOpen]);

  const coverImages = useMemo(() => {
    if (!playlist?.tracks?.length) return [];
    return playlist.tracks.slice(0, 4).map((track) => track.album.images[0]?.url || track.album.images[1]?.url).filter(Boolean);
  }, [playlist]);

  const handleMetaSave = () => {
    if (!playlist) return;
    onUpdatePlaylistMeta(playlist.id, {
      name: editName.trim() || playlist.name,
      image: editImage.trim(),
    });
  };

  const handleDragStart = (e, trackId) => {
    setDraggedTrackId(trackId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!draggedTrackId) return;

    const draggedIndex = playlist.tracks.findIndex((track) => track.id === draggedTrackId);
    if (draggedIndex === dropIndex) {
      setDraggedTrackId(null);
      return;
    }

    const newTracks = [...playlist.tracks];
    const [movedTrack] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(dropIndex, 0, movedTrack);
    onReorderPlaylist(newTracks);
    setDraggedTrackId(null);
  };

  const handleDragEnd = () => {
    setDraggedTrackId(null);
  };
  
  const handleExportPlaylists = () => {
    const blob = createArtnFile(playlists);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'aura-playlists.artn';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const handleImportClick = () => {
    setImportError('');
    fileInputRef.current?.click();
  };
  
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const importedPlaylists = await parseArtnFile(file);
      if (!Array.isArray(importedPlaylists) || importedPlaylists.length === 0) {
        throw new Error('No playlist data found.');
      }
      onImportPlaylists(importedPlaylists);
    } catch (error) {
      console.error('Import failed:', error);
      setImportError('Unable to read this .artn file.');
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Your library</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Playlists</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">Store Songs in up to 5 Aura Playlists.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreatePlaylist}
            className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-xl transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Playlist
          </button>

          <div id="playlist-actions" className="relative" ref={actionsRef}>
            <button
              id="playlist-actions-toggle"
              onClick={() => setActionsOpen((s) => !s)}
              aria-expanded={actionsOpen}
              className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-900/80"
            >
              <MoreVertical className="h-5 w-5 text-gray-200" />
              <span className="hidden sm:inline">Actions</span>
            </button>

            {actionsOpen && (
              <div className="absolute right-0 mt-2 w-44 sm:w-56 rounded-lg bg-slate-950/95 border border-white/10 p-2 shadow-xl z-40">
                <button id="export-playlists-button" onClick={() => { handleExportPlaylists(); setActionsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white">
                  <Download className="h-4 w-4 text-teal-300" /> Export
                </button>
                <button id="import-playlists-button" onClick={() => { handleImportClick(); setActionsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white">
                  <Upload className="h-4 w-4 text-amber-300" /> Import
                </button>
                <button id="storage-button" onClick={() => { setShowStorageModal(true); setActionsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white">
                  <Database className="h-4 w-4 text-cyan-300" /> Storage
                </button>
              </div>
            )}
          </div>
        </div>
        <input
          type="file"
          accept=".artn"
          ref={fileInputRef}
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {playlists.map((item) => (
          <div key={item.id} className="group relative">
            <button
              type="button"
              onClick={() => handleSelectPlaylistView(item.id)}
              className={`w-full text-left overflow-hidden rounded-3xl border p-4 transition duration-300 ${
                item.id === activePlaylistId ? 'border-purple-400/60 bg-white/10 shadow-2xl' : 'border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10'
              }`}
            >
              <div className={`relative h-40 rounded-3xl bg-gradient-to-br ${item.color}`}> 
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover opacity-80" />
                ) : (
                  <div className="grid h-full grid-cols-2 gap-1 p-2">
                    {item.tracks.slice(0, 4).map((trackImage, i) => (
                      <div
                        key={i}
                        className="overflow-hidden rounded-2xl bg-slate-800"
                        style={{ backgroundImage: `url(${trackImage.album?.images[0]?.url || trackImage.album?.images[1]?.url})`, backgroundSize: 'cover' }}
                      />
                    ))}
                    {item.tracks.length === 0 && (
                      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-black/40 text-white text-xs uppercase tracking-[0.2em]">
                        Empty
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Playlist</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight">{item.name}</h2>
                  <p className="mt-3 text-xs text-gray-200">{item.tracks.length} {item.tracks.length === 1 ? 'track' : 'tracks'}</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleEditPlaylist(item)}
              className="absolute top-4 right-4 p-2 bg-purple-500/80 hover:bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
              title="Edit playlist"
            >
              <Edit3 className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
      </div>

      {!isViewingPlaylist ? null : (
        // Single playlist view
        <div className="space-y-6">
          
          <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/30 p-4">
            <div>
              <p className="text-sm text-purple-300">Playing from</p>
              <p className="text-xl font-semibold text-white">{playlist?.name}</p>
              <p className="text-sm text-gray-400 mt-1">{playlist?.tracks?.length || 0} tracks</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Hash className="h-4 w-4 text-purple-400" />
              Drag cards to reorder
            </div>
          </div>
        </div>
      )}

      {isViewingPlaylist && playlist?.tracks?.length ? (
        <div id="playlist-track-queue" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              draggable
              onDragStart={(e) => handleDragStart(e, track.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group cursor-move transition-opacity ${
                draggedTrackId === track.id ? 'opacity-50' : ''
              }`}
            >
              <div className="absolute top-3 left-3 z-10 w-10 h-10 bg-black/70 border-2 border-white/20 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg backdrop-blur-sm">
                {index + 1}
              </div>

              <button
                onClick={() => onRemoveFromPlaylist(track.id)}
                className="absolute top-3 right-3 z-10 p-2 bg-red-500/90 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
                title="Remove from playlist"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>

              <TrackCard
                track={track}
                isPlaying={isPlaying}
                isCurrentTrack={currentTrack?.id === track.id}
                onPlay={() => onTrackPlay(track, playlist.tracks, index)}
                showPlaylistButton={false}
              />
            </div>
          ))}
        </div>
      ) : isViewingPlaylist && !playlist?.tracks?.length ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
          This playlist is empty. Add songs from search to get started!
        </div>
      ) : null}

      {/* Storage Modal */}
      {showStorageModal && (
        <div id="storage-modal" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
            <button
              onClick={() => setShowStorageModal(false)}
              className="absolute top-4 right-4 rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/20">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Storage monitor</p>
                <h2 className="text-3xl font-semibold text-white">Local storage usage</h2>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Used</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{formatBytes(storageUsed)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Left</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{formatBytes(storageAvailable)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Total</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{formatBytes(STORAGE_LIMIT)}</p>
                </div>
              </div>

              <div className="mt-8 rounded-full bg-white/10 p-1">
                <div className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${storagePercent}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-gray-400">
                <span>{storagePercent}% used</span>
                <span>{formatBytes(storageAvailable)} remaining</span>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/70 p-5 text-white">
              <p className="text-sm text-gray-300">This storage modal is tied to the same playlist data stored in localStorage. As you add tracks, the used amount rises; deleting tracks lowers it again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && editModalPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-6 shadow-2xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-semibold text-white">Edit Playlist</h2>
            <p className="mt-2 text-sm text-gray-400">Update your playlist details</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL (optional)</label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              {editImage && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 overflow-hidden">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <img src={editImage} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSavePlaylistEdit}
                className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  onDeletePlaylist(editModalPlaylist.id);
                  setShowEditModal(false);
                }}
                className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};