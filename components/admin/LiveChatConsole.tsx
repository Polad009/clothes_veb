"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, Lock, Mail, MessageCircle, Phone, RotateCcw, Search, Send, Unlock } from "lucide-react";
import type { ChatMessage, ChatThread } from "@/lib/db/chat";
import { playMessageReceivedSound, playMessageSentSound } from "@/lib/chatSound";
import { cn } from "@/lib/utils";
import { Badge, Button, ConfirmButton, EmptyState, Input, useToast } from "@/components/admin/ui";

type LocalMessage = ChatMessage & { pending?: boolean; failed?: boolean };
type Filter = "all" | "unread" | "open" | "closed";

const THREADS_EVERY_MS = 4000;
const MESSAGES_EVERY_MS = 2500;
const QUICK_REPLIES = [
  "Salam! Sizə necə kömək edə bilərəm?",
  "Sifariş nömrənizi yaza bilərsiniz?",
  "Bir dəqiqə, yoxlayıram.",
  "Təşəkkür edirik! Başqa sualınız olsa, yazın.",
];

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
function dayLabel(ms: number) {
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return "Bu gün";
  if (d.toDateString() === yesterday.toDateString()) return "Dünən";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}
function listTime(ms: number) {
  return new Date(ms).toDateString() === new Date().toDateString() ? hhmm(ms) : dayLabel(ms);
}
function lastSeen(t: ChatThread) {
  if (t.isTypingCustomer) return "yazır…";
  if (t.customerOnline) return "saytdadır";
  if (!t.customerSeenAt) return "";
  const today = new Date(t.customerSeenAt).toDateString() === new Date().toDateString();
  return `son görülmə: ${today ? "" : `${dayLabel(t.customerSeenAt)} `}${hhmm(t.customerSeenAt)}`;
}

async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Xəta (${res.status})`), { status: res.status });
  return data as T;
}

export function LiveChatConsole() {
  const toast = useToast();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const totalUnread = useRef<number | null>(null);
  const typingSentAt = useRef(0);
  const typingStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── open the conversation named in the URL (?s=…) ──────────────────────────
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("s");
    if (s) setSelectedId(s);
  }, []);

  const select = (id: string | null) => {
    setSelectedId(id);
    setMessages([]);
    setThread(null);
    setDraft("");
    stickToBottom.current = true;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("s", id);
    else url.searchParams.delete("s");
    window.history.replaceState(null, "", url.toString());
  };

  // ── conversation list ──────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const data = await api<{ threads: ChatThread[] }>("/api/chat/threads");
      const list = data.threads || [];
      setThreads(list);
      setLoaded(true);
      const unread = list.reduce((n, t) => n + (t.isClosed ? 0 : t.unreadAdmin), 0);
      if (totalUnread.current !== null && unread > totalUnread.current) playMessageReceivedSound();
      totalUnread.current = unread;
      document.title = unread > 0 ? `(${unread}) Canlı çat · İdarəetmə` : "Canlı çat · İdarəetmə";
    } catch (e: any) {
      if (e.status === 401) toast.error("Sessiyanın vaxtı bitib. Yenidən daxil olun.");
    }
  }, [toast]);

  useEffect(() => {
    loadThreads();
    const t = setInterval(loadThreads, THREADS_EVERY_MS);
    return () => clearInterval(t);
  }, [loadThreads]);

  // ── selected conversation ──────────────────────────────────────────────────
  const loadMessages = useCallback(async (id: string) => {
    try {
      const read = document.visibilityState === "visible" ? "&read=1" : "";
      const data = await api<{ thread: ChatThread | null; messages: ChatMessage[] }>(
        `/api/chat?sessionId=${encodeURIComponent(id)}&role=admin${read}`
      );
      setThread(data.thread);
      setMessages((prev) => {
        // keep messages still being sent (or that failed) after the server copy
        const local = prev.filter((m) => m.pending || m.failed);
        return [...(data.messages || []), ...local];
      });
    } catch {
      /* the next poll retries */
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
    const t = setInterval(() => loadMessages(selectedId), MESSAGES_EVERY_MS);
    return () => clearInterval(t);
  }, [selectedId, loadMessages]);

  // keep the view at the newest message unless the admin scrolled up to read
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, thread?.isTypingCustomer]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // ── sending ────────────────────────────────────────────────────────────────
  const sendTyping = (typing: boolean) => {
    if (!selectedId) return;
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selectedId, action: "typing", role: "admin", typing }),
    }).catch(() => {});
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (Date.now() - typingSentAt.current > 3000) {
      typingSentAt.current = Date.now();
      sendTyping(true);
    }
    if (typingStop.current) clearTimeout(typingStop.current);
    typingStop.current = setTimeout(() => {
      typingSentAt.current = 0;
      sendTyping(false);
    }, 4000);
  };

  const deliver = async (local: LocalMessage) => {
    if (!selectedId) return;
    try {
      const data = await api<{ message: ChatMessage }>("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedId, sender: "admin", text: local.text }),
      });
      setMessages((prev) => prev.map((m) => (m.id === local.id ? data.message : m)));
      loadThreads();
    } catch (e: any) {
      setMessages((prev) => prev.map((m) => (m.id === local.id ? { ...m, pending: false, failed: true } : m)));
      toast.error(e.message);
    }
  };

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || !selectedId || thread?.isClosed) return;
    const local: LocalMessage = { id: `local_${Date.now()}`, sender: "admin", text: clean, timestamp: Date.now(), status: "delivered", pending: true };
    setMessages((prev) => [...prev, local]);
    setDraft("");
    stickToBottom.current = true;
    if (typingStop.current) clearTimeout(typingStop.current);
    typingSentAt.current = 0;
    playMessageSentSound();
    deliver(local);
  };

  const retry = (m: LocalMessage) => {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, failed: false, pending: true } : x)));
    deliver({ ...m, failed: false, pending: true });
  };

  // ── conversation actions ───────────────────────────────────────────────────
  const setClosed = async (closed: boolean) => {
    if (!selectedId) return;
    setBusy(true);
    try {
      await api("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedId, action: closed ? "close_chat" : "reopen_chat" }),
      });
      toast.success(closed ? "Söhbət bağlandı." : "Söhbət yenidən açıldı.");
      await Promise.all([loadMessages(selectedId), loadThreads()]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    try {
      await api(`/api/chat/threads?sessionId=${encodeURIComponent(selectedId)}`, { method: "DELETE" });
      toast.success("Söhbət silindi.");
      select(null);
      loadThreads();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return threads.filter((t) => {
      if (filter === "unread" && !(t.unreadAdmin > 0 && !t.isClosed)) return false;
      if (filter === "open" && t.isClosed) return false;
      if (filter === "closed" && !t.isClosed) return false;
      if (!q) return true;
      return (
        t.customerName.toLowerCase().includes(q) ||
        (t.customerEmail || "").toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        (digits.length >= 3 && (t.customerPhone || "").replace(/\D/g, "").includes(digits))
      );
    });
  }, [threads, query, filter]);

  const current = thread || threads.find((t) => t.sessionId === selectedId) || null;
  const unreadCount = threads.filter((t) => t.unreadAdmin > 0 && !t.isClosed).length;
  const waDigits = (current?.customerPhone || "").replace(/\D/g, "");

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] bg-white lg:h-dvh">
      {/* ── conversation list ── */}
      <aside className={cn("flex w-full flex-col border-r border-stone-200 md:w-80 md:shrink-0", selectedId && "hidden md:flex")}>
        <div className="space-y-2 border-b border-stone-200 p-3">
          <div className="flex items-center justify-between">
            <h1 className="font-sans text-base font-semibold text-stone-900">Canlı çat</h1>
            {unreadCount > 0 && <Badge tone="red">{unreadCount} oxunmamış</Badge>}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad, telefon, mesaj" aria-label="Söhbətlərdə axtar" className="h-9 pl-9" />
          </div>
          <div className="flex gap-1" role="tablist" aria-label="Söhbət süzgəci">
            {([
              ["all", "Hamısı"],
              ["unread", "Oxunmamış"],
              ["open", "Açıq"],
              ["closed", "Bağlı"],
            ] as Array<[Filter, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === value ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {!loaded ? (
            <li className="p-6 text-center text-sm text-stone-500">Yüklənir…</li>
          ) : visible.length === 0 ? (
            <li>
              <EmptyState
                title={threads.length === 0 ? "Hələ söhbət yoxdur" : "Uyğun söhbət yoxdur"}
                description={threads.length === 0 ? "Müştəri saytdan yazan kimi burada görünəcək." : undefined}
              />
            </li>
          ) : (
            visible.map((t) => {
              const active = t.sessionId === selectedId;
              const unread = t.unreadAdmin > 0 && !t.isClosed;
              return (
                <li key={t.sessionId}>
                  <button
                    type="button"
                    onClick={() => select(t.sessionId)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full gap-3 border-b border-stone-100 px-3 py-3 text-left transition-colors",
                      active ? "bg-stone-100" : "hover:bg-stone-50"
                    )}
                  >
                    <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-[#E6C280]">
                      {(t.customerName || "M").trim().charAt(0).toUpperCase()}
                      {t.customerOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" aria-label="saytdadır" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-sm text-stone-900", unread ? "font-semibold" : "font-medium")}>{t.customerName}</span>
                        <span className={cn("shrink-0 text-[11px]", unread ? "font-semibold text-stone-900" : "text-stone-400")}>{listTime(t.lastMessageAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className={cn("truncate text-xs", unread ? "text-stone-800" : "text-stone-500")}>
                          {t.isTypingCustomer ? <em className="not-italic text-emerald-700">yazır…</em> : <>{t.lastSender !== "customer" && "Siz: "}{t.lastMessage}</>}
                        </span>
                        {unread ? (
                          <span className="shrink-0 rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">{t.unreadAdmin}</span>
                        ) : t.isClosed ? (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-label="bağlıdır" />
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      {/* ── conversation ── */}
      <section className={cn("flex min-w-0 flex-1 flex-col", !selectedId && "hidden md:flex")}>
        {!selectedId || !current ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-stone-50 text-stone-500">
            <MessageCircle className="h-8 w-8 text-stone-300" aria-hidden />
            <p className="text-sm">{selectedId ? "Söhbət yüklənir…" : "Soldan bir söhbət seçin"}</p>
          </div>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-3 border-b border-stone-200 px-4 py-3">
              <button type="button" onClick={() => select(null)} className="rounded-md p-1 text-stone-600 hover:bg-stone-100 md:hidden" aria-label="Söhbətlərə qayıt">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {current.customerName}
                  {current.isClosed && <span className="ml-2 align-middle"><Badge tone="neutral">Bağlıdır{current.closedBy === "customer" ? " (müştəri bitirib)" : ""}</Badge></span>}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                  <span className={cn(current.customerOnline || current.isTypingCustomer ? "text-emerald-700" : "")}>{lastSeen(current) || "—"}</span>
                  {current.customerPhone && (
                    <a href={`tel:${current.customerPhone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 hover:text-stone-900">
                      <Phone className="h-3 w-3" /> {current.customerPhone}
                    </a>
                  )}
                  {waDigits.length >= 9 && (
                    <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer" className="hover:text-stone-900">WhatsApp</a>
                  )}
                  {current.customerEmail && (
                    <a href={`mailto:${current.customerEmail}`} className="inline-flex items-center gap-1 hover:text-stone-900">
                      <Mail className="h-3 w-3" /> {current.customerEmail}
                    </a>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {current.isClosed ? (
                  <Button size="sm" loading={busy} onClick={() => setClosed(false)}>
                    <Unlock className="h-3.5 w-3.5" /> Yenidən aç
                  </Button>
                ) : (
                  <Button size="sm" loading={busy} onClick={() => setClosed(true)}>
                    <Lock className="h-3.5 w-3.5" /> Bağla
                  </Button>
                )}
                <ConfirmButton onConfirm={remove}>Sil</ConfirmButton>
              </div>
            </header>

            <div ref={scrollRef} onScroll={onScroll} className="flex-1 space-y-1.5 overflow-y-auto bg-stone-50 px-4 py-4">
              {messages.map((m, i) => {
                const newDay = i === 0 || dayLabel(messages[i - 1].timestamp) !== dayLabel(m.timestamp);
                const mine = m.sender === "admin" && !m.system;
                return (
                  <React.Fragment key={m.id}>
                    {newDay && (
                      <div className="py-2 text-center">
                        <span className="rounded-full bg-white px-3 py-0.5 text-[11px] text-stone-500 shadow-sm">{dayLabel(m.timestamp)}</span>
                      </div>
                    )}
                    {m.system ? (
                      <p className="mx-auto max-w-md py-1 text-center text-[11px] text-stone-500">Avtomatik mesaj: {m.text}</p>
                    ) : (
                      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                            mine ? "rounded-br-md bg-stone-900 text-white" : "rounded-bl-md border border-stone-200 bg-white text-stone-900",
                            m.failed && "bg-red-50 text-red-900 ring-1 ring-red-200"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10.5px]", mine && !m.failed ? "text-stone-400" : "text-stone-400")}>
                            {hhmm(m.timestamp)}
                            {mine && !m.failed && (m.pending ? <span>…</span> : m.status === "read" ? <CheckCheck className="h-3.5 w-3.5 text-sky-400" aria-label="oxundu" /> : <Check className="h-3.5 w-3.5" aria-label="çatdırıldı" />)}
                          </p>
                          {m.failed && (
                            <button type="button" onClick={() => retry(m)} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-700 underline">
                              <RotateCcw className="h-3 w-3" /> Göndərilmədi — yenidən cəhd et
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {current.isTypingCustomer && <p className="px-1 text-xs text-emerald-700">{current.customerName} yazır…</p>}
            </div>

            {current.isClosed ? (
              <p className="border-t border-stone-200 px-4 py-3 text-center text-sm text-stone-500">
                Söhbət bağlıdır. Cavab yazmaq üçün yuxarıdan “Yenidən aç” düyməsini basın.
              </p>
            ) : (
              <div className="border-t border-stone-200 bg-white p-3">
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => send(r)}
                      className="shrink-0 rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-700 hover:border-stone-900 hover:text-stone-900"
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => onDraftChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        send(draft);
                      }
                    }}
                    rows={Math.min(5, Math.max(1, draft.split("\n").length))}
                    maxLength={2000}
                    placeholder="Cavab yazın… (Enter — göndər, Shift+Enter — yeni sətir)"
                    aria-label="Cavab"
                    className="max-h-40 min-h-[40px] flex-1 resize-none rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <Button type="submit" variant="primary" disabled={!draft.trim()} aria-label="Göndər" className="h-10 w-10 shrink-0 px-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
