import React from "react";

export default function CollectionsLoading() {
  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title skeleton */}
      <div className="space-y-3 mb-8">
        <div className="h-4 w-32 bg-stone-200/80 rounded-full animate-pulse" />
        <div className="h-8 w-64 bg-stone-300/70 rounded-xl animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-28 bg-stone-200/80 rounded-full shrink-0 animate-pulse" />
        ))}
      </div>

      {/* Grid of product card skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-2xl border border-stone-200/80 bg-white p-4 space-y-3 animate-pulse">
            <div className="aspect-[3/4] w-full bg-stone-100 rounded-xl" />
            <div className="h-4 w-3/4 bg-stone-200 rounded" />
            <div className="h-4 w-1/3 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
