import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX_RECENT = 6;
const MAX_ARTISTS = 6;
const MAX_TRACKS = 6;

export const useMusicHistory = () => {

  const [recentTracks, setRecentTracks] = useLocalStorage(
    'aura-recent-tracks',
    []
  );

  const [topArtists, setTopArtists] = useLocalStorage(
    'aura-top-artists',
    []
  );

  const [topTracks, setTopTracks] = useLocalStorage(
    'aura-top-tracks',
    []
  );

  // Track update count for aggressive trimming every 2 updates
  const [updateCount, setUpdateCount] = useLocalStorage(
    'aura-update-count',
    0
  );

  // -----------------------------
  // TRACK PLAY
  // -----------------------------

  const trackPlay = (track) => {
    if (!track?.id) return;

    // Increment update count
    const newCount = updateCount + 1;
    setUpdateCount(newCount);

    // =========================
    // RECENT TRACKS
    // =========================

    setRecentTracks((prev) => {

      const filtered = prev.filter(
        (item) => item.id !== track.id
      );

      let updated = [
        {
          ...track,
          playedAt: Date.now(),
        },
        ...filtered,
      ];

      // Every 2 updates, aggressively trim to keep only fresh items
      if (newCount % 2 === 0) {
        updated = updated
          .filter(item => Date.now() - item.playedAt < 24 * 60 * 60 * 1000) // Keep only last 24 hours
          .slice(0, MAX_RECENT);
      }

      return updated.slice(0, MAX_RECENT);
    });

    // =========================
    // TOP TRACKS
    // =========================

    setTopTracks((prev) => {

      const existing = prev.find(
        (item) => item.id === track.id
      );

      let updated;

      if (existing) {
        updated = prev.map((item) =>
          item.id === track.id
            ? {
                ...item,
                playCount: item.playCount + 1,
                lastPlayed: Date.now(),
              }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            ...track,
            playCount: 1,
            lastPlayed: Date.now(),
          },
        ];
      }

      // Sort and limit
      updated = updated
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, MAX_TRACKS);

      // Every 2 updates, clean old entries
      if (newCount % 2 === 0) {
        const WEEK = 7 * 24 * 60 * 60 * 1000;
        updated = updated.filter(
          (item) => Date.now() - item.lastPlayed < WEEK
        );
      }

      return updated;
    });

    // =========================
    // TOP ARTISTS
    // =========================

    const artist = track?.artists?.[0];

    if (artist?.name) {

      setTopArtists((prev) => {

        const existing = prev.find(
          (item) => item.name === artist.name
        );

        let updated;

        if (existing) {
          updated = prev.map((item) =>
            item.name === artist.name
              ? {
                  ...item,
                  count: item.count + 1,
                  lastPlayed: Date.now(),
                }
              : item
          );
        } else {
          updated = [
            ...prev,
            {
              name: artist.name,
              image:
                track?.album?.images?.[0]?.url || '',
              count: 1,
              lastPlayed: Date.now(),
            },
          ];
        }

        // Sort and limit
        updated = updated
          .sort((a, b) => b.count - a.count)
          .slice(0, MAX_ARTISTS);

        // Every 2 updates, clean old entries
        if (newCount % 2 === 0) {
          const WEEK = 7 * 24 * 60 * 60 * 1000;
          updated = updated.filter(
            (item) => Date.now() - item.lastPlayed < WEEK
          );
        }

        return updated;
      });
    }
  };

  // -----------------------------
  // CLEAN OLD DATA (initial load)
  // -----------------------------

  useEffect(() => {

    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const DAY = 24 * 60 * 60 * 1000;

    const cleanOld = (items) =>
      items.filter(
        (item) =>
          Date.now() - item.lastPlayed < WEEK
      );

    const cleanRecent = (items) =>
      items.filter(
        (item) =>
          Date.now() - item.playedAt < DAY
      );

    setTopTracks((prev) => cleanOld(prev).slice(0, MAX_TRACKS));
    setTopArtists((prev) => cleanOld(prev).slice(0, MAX_ARTISTS));
    setRecentTracks((prev) => cleanRecent(prev).slice(0, MAX_RECENT));

  }, []);

  return {
    recentTracks,
    topArtists,
    topTracks,
    trackPlay,
  };
};