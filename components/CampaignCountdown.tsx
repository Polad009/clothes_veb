"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const LABEL: Record<string, { ends: string; d: string }> = {
  az: { ends: "Endirimin bitməsinə", d: "g" },
  en: { ends: "Sale ends in", d: "d" },
  ru: { ends: "До конца скидки", d: "д" },
  tr: { ends: "İndirimin bitmesine", d: "g" },
};

/** Live "ends in 2g 05:12:33" line for a running discount; disappears when it ends. */
export function CampaignCountdown({ endsAt, percent, language }: { endsAt: string; percent: number; language: string }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Rendered only in the browser, so server and client markup always match
  if (now === null || !(end > now)) return null;

  const left = Math.floor((end - now) / 1000);
  const days = Math.floor(left / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(Math.floor((left % 86400) / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  const l = LABEL[language] || LABEL.az;

  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700" role="timer" aria-live="off">
      <Clock className="h-3.5 w-3.5" aria-hidden />
      <span>−{percent}% · {l.ends}</span>
      <span className="tabular-nums">{days > 0 ? `${days}${l.d} ` : ""}{clock}</span>
    </p>
  );
}
