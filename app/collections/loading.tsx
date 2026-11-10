import React from "react";

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen w-full bg-ink">
      <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        <div className="h-3 w-40 animate-pulse bg-ink-700" />
        <div className="mt-6 h-14 w-80 max-w-full animate-pulse bg-ink-700 sm:h-20" />
        <div className="mt-8 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-28 shrink-0 animate-pulse bg-ink-800" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i}>
              <div className="aspect-[4/5] animate-pulse bg-ink-800" />
              <div className="mt-3 h-3 w-3/4 animate-pulse bg-ink-700" />
              <div className="mt-2 h-3 w-1/3 animate-pulse bg-ink-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
