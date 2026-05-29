import React, { useEffect, useState } from 'react';

import {
    Play,
    Pause,
    Flame,
    Clock3,
    Disc3,
    Sparkles,
    ListMusic,
    Shuffle,
    TrendingUp,
    Music2,
} from 'lucide-react';

import { searchTracks } from '../services/auraMusicApi';

export const TrendingMusic = ({
    currentTrack,
    isPlaying,
    onTrackPlay,
    recentTracks = [],
    topArtists = [],
    topTracks = [],
}) => {

    const [loading, setLoading] = useState(true);
    const [trendingTracks, setTrendingTracks] = useState([]);
    const [alternativeTracks, setAlternativeTracks] = useState([]);

    // Fetch music data
    useEffect(() => {
        const fetchMusicData = async () => {
            setLoading(true);
            try {
                // Trending tracks
                const trendingResponse = await searchTracks('song');
                if (trendingResponse?.tracks?.items) {
                    setTrendingTracks(
                        trendingResponse.tracks.items.slice(0, 19)
                    );
                }

                // Alternative section - based on top artists' songs randomly rearranged
                const artistNames = topArtists
                    .slice(0, 6)
                    .map((artist) => artist.name);

                let mixedTracks = [];

                // Fetch songs from each artist
                for (const artistName of artistNames) {
                    try {
                        const response = await searchTracks(artistName);
                        if (response?.tracks?.items) {
                            const filtered = response.tracks.items.filter(
                                (track) =>
                                    !mixedTracks.some(
                                        (item) => item.id === track.id
                                    )
                            );
                            // Get more songs per artist for variety
                            const randomSongs = filtered
                                .sort(() => Math.random() - 0.5)
                                .slice(0, 5);
                            mixedTracks.push(...randomSongs);
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }

                // Randomly rearrange all collected songs
                mixedTracks = mixedTracks
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 15); // Minimum 10 songs

                setAlternativeTracks(mixedTracks);

            } catch (err) {
                console.error('Trending music fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMusicData();
    }, [topArtists]);

    // Display limited tracks
    const displayRecentTracks = recentTracks.slice(0, 6);
    const displayTopArtists = topArtists.slice(0, 6);

    // Play Button Component
    const PlayButton = ({ track, size = 'normal' }) => {
        const isCurrent = currentTrack?.id === track.id;
        const sizeClasses = size === 'large'
            ? 'h-14 w-14'
            : 'h-11 w-11';

        return (
            <button
                className={`absolute bottom-3 right-3 ${sizeClasses} rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-pink-500/40 hover:scale-110 hover:shadow-xl hover:shadow-pink-500/50`}
            >
                {isCurrent && isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
            </button>
        );
    };

    // Album Card Component
    const AlbumCard = ({ track, size = 'normal' }) => {
        const image = track?.album?.images?.[0]?.url;
        const isWide = size === 'wide';

        return (
            <div
                onClick={() => onTrackPlay(track, [track], 0)}
                className={`
                    group relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer border
                    backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]
                    border-white/10 hover:border-pink-500/40
                    bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-slate-800/80 hover:to-slate-900/80
                    ${isWide ? 'aspect-[21/9]' : 'aspect-square'}
                `}
            >
                <img
                    src={image}
                    alt={track.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                <PlayButton track={track} size={size} />

                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                    <p className="text-white font-bold text-xs md:text-sm line-clamp-1">{track.name}</p>
                    <p className="text-gray-300 text-[10px] md:text-xs mt-1 truncate">{track.artists?.[0]?.name}</p>
                </div>
            </div>
        );
    };

    // Large Featured Card
    const FeaturedCard = ({ track, index }) => {
        const image = track?.album?.images?.[0]?.url;
        const isCurrent = currentTrack?.id === track.id;

        return (
            <div
                onClick={() => onTrackPlay(track, trendingTracks, index)}
                className={`
                    group relative overflow-hidden rounded-3xl cursor-pointer
                    border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/30
                    backdrop-blur-2xl transition-all duration-500 hover:scale-[1.01]
                    hover:border-pink-500/30 aspect-[16/10]
                `}
            >
                <img
                    src={image}
                    alt={track.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-purple-900/40 to-transparent" />

                {/* Ambient glow */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-t from-pink-500/30 to-transparent rounded-full blur-[100px]" />

                {/* Rank Badge */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-xs text-white font-bold shadow-lg">
                    #{index + 1}
                </div>

                {/* Play Button */}
                <button className="absolute bottom-4 right-4 z-20 h-14 w-14 rounded-full bg-white text-black flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-110 hover:bg-pink-50">
                    {isCurrent && isPlaying ? (
                        <Pause className="h-6 w-6 fill-current" />
                    ) : (
                        <Play className="h-6 w-6 fill-current ml-1" />
                    )}
                </button>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
                    <p className="text-white font-black text-2xl md:text-3xl lg:text-4xl leading-tight line-clamp-2 drop-shadow-lg">
                        {track.name}
                    </p>
                    <p className="text-gray-200 mt-3 text-sm md:text-base font-medium">
                        {track.artists?.[0]?.name}
                    </p>
                </div>
            </div>
        );
    };

    // Artist Circle - Bigger like Spotify/JioSaavn
    const ArtistCircle = ({ artist, index }) => {
        return (
            <div
                key={index}
                className="flex flex-col items-center gap-3 group cursor-pointer min-w-[100px] md:min-w-[120px] flex-shrink-0"
            >
                <div className={`
                    relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden
                    border-[3px] border-white/20
                    shadow-xl shadow-black/40
                    group-hover:border-pink-500/60 group-hover:scale-105 group-hover:shadow-pink-500/20
                    transition-all duration-300
                    ring-2 ring-white/10
                `}>
                    <img
                        src={artist.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name) + '&background=random'}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="text-center">
                    <p className="text-white text-xs md:text-sm font-semibold truncate w-24 md:w-28">{artist.name}</p>
                    <p className="text-gray-400 text-[10px] md:text-xs mt-1">{artist.count} plays</p>
                </div>
            </div>
        );
    };

    // Horizontal Scroll Track
    const HorizontalTrack = ({ track, index }) => {
        const image = track?.album?.images?.[0]?.url;
        const isCurrent = currentTrack?.id === track.id;

        return (
            <div
                onClick={() => onTrackPlay(track, alternativeTracks, index)}
                className={`
                    group flex items-center gap-3 p-3 rounded-2xl md:rounded-xl
                    cursor-pointer transition-all duration-300 min-w-[280px] md:min-w-[320px]
                    bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10
                `}
            >
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                    <img
                        src={image}
                        alt={track.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`
                        absolute inset-0 bg-black/40 flex items-center justify-center
                        ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        transition-opacity
                    `}>
                        {isCurrent && isPlaying ? (
                            <Pause className="h-5 w-5 text-white fill-current" />
                        ) : (
                            <Play className="h-5 w-5 text-white fill-current ml-0.5" />
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-pink-400' : 'text-white'}`}>
                        {track.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{track.artists?.[0]?.name}</p>
                </div>
                <div className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${isCurrent && isPlaying ? 'bg-pink-500 animate-pulse' : 'bg-gray-500'}
                `} />
            </div>
        );
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
                    <p className="text-gray-400 text-sm">Loading your vibe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative space-y-12 pb-20">

            {/* Ambient Background Effects */}
            <div className="fixed top-20 left-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-[180px] pointer-events-none animate-pulse" />
            <div className="fixed bottom-40 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-indigo-500/15 via-blue-500/10 to-transparent rounded-full blur-[160px] pointer-events-none animate-pulse" />

            {/* Hero Section - Modern Glass Morphism */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/20 backdrop-blur-3xl p-8 md:p-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/30 to-purple-500/20 rounded-full blur-[150px]" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm text-pink-300 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4" />
                        Your Daily Mix
                    </div>

                    <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                        Discover
                        <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            Perfect Vibes
                        </span>
                    </h1>

                    <p className="mt-5 max-w-xl text-gray-300 text-base md:text-lg">
                        Fresh tracks curated based on your listening history and trending music around you.
                    </p>
                </div>
            </section>

            {/* Recently Played */}
            {displayRecentTracks.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10">
                            <Clock3 className="h-5 w-5 text-pink-400" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            Recently Played
                        </h2>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {displayRecentTracks.map((track, index) => (
                            <div key={track.id} className="min-w-[160px] md:min-w-[180px] snap-start">
                                <AlbumCard track={track} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Artists */}
            {displayTopArtists.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/10">
                            <Disc3 className="h-5 w-5 text-violet-400" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            Top Artists
                        </h2>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide px-1">
                        {displayTopArtists.map((artist, index) => (
                            <ArtistCircle
                                key={index}
                                artist={artist}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Alternative Songs - Based on your top artists */}
            {alternativeTracks.length >= 10 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10">
                                <Shuffle className="h-5 w-5 text-pink-400" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                Mix It Up
                            </h2>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-gray-300 text-sm backdrop-blur-sm">
                            <Music2 className="h-4 w-4" />
                            Based on your top artists
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {alternativeTracks.map((track, index) => (
                            <HorizontalTrack
                                key={`alt-${track.id}`}
                                track={track}
                                index={index}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Trending Now - Modern Bento Grid */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                            <Flame className="h-5 w-5 text-orange-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white">
                            Trending Now
                        </h2>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-gray-300 text-sm backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[180px] md:auto-rows-[220px]">
                    {trendingTracks.map((track, index) => {
                        const featured = index === 0;
                        const medium = index === 1 || index === 2;

                        return (
                            <div
                                key={track.id}
                                onClick={() => onTrackPlay(track, trendingTracks, index)}
                                className={`
                                    group relative overflow-hidden rounded-2xl cursor-pointer border
                                    bg-white/5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]
                                    border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5
                                    ${featured
                                        ? 'col-span-2 lg:col-span-6 row-span-2'
                                        : medium
                                            ? 'col-span-1 lg:col-span-3'
                                            : 'col-span-1 lg:col-span-3'}
                                `}
                            >
                                <img
                                    src={track?.album?.images?.[0]?.url}
                                    alt={track.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                                {/* Glow */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-t from-orange-500/40 to-transparent blur-[80px]" />

                                {/* Rank Badge */}
                                <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-xs text-white font-bold">
                                    #{index + 1}
                                </div>

                                {/* Play Button */}
                                <button className="absolute bottom-4 right-4 z-20 h-14 w-14 rounded-full bg-white text-black flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-110">
                                    {currentTrack?.id === track.id && isPlaying ? (
                                        <Pause className="h-6 w-6 fill-current" />
                                    ) : (
                                        <Play className="h-6 w-6 fill-current ml-1" />
                                    )}
                                </button>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-6">
                                    <p className={`
                                        text-white font-black leading-tight line-clamp-2
                                        ${featured ? 'text-2xl md:text-4xl' : 'text-base md:text-xl'}
                                    `}>
                                        {track.name}
                                    </p>
                                    <p className="text-gray-300 mt-2 text-sm md:text-base truncate">
                                        {track.artists?.[0]?.name}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

        </div>
    );
};