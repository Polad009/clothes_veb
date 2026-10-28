import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
        {/* Left gallery skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full bg-stone-200/70 rounded-3xl animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-24 bg-stone-200/70 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right options skeleton */}
        <div className="lg:col-span-5 space-y-6 pt-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-stone-200/80 rounded-full animate-pulse" />
            <div className="h-8 w-4/5 bg-stone-300/80 rounded-xl animate-pulse" />
            <div className="h-6 w-32 bg-stone-300/60 rounded-lg animate-pulse" />
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-12 bg-stone-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          <div className="h-12 w-full bg-stone-900/10 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
