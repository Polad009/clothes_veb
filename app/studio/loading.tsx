import React from "react";

export default function StudioLoading() {
  return (
    <div className="w-full bg-[#140B05] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center items-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#E6C280] animate-spin" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#E6C280] font-mono">
            3D Dizayn Studiyası
          </h3>
          <p className="text-xs text-white/50">Mühit hazırlanır...</p>
        </div>
      </div>
    </div>
  );
}
