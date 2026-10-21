"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Ambient intro audio hook for Horvvalle.
 * Plays /audio/intro.mp3 at volume 0.35 on mount.
 * If browser policy blocks autoplay, rejects silently without prompt.
 * Fades out volume gracefully before wipe completion.
 */
export function useIntroAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAudio = useCallback(() => {
    // Disabled until audio asset is provided, preventing 404 network stalls
    return;
  }, []);

  const fadeOutAudio = useCallback((durationMs = 800) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const steps = 16;
    const intervalTime = Math.max(20, Math.floor(durationMs / steps));
    const volumeStep = audio.volume / steps;

    fadeIntervalRef.current = setInterval(() => {
      if (!audio) return;
      if (audio.volume <= volumeStep) {
        audio.volume = 0;
        audio.pause();
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = Math.max(0, audio.volume - volumeStep);
      }
    }, intervalTime);
  }, []);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current = null;
        } catch {}
      }
    };
  }, []);

  return {
    startAudio,
    fadeOutAudio,
  };
}
