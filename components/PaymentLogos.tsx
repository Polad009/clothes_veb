"use client";

import React from "react";

/**
 * Official Apple Pay Vector Logo
 * Features the official Apple icon (with leaf) followed by "Pay" in San Francisco font.
 * Based on Apple Human Interface Guidelines for Apple Pay Mark.
 */
export function ApplePayLogo({
  className = "h-5 w-auto",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light" | "outline";
}) {
  const isLight = variant === "light";
  const isOutline = variant === "outline";

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 select-none transition-transform hover:scale-105 ${
        isLight
          ? "bg-white text-black border border-zinc-200 shadow-2xs"
          : isOutline
          ? "bg-transparent text-current border border-current"
          : "bg-black text-white shadow-2xs"
      }`}
    >
      <svg
        viewBox="0 0 512 210.2"
        className={`${className} fill-current`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Apple Pay"
      >
        <path d="M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9 C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2 c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7 c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2 C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2 c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8 c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4 l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5 l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z" />
      </svg>
    </div>
  );
}

/**
 * Official Google Pay Vector Logo
 * Features Google 4-color 'G' and 'Pay' brand text
 */
export function GooglePayLogo({
  className = "h-5 w-auto",
}: {
  className?: string;
}) {
  return (
    <div className="inline-flex items-center justify-center rounded-lg px-2.5 py-1 bg-white border border-zinc-200 select-none shadow-2xs transition-transform hover:scale-105">
      <svg
        viewBox="0 0 64 24"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Google Pay"
      >
        {/* Google 4-color G */}
        <path
          d="M21.3 10.2h-9.4v3.6h5.4c-.2 1.3-1 2.5-2 3.2-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9c.8-2.4 3-4.1 5.6-4.1 1.5 0 2.8.5 3.8 1.5l2.7-2.7C17 3 14.7 2 12 2 8 2 4.7 4.2 3.1 7.5 2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5C4.7 19.8 8 22 12 22c2.7 0 4.9-.9 6.6-2.4 1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.3-2z"
          fill="#4285F4"
        />
        <path
          d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.5C4.7 19.8 8 22 12 22z"
          fill="#34A853"
        />
        <path
          d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5L6.4 14z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.7C17 3 14.7 2 12 2 8 2 4.7 4.2 3.1 7.5l3.3 2.5c.8-2.3 3-4.2 5.6-4.2z"
          fill="#EA4335"
        />
        {/* 'Pay' letters */}
        <path
          d="M26 18.7V1h6c1.1 0 2 .2 2.9.7.9.4 1.5 1.1 2 1.9.5.8.8 1.7.8 2.8 0 1.1-.3 2-.8 2.8-.5.8-1.2 1.5-2 1.9-.9.4-1.8.7-2.9.7h-3.3v6.9H26zm2.7-9.4h3.4c.6 0 1.2-.1 1.6-.4.4-.3.8-.6 1-1.1.2-.4.4-.9.4-1.4 0-.5-.1-.9-.4-1.4-.2-.4-.6-.8-1-1.1-.4-.3-1-.4-1.6-.4h-3.4v4.4z"
          fill="#3C4043"
        />
        <path
          d="M43.4 19.1c-.9 0-1.7-.2-2.4-.5-.7-.4-1.2-.9-1.6-1.5-.4-.6-.6-1.4-.6-2.2 0-.9.2-1.7.7-2.3.5-.6 1.1-1.1 1.9-1.4.8-.3 1.6-.5 2.6-.5.5 0 1 0 1.5.1.4.1.8.1 1.2.2.3.1.6.2.8.3v-.7c0-.8-.3-1.5-.9-2-.6-.5-1.3-.7-2.3-.7-.6 0-1.2.1-1.8.4-.6.3-1 .7-1.4 1.2l-1.8-1.4c.4-.5.8-.9 1.3-1.3.5-.4 1.1-.6 1.7-.8.6-.2 1.3-.3 2-.3 1.8 0 3.2.5 4.1 1.4 1 .9 1.5 2.1 1.5 3.8v7.9h-2.5v-1.6h-.1c-.2.3-.5.6-.9.9-.4.3-.8.5-1.3.7-.5.3-1.1.4-1.7.4zm.5-2.2c.7 0 1.3-.2 1.8-.5.5-.3.9-.8 1.2-1.3.3-.5.5-1.1.5-1.8-.4-.2-.8-.4-1.3-.5-.5-.1-1-.2-1.6-.2-1.1 0-1.8.2-2.3.6-.5.4-.7 1-.7 1.6 0 .6.2 1.1.6 1.5.5.4 1.1.6 1.8.6z"
          fill="#3C4043"
        />
        <path
          d="M56.6 23.4c0 .1-.1.2-.2.3 0 .1-.1.2-.1.3h-2.8c.1-.2.2-.4.3-.8.2-.3.3-.7.5-1 .1-.2.2-.4.3-.7.1-.2.2-.5.3-.8.1-.3.3-.5.4-.8l.9-2-5.2-11.9h2.9l3.6 8.6h.1l3.5-8.6H64l-6.4 15c-.1.3-.2.6-.4.9-.1.3-.3.6-.4.8-.1.4-.2.5-.2.7z"
          fill="#3C4043"
        />
      </svg>
    </div>
  );
}

/**
 * Official Visa Vector Logo
 */
export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="inline-flex items-center justify-center rounded-lg px-2 py-1 bg-white border border-zinc-200 select-none shadow-2xs transition-transform hover:scale-105">
      <svg
        viewBox="0 0 36 12"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Visa"
      >
        <path
          d="M14.6 11.5L12.3.5H9.6L6 8.4 5.3 4.3C4.9 2.5 3.3 1.2 1.5.6L0 .5v.5c2.4.6 4.3 2 4.9 4.3l2.4 8.7h2.8l4.3-10.8 1.7 8.3h-1.5v.5h4zm4.2-.7c2 0 3.3-.9 3.3-2.3 0-1.8-2.5-1.9-2.5-2.8 0-.5.5-.8 1.5-.8.9 0 1.6.2 2 .4l.4-1.9c-.6-.2-1.4-.4-2.4-.4-2.5 0-4.2 1.3-4.2 3.1 0 1.9 2.6 2.1 2.6 2.9 0 .6-.6.9-1.6.9-.9 0-1.8-.2-2.3-.5l-.4 1.9c.7.3 1.9.5 3.6.5zm8.9.7l2.2-11H27l-2.2 11h2.9zm8.3-11h-2.2c-.7 0-1.2.2-1.5.9l-4.2 10.1h3l.6-1.7h3.7l.3 1.7h2.6l-2.3-11zm-3.5 7l1.6-4.4.9 4.4h-2.5z"
          fill="#1434CB"
        />
      </svg>
    </div>
  );
}

/**
 * Official Mastercard Vector Logo
 * Features iconic interlocking red (#EB001B) and yellow-orange (#F79E1B) circles with overlap
 */
export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="inline-flex items-center justify-center rounded-lg px-2 py-1 bg-white border border-zinc-200 select-none shadow-2xs transition-transform hover:scale-105">
      <svg
        viewBox="0 0 32 20"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mastercard"
      >
        <circle cx="10" cy="10" r="10" fill="#EB001B" />
        <circle cx="22" cy="10" r="10" fill="#F79E1B" />
        <path
          d="M16 3.1a9.96 9.96 0 0 0-4 6.9 9.96 9.96 0 0 0 4 6.9 9.96 9.96 0 0 0 4-6.9 9.96 9.96 0 0 0-4-6.9z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  );
}

/**
 * Composite Payment Badges Row
 * High-end luxury strip with official vector logos
 */
export function PaymentLogosRow({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const logoHeight = size === "sm" ? "h-3.5" : size === "lg" ? "h-6" : "h-4";

  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      <ApplePayLogo className={`${logoHeight} w-auto`} variant="dark" />
      <GooglePayLogo className={`${logoHeight} w-auto`} />
      <VisaLogo className={`${logoHeight} w-auto`} />
      <MastercardLogo className={`${logoHeight} w-auto`} />
    </div>
  );
}
