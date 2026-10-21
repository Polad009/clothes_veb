"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY_MUTED = "horvvale_audio_muted";

interface AudioContextValue {
  startAudio: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextValue>({
  startAudio: () => {},
  toggleMute: () => {},
  isMuted: false,
  isPlaying: false,
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Read saved mute preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MUTED);
      if (saved !== null) {
        setIsMuted(saved === "true");
      }
    } catch {}
  }, []);

  // Sync mute state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  /**
   * Start audio on user click.
   * Requirement: Audio element created inside the click handler.
   * Fade in over 1.5s to volume ~0.4.
   */
  const startAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const audio = new Audio("/audio/intro.mp3");
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0;
        audio.muted = isMuted;

        audio.addEventListener("error", () => {
          console.info(
            "Horvvale: /audio/intro.mp3 not found or pending user upload. Ready for intro.mp3."
          );
        });

        audioRef.current = audio;
      }

      const audio = audioRef.current;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);

            // Fade volume from 0 to 0.4 over 1.5s (1500ms / 30 steps = 50ms interval)
            const targetVolume = 0.4;
            const duration = 1500;
            const intervalTime = 50;
            const step = targetVolume / (duration / intervalTime);

            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

            fadeIntervalRef.current = setInterval(() => {
              if (!audio) return;
              if (audio.volume + step >= targetVolume) {
                audio.volume = targetVolume;
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              } else {
                audio.volume = Math.min(targetVolume, audio.volume + step);
              }
            }, intervalTime);
          })
          .catch((err) => {
            console.warn("Horvvale audio play deferred by browser:", err);
          });
      }
    } catch (e) {
      console.warn("Audio initiation error:", e);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_MUTED, String(next));
      } catch {}

      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  return (
    <AudioContext.Provider value={{ startAudio, toggleMute, isMuted, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
