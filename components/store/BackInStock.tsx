"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { tr, type Phrase } from "@/components/store/i18n";

/** Shown instead of "Add to bag" when the chosen colour/size is sold out. */
export function BackInStock({ productId, color, size }: { productId: string; color: string; size: string }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const L = (p: Phrase) => tr(language, p);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // a different size/colour is a different request
  useEffect(() => {
    setState("idle");
    setError("");
  }, [productId, color, size]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setState("error");
      setError(L({ az: "Düzgün e-poçt ünvanı yazın.", en: "Enter a valid email address.", ru: "Введите корректный e-mail.", tr: "Geçerli bir e-posta adresi girin." }));
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/store/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, color, size, email: value, language }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
        return;
      }
      setState("error");
      setError(
        data.error === "in_stock"
          ? L({ az: "Bu ölçü artıq stokdadır — səhifəni yeniləyin.", en: "This size is already back — refresh the page.", ru: "Этот размер уже в наличии — обновите страницу.", tr: "Bu beden zaten stokta — sayfayı yenileyin." })
          : data.error === "too_many"
          ? L({ az: "Çox cəhd oldu, bir az sonra yenidən yoxlayın.", en: "Too many attempts, please try again shortly.", ru: "Слишком много попыток, попробуйте позже.", tr: "Çok fazla deneme, biraz sonra tekrar deneyin." })
          : L({ az: "Alınmadı, yenidən cəhd edin.", en: "Something went wrong, please try again.", ru: "Не получилось, попробуйте ещё раз.", tr: "Olmadı, tekrar deneyin." })
      );
    } catch {
      setState("error");
      setError(L({ az: "Alınmadı, yenidən cəhd edin.", en: "Something went wrong, please try again.", ru: "Не получилось, попробуйте ещё раз.", tr: "Olmadı, tekrar deneyin." }));
    }
  };

  if (state === "done") {
    return (
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/15 bg-ink-850 p-5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bone text-ink">
          <Check size={15} strokeWidth={3} />
        </span>
        <p className="text-[14px] leading-relaxed text-bone-dim">
          {L({
            az: `Hazırdır. ${size ? `${size} ölçüsü ` : ""}stoka gələn kimi ${email.trim()} ünvanına yazacağıq.`,
            en: `Done. We'll email ${email.trim()} as soon as ${size ? `size ${size}` : "it"} is back in stock.`,
            ru: `Готово. Напишем на ${email.trim()}, как только ${size ? `размер ${size}` : "товар"} появится в наличии.`,
            tr: `Tamam. ${size ? `${size} beden ` : ""}stoğa girer girmez ${email.trim()} adresine yazacağız.`,
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl border border-white/15 bg-ink-850 p-5" noValidate>
      <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em]">
        <Bell size={14} />
        {L({ az: "Bu ölçü bitib", en: "This size is sold out", ru: "Этот размер закончился", tr: "Bu beden tükendi" })}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-bone-dim">
        {L({
          az: "E-poçtunuzu yazın — stoka gələn kimi sizə xəbər verək.",
          en: "Leave your email and we'll let you know the moment it's back.",
          ru: "Оставьте e-mail — сообщим, как только товар снова появится.",
          tr: "E-postanızı bırakın, stoğa girdiği an size haber verelim.",
        })}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="bis-email">E-mail</label>
        <input
          id="bis-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder={L({ az: "E-poçt ünvanınız", en: "Your email", ru: "Ваш e-mail", tr: "E-posta adresiniz" })}
          className="h-12 w-full min-w-0 shrink-0 rounded-full border sm:w-auto sm:flex-1 border-white/20 bg-transparent px-5 text-[14px] text-bone placeholder:text-bone-faint focus:border-bone focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-12 rounded-full bg-bone px-6 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink transition hover:bg-white disabled:opacity-60"
        >
          {state === "sending"
            ? L({ az: "Göndərilir…", en: "Sending…", ru: "Отправка…", tr: "Gönderiliyor…" })
            : L({ az: "Xəbər ver", en: "Notify me", ru: "Сообщить мне", tr: "Haber ver" })}
        </button>
      </div>
      {state === "error" && <p className="mt-3 text-[12px] font-semibold text-sale">{error}</p>}
    </form>
  );
}
