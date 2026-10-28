"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = "+994 55-766-90-50";
  const whatsappUrl =
    "https://wa.me/994557669050?text=" +
    encodeURIComponent(
      "Salam! HORWALLE müştəri xidmətinə yazıram. Məhsullar və ya sifarişlə bağlı kömək edə bilərsiniz?"
    );

  return (
    <aside
      aria-label="WhatsApp Dəstək Xidməti"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expandable Tooltip / Info Badge */}
      <div
        className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white border border-stone-800 shadow-xl text-xs transition-all duration-300 origin-right ${
          isHovered
            ? "opacity-100 translate-x-0 scale-100"
            : "opacity-0 translate-x-3 scale-95 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Canlı Dəstək Aktivdir
          </span>
          <span className="font-semibold text-white/95">
            WhatsApp: <span className="font-mono text-[#E6C280]">{phoneNumber}</span>
          </span>
        </div>
      </div>

      {/* Main Floating Trigger Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ilə əlaqə saxlayın: ${phoneNumber}`}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white/20"
      >
        {/* Soft pulse glow around button */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

        {/* WhatsApp Icon */}
        <MessageCircle size={28} className="relative z-10 fill-white text-[#25D366]" />

        {/* Small badge: Online green dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
      </a>
    </aside>
  );
}

export default FloatingWhatsApp;
