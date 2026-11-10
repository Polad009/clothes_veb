import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-ink">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-bone" aria-label="Yüklənir" />
    </div>
  );
}
