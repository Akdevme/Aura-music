import { useState, useRef, useCallback, useEffect } from "react";

export const usePlayer = () => {
  const audioRef = useRef(null);

  // (kept but no longer critical)
  const lockedDurationRef = useRef(null);

  const [playerState, setPlayerState] = useState({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    queue: [],
    currentIndex: -1,
  });

  const playTrack = useCallback(
    (track, queue = [], index = 0) => {
      if (!track.preview_url) {
        console.warn("No preview available for this track");
        return;
      }

      if (audioRef.current) {
        lockedDurationRef.current = null;

        audioRef.current.src = track.preview_url;
        audioRef.current.volume = playerState.volume;

        audioRef.current
          .play()
          .then(() => {
            setPlayerState((prev) => ({
              ...prev,
              currentTrack: track,
              queue: queue.length > 0 ? queue : [track],
              currentIndex: index,
              isPlaying: true,
            }));
          })
          .catch((err) => console.error("Autoplay blocked:", err));
      }
    },
    [playerState.volume],
  );

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !playerState.currentTrack) return;

    if (playerState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [playerState.isPlaying, playerState.currentTrack]);

  const setVolume = useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setPlayerState((prev) => ({ ...prev, volume: clampedVolume }));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const seekTo = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
    }
  }, []);

  const nextTrack = useCallback(() => {
    const { queue, currentIndex } = playerState;
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      playTrack(queue[nextIndex], queue, nextIndex);
    } else {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [playerState, playTrack]);

  const previousTrack = useCallback(() => {
    const { queue, currentIndex } = playerState;
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      playTrack(queue[prevIndex], queue, prevIndex);
    }
  }, [playerState, playTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      let duration = audio.duration;

      if (Number.isFinite(duration) && duration > 0) {
        lockedDurationRef.current = duration;
      }

      const finalDuration = lockedDurationRef.current || 0;

      setPlayerState((prev) => ({ ...prev, duration: finalDuration }));
    };

    const handleTimeUpdate = () => {
      setPlayerState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handlePlay = () => {
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      const { queue, currentIndex } = playerState;
      if (currentIndex < queue.length - 1) {
        nextTrack();
      } else {
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nextTrack, playerState.queue, playerState.currentIndex]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;

    const { currentTrack, isPlaying, currentIndex } = playerState;
    const mediaSession = navigator.mediaSession;

    if (!currentTrack) {
      mediaSession.metadata = null;
      mediaSession.playbackState = "none";
      return;
    }

    const artworkUrl =
      currentTrack.album?.images?.[2]?.url ||
      currentTrack.album?.images?.[1]?.url ||
      currentTrack.album?.images?.[0]?.url ||
      "";

    // ✅ ONLY metadata (no position control)
    mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name || "Unknown Track",
      artist:
        currentTrack.artists?.map((artist) => artist.name).join(", ") ||
        "Unknown Artist",
      album: currentTrack.album?.name || "AURATUNE",
      artwork: artworkUrl
        ? [
            { src: artworkUrl, sizes: "96x96", type: "image/jpeg" },
            { src: artworkUrl, sizes: "128x128", type: "image/jpeg" },
            { src: artworkUrl, sizes: "192x192", type: "image/jpeg" },
            { src: artworkUrl, sizes: "256x256", type: "image/jpeg" },
            { src: artworkUrl, sizes: "384x384", type: "image/jpeg" },
            { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
          ]
        : [],
    });

    mediaSession.playbackState = isPlaying ? "playing" : "paused";

    const actionHandlers = [
      ["play", () => audioRef.current?.play().catch(console.error)],
      ["pause", () => audioRef.current?.pause()],
      ["previoustrack", currentIndex > 0 ? previousTrack : null],
      [
        "nexttrack",
        currentIndex < playerState.queue.length - 1 ? nextTrack : null,
      ],
      [
        "seekbackward",
        () => seekTo(Math.max(0, (audioRef.current?.currentTime || 0) - 10)),
      ],
      [
        "seekforward",
        () =>
          seekTo(
            (audioRef.current?.currentTime || 0) + 10
          ),
      ],
      [
        "seekto",
        (details) => {
          if (details.seekTime != null) seekTo(details.seekTime);
        },
      ],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`Media Session action not supported: ${action}`, error);
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          mediaSession.setActionHandler(action, null);
        } catch (error) {
          console.warn(`Unable to clear media action: ${action}`, error);
        }
      });
    };
  }, [
    playerState.currentTrack,
    playerState.isPlaying,
    playerState.currentIndex,
    nextTrack,
    previousTrack,
    seekTo,
  ]);

  return {
    audioRef,
    playerState,
    playTrack,
    togglePlayPause,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
  };
};