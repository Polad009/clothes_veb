"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export function AudioToggle() {
  const { toggleMute, isMuted, isPlaying } = useAudio();

  // Only render once audio has been started or can be toggled
  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Səsi aç" : "Səsi bağla"}
        title={isMuted ? "Səsi aç" : "Səsi bağla"}
        className="group relative flex items-center gap-2 px-3 py-2 rounded-full border border-[#B08D57]/40 bg-[#14100F]/90 backdrop-blur-md text-[#EDE3D0] hover:border-[#B08D57] hover:text-[#B08D57] transition-all duration-300 shadow-lg active:scale-95"
      >
        {isMuted ? (
          <VolumeX size={14} className="text-[#B08D57]/70 group-hover:text-[#B08D57] transition-colors" />
        ) : (
          <Volume2 size={14} className="text-[#B08D57] group-hover:scale-105 transition-transform" />
        )}
        <span className="text-[10px] tracking-[0.2em] uppercase font-light hidden sm:inline text-[#EDE3D0]/70 group-hover:text-[#EDE3D0] transition-colors">
          {isMuted ? "Səssiz" : "Musiqi"}
        </span>
      </button>
    </div>
  );
}
