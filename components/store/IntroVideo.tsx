"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";
import { tr } from "@/components/store/i18n";

// Our own edit (cut, cropped and colour-graded here) of licensed stock footage.
// Sources and licences: MEDIA_LICENSES.md. Replaceable in Admin → Sayt kontenti → Giriş videosu.
export const DEFAULT_INTRO_VIDEO = {
  desktop: "/videos/horwalle-intro-desktop.mp4",
  mobile: "/videos/horwalle-intro-mobile.mp4",
  posterDesktop: "/videos/horwalle-intro-desktop.jpg",
  posterMobile: "/videos/horwalle-intro-mobile.jpg",
};

const okUrl = (v: unknown) => typeof v === "string" && /^(\/|https:\/\/)/.test(v.trim());

/**
 * Full-width video at the top of the home page, above the hero.
 * Muted, looping, plays inline; a still image for visitors who prefer reduced motion
 * or save data; a pause button (anything moving longer than 5 s must be stoppable).
 */
export function IntroVideo() {
  const { language } = useLanguage();
  const { content } = useStoreData();
  const cfg = (content as any)?.introVideo || {};
  const enabled = cfg.enabled !== false;

  const desktop = okUrl(cfg.desktop) ? cfg.desktop.trim() : DEFAULT_INTRO_VIDEO.desktop;
  const mobile = okUrl(cfg.mobile) ? cfg.mobile.trim() : okUrl(cfg.desktop) ? cfg.desktop.trim() : DEFAULT_INTRO_VIDEO.mobile;
  const custom = okUrl(cfg.desktop) || okUrl(cfg.mobile);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPhone, setIsPhone] = useState<boolean | null>(null);
  const [still, setStill] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean((navigator as any).connection?.saveData);
    setStill(reduce || saveData);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // stop decoding while the section is off screen
  useEffect(() => {
    const v = videoRef.current;
    if (!v || still) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !paused) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [isPhone, still, paused]);

  if (!enabled) return null;

  const poster = custom ? undefined : isPhone ? DEFAULT_INTRO_VIDEO.posterMobile : DEFAULT_INTRO_VIDEO.posterDesktop;
  const src = isPhone ? mobile : desktop;

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section className="relative h-[88svh] min-h-[520px] w-full overflow-hidden bg-ink" aria-label="Horwalle">
      {isPhone !== null &&
        (still ? (
          poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            key={src}
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            disablePictureInPicture
          />
        ))}
      {/* fade into the page below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1600px] items-center gap-4 px-4 pb-6 sm:px-6 lg:px-10">
        <a
          href="#hero"
          className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-bone/80 transition hover:text-bone"
        >
          {tr(language, { az: "Kəşf et", en: "Explore", ru: "Смотреть", tr: "Keşfet" })}
          <ChevronDown size={14} />
        </a>
        {!still && (
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-bone/90 backdrop-blur-sm transition hover:border-bone"
            aria-label={
              paused
                ? tr(language, { az: "Videonu oynat", en: "Play video", ru: "Воспроизвести видео", tr: "Videoyu oynat" })
                : tr(language, { az: "Videonu dayandır", en: "Pause video", ru: "Остановить видео", tr: "Videoyu durdur" })
            }
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </section>
  );
}
