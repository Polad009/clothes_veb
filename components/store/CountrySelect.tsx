"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { getAllCountries, type CountryInfo } from "@/lib/countries";

const norm = (s: string) =>
  (s || "")
    .toLocaleLowerCase("az")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i");

/** Searchable country picker for the dark checkout (keyboard friendly). */
export function CountrySelect({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
}) {
  const countries = useMemo(() => getAllCountries().sort((a, b) => (a.code === "AZ" ? -1 : b.code === "AZ" ? 1 : a.name.localeCompare(b.name))), []);
  const current = countries.find((c) => c.code === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const list = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return countries;
    return countries.filter((c) => norm(`${c.name} ${c.localName} ${c.code} ${c.dialCode}`).includes(q));
  }, [countries, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(Math.max(0, countries.findIndex((c) => c.code === value)));
    const t = setTimeout(() => searchRef.current?.focus(), 40);
    const close = (e: MouseEvent) => boxRef.current && !boxRef.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", close);
    };
  }, [open, countries, value]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const pick = (c: CountryInfo) => {
    onChange(c.code);
    setOpen(false);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(list.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (list[active]) pick(list[active]);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 border bg-transparent px-3.5 py-3 text-left text-[14px] text-bone transition ${open ? "border-bone" : "border-white/20 hover:border-white/40"}`}
      >
        <span className="text-lg leading-none">{current?.flag}</span>
        <span className="flex-1 truncate">{current ? current.name : placeholder}</span>
        {current && <span className="text-[12px] text-bone-faint">{current.dialCode}</span>}
        <ChevronDown size={15} className={`text-bone-dim transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ transformOrigin: "top center" }}
            className="absolute left-0 right-0 top-full z-30 mt-1.5 border border-white/15 bg-ink-800 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            onKeyDown={onKey}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3.5">
              <Search size={15} className="shrink-0 text-bone-faint" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Axtar / Search"
                className="w-full bg-transparent py-3 text-[14px] text-bone placeholder:text-bone-faint focus:outline-none"
              />
            </div>
            <ul ref={listRef} role="listbox" data-lenis-prevent className="max-h-72 overflow-y-auto overscroll-contain py-1">
              {list.length === 0 && <li className="px-3.5 py-3 text-[13px] text-bone-faint">—</li>}
              {list.map((c, i) => {
                const selected = c.code === value;
                return (
                  <li
                    key={c.code}
                    data-i={i}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(c)}
                    className={`flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-[14px] transition-colors ${i === active ? "bg-white/[0.07] text-bone" : "text-bone-dim"}`}
                  >
                    <span className="w-6 text-lg leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">
                      {c.name}
                      {c.localName && c.localName !== c.name && <span className="ml-1.5 text-[12px] text-bone-faint">{c.localName}</span>}
                    </span>
                    <span className="text-[12px] tabular-nums text-bone-faint">{c.dialCode}</span>
                    {selected && <Check size={14} className="text-bone" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
