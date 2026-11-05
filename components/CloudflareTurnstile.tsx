"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (err: any) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export function CloudflareTurnstile({ onVerify, onError, onExpire, className = "" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "0x4AAAAAAF0wCPY1PUbejN1R";

  useEffect(() => {
    let isMounted = true;

    function renderWidget() {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return; // already rendered

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (isMounted) onVerify(token);
          },
          "error-callback": (err: any) => {
            if (isMounted && onError) onError(err);
          },
          "expired-callback": () => {
            if (isMounted && onExpire) onExpire();
          },
          theme: "auto",
          size: "flexible",
        });
        widgetIdRef.current = id;
      } catch (e) {
        console.warn("[Cloudflare Turnstile] Render error:", e);
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      // Load Turnstile script dynamically if not present
      const scriptId = "cf-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      return () => {
        clearInterval(checkInterval);
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onError, onExpire]);

  return (
    <div className={`turnstile-wrapper my-3 min-h-[65px] flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}
