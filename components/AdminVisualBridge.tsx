"use client";

import React, { useEffect, useState } from "react";

export function AdminVisualBridge() {
  const [isInsideAdmin, setIsInsideAdmin] = useState(false);

  useEffect(() => {
    // Only activate if running inside an iframe (the Admin Visual Editor)
    if (typeof window === "undefined" || window.parent === window) return;

    setIsInsideAdmin(true);

    // 1. Inject Styles for Inspection & Hover Highlights
    const styleEl = document.createElement("style");
    styleEl.id = "nova-admin-bridge-styles";
    styleEl.innerHTML = `
      [data-cms-section] {
        position: relative !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        cursor: pointer !important;
      }
      [data-cms-section]:hover {
        outline: 3px solid #7c3aed !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 25px -4px rgba(124, 58, 237, 0.45) !important;
      }
      [data-cms-section]:hover::after {
        content: attr(data-cms-title) " (Düzəliş etmək üçün klikləyin)";
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 99999;
        background: #7c3aed;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 5px 12px;
        border-radius: 9999px;
        pointer-events: none;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
      }
      .nova-selected-section {
        outline: 3.5px solid #2563eb !important;
        outline-offset: 5px !important;
        box-shadow: 0 0 35px -2px rgba(37, 99, 235, 0.6) !important;
        animation: novaPulse 1.5s infinite alternate !important;
      }
      @keyframes novaPulse {
        from { outline-color: #2563eb; }
        to { outline-color: #7c3aed; }
      }
    `;
    document.head.appendChild(styleEl);

    // 2. Intercept All Clicks — Prevent site actions & send clicked section to Admin
    const handleGlobalClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const sectionEl = target.closest("[data-cms-section]") as HTMLElement | null;
      const sectionKey = sectionEl?.getAttribute("data-cms-section") || "hero";
      const sectionTitle = sectionEl?.getAttribute("data-cms-title") || "Bölmə";

      // Visual pulse on clicked element
      document.querySelectorAll(".nova-selected-section").forEach((el) => {
        el.classList.remove("nova-selected-section");
      });
      if (sectionEl) {
        sectionEl.classList.add("nova-selected-section");
      }

      // Send to Admin Portal (parent window)
      try {
        window.parent.postMessage(
          {
            type: "NOVA_CMS_SELECT",
            section: sectionKey,
            title: sectionTitle,
            tagName: target.tagName,
            innerText: (target.innerText || "").slice(0, 50),
          },
          "*"
        );
      } catch (err) {
        console.error("Bridge postMessage error:", err);
      }
    };

    window.addEventListener("click", handleGlobalClick, true);

    // 3. Listen for scroll/highlight commands from Admin Portal
    const handleParentMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "NOVA_CMS_SCROLL_TO" && data.section) {
        const target = document.querySelector(`[data-cms-section="${data.section}"]`);
        if (target) {
          document.querySelectorAll(".nova-selected-section").forEach((el) => {
            el.classList.remove("nova-selected-section");
          });
          target.classList.add("nova-selected-section");
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    window.addEventListener("message", handleParentMessage);

    return () => {
      window.removeEventListener("click", handleGlobalClick, true);
      window.removeEventListener("message", handleParentMessage);
      const injected = document.getElementById("nova-admin-bridge-styles");
      if (injected) injected.remove();
    };
  }, []);

  if (!isInsideAdmin) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "14px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
        background: "rgba(15, 23, 42, 0.95)",
        color: "#ffffff",
        backdropFilter: "blur(12px)",
        padding: "8px 20px",
        borderRadius: "9999px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "9999px",
          background: "#10b981",
          boxShadow: "0 0 10px #10b981",
        }}
      />
      <span>CANLI REDAKTƏ REJİMİ · Dəyişmək istədiyiniz elementə toxunun</span>
    </div>
  );
}
