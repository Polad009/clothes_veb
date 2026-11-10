import React from "react";

export default function StudioLoading() {
  return (
    <div className="min-h-screen w-full bg-ink font-grotesk">
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <div className="h-12 w-72 max-w-full animate-pulse bg-ink-700 sm:h-16 sm:w-[28rem]" />
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="aspect-[4/5] animate-pulse bg-ink-800 lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse bg-ink-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
