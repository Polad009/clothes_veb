import { whatsappLink, whatsappNumber } from "@/lib/contact";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import React from "react";
import Link from "next/link";
import { Tx } from "@/components/store/Tx";

export default async function NotFound() {
  const supportLink = whatsappLink(whatsappNumber((await getStoreSnapshot()).settings));
  return (
    <div className="flex min-h-[75vh] w-full flex-col items-center justify-center bg-ink px-4 text-center font-grotesk text-bone">
      <p className="text-[90px] font-black leading-none tracking-tight text-white/10 [font-stretch:125%] sm:text-[160px]">404</p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight [font-stretch:112%] sm:text-5xl"><Tx p={{ az: "Səhifə tapılmadı", en: "Page not found", ru: "Страница не найдена", tr: "Sayfa bulunamadı" }} /></h1>
      <p className="mt-4 max-w-md text-[14px] text-bone-dim">
        <Tx p={{ az: "Axtardığınız səhifə silinib və ya ünvan səhv yazılıb.", en: "The page you are looking for was removed or the address is wrong.", ru: "Страница удалена или адрес введён неверно.", tr: "Aradığınız sayfa kaldırılmış veya adres yanlış yazılmış." }} />
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/collections" className="rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white">
          <Tx p={{ az: "Məhsullara bax", en: "Shop products", ru: "Смотреть товары", tr: "Ürünlere göz at" }} />
        </Link>
        <a
          href={supportLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/25 px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
