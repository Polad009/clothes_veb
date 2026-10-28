"use client";

import React from "react";

export default function AdminPage() {
  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      <iframe
        src="/admin.html"
        className="w-full h-full border-none flex-1"
        title="Horvvalle Admin Portalı"
      />
    </div>
  );
}
