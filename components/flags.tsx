"use client";

import React from "react";

export function FlagAzerbaijan({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="Azərbaycan Bayrağı"
    >
      <rect width="60" height="13.33" fill="#0092bc" />
      <rect y="13.33" width="60" height="13.34" fill="#e4002b" />
      <rect y="26.67" width="60" height="13.33" fill="#009a44" />
      <circle cx="28" cy="20" r="5" fill="#ffffff" />
      <circle cx="29.3" cy="20" r="4.1" fill="#e4002b" />
      <g transform="translate(34, 20) scale(2.2)">
        <polygon
          points="0,-1 0.28,-0.28 1,0 0.28,0.28 0,1 -0.28,0.28 -1,0 -0.28,-0.28"
          fill="#ffffff"
        />
        <polygon
          points="0,-1 0.28,-0.28 1,0 0.28,0.28 0,1 -0.28,0.28 -1,0 -0.28,-0.28"
          fill="#ffffff"
          transform="rotate(45)"
        />
      </g>
    </svg>
  );
}

export function FlagUSA({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="ABŞ Bayrağı"
    >
      <rect width="60" height="40" fill="#b22234" />
      <rect y="3.08" width="60" height="3.08" fill="#ffffff" />
      <rect y="9.23" width="60" height="3.08" fill="#ffffff" />
      <rect y="15.38" width="60" height="3.08" fill="#ffffff" />
      <rect y="21.54" width="60" height="3.08" fill="#ffffff" />
      <rect y="27.69" width="60" height="3.08" fill="#ffffff" />
      <rect y="33.85" width="60" height="3.08" fill="#ffffff" />
      <rect width="26" height="21.54" fill="#3c3b6e" />
      <circle cx="5" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="11" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="17" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="23" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="8" cy="7.5" r="0.9" fill="#ffffff" />
      <circle cx="14" cy="7.5" r="0.9" fill="#ffffff" />
      <circle cx="20" cy="7.5" r="0.9" fill="#ffffff" />
      <circle cx="5" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="11" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="17" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="23" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="8" cy="14.5" r="0.9" fill="#ffffff" />
      <circle cx="14" cy="14.5" r="0.9" fill="#ffffff" />
      <circle cx="20" cy="14.5" r="0.9" fill="#ffffff" />
      <circle cx="5" cy="18" r="0.9" fill="#ffffff" />
      <circle cx="11" cy="18" r="0.9" fill="#ffffff" />
      <circle cx="17" cy="18" r="0.9" fill="#ffffff" />
      <circle cx="23" cy="18" r="0.9" fill="#ffffff" />
    </svg>
  );
}

export function FlagEU({ className = "w-5 h-3.5" }: { className?: string }) {
  const radius = 9;
  const cx = 30;
  const cy = 20;
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return {
      x: cx + radius * Math.sin(angle),
      y: cy - radius * Math.cos(angle),
    };
  });

  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="Avropa İttifaqı Bayrağı"
    >
      <rect width="60" height="40" fill="#003399" />
      {stars.map((pos, idx) => (
        <circle key={idx} cx={pos.x} cy={pos.y} r="1.15" fill="#ffcc00" />
      ))}
    </svg>
  );
}

export function FlagTurkey({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="Türkiyə Bayrağı"
    >
      {/* Red Field */}
      <rect width="60" height="40" fill="#e30a17" />
      {/* White Crescent Circle */}
      <circle cx="24" cy="20" r="10" fill="#ffffff" />
      {/* Inner Red Circle */}
      <circle cx="26.5" cy="20" r="8" fill="#e30a17" />
      {/* 5-pointed Star */}
      <g transform="translate(36, 20) rotate(-15)">
        <polygon
          points="0,-4.5 1.35,-1.35 4.5,-1.35 1.9,0.7 2.9,3.8 0,1.9 -2.9,3.8 -1.9,0.7 -4.5,-1.35 -1.35,-1.35"
          fill="#ffffff"
        />
      </g>
    </svg>
  );
}

export function FlagRussia({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="Rusiya Bayrağı"
    >
      <rect width="60" height="13.33" fill="#ffffff" />
      <rect y="13.33" width="60" height="13.34" fill="#0039a6" />
      <rect y="26.67" width="60" height="13.33" fill="#d52b1e" />
    </svg>
  );
}
