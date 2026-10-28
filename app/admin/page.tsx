"use client";

import React from "react";

export default function AdminPage() {
  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-[#F8F9FA] overflow-hidden m-0 p-0">
      <iframe
        src="/admin.html"
        className="w-full h-full border-none m-0 p-0 block"
        title="HORWALLE İdarəetmə Portalı"
      />
    </div>
  );
}
