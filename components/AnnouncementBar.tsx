"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface AnnouncementBarProps {
  announcements?: string[];
}

export function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const { t } = useLanguage();

  const defaultList = [
    t.announcements.freeShipping,
    t.announcements.customStudio,
    t.announcements.cottonLinen,
    t.announcements.guaranteedReturns,
    t.announcements.expressDelivery,
  ];

  const items = announcements && announcements.length > 0 ? announcements : defaultList;

  // Duplicate the array to ensure perfectly seamless infinite continuous looping
  const duplicatedItems = [...items, ...items];

  return (
    <div className="bg-[#1C0A12] text-[#F6F2EA] text-[10.5px] sm:text-[11px] tracking-[0.18em] py-2 relative overflow-hidden select-none z-50 border-b border-[#3D1420]/40">
      {/* Continuous Fluid Flowing Marquee Ribbon */}
      <div className="flex w-max items-center animate-ticker pointer-events-none">
        {duplicatedItems.map((text, idx) => (
          <div key={idx} className="flex items-center shrink-0 px-6 sm:px-8">
            <span className="font-medium tracking-[0.16em] text-[#F6F2EA] uppercase text-[10.5px] sm:text-[11px]">
              {text}
            </span>
            <span className="mx-6 sm:mx-8 w-1 h-1 rounded-full bg-[#B3925C] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
