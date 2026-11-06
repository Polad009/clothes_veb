"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, ShieldCheck, CheckCheck } from "lucide-react";
import { playMessageReceivedSound, playMessageSentSound } from "@/lib/chatSound";
import { useAuth } from "@/context/AuthContext";

// Official WhatsApp icon SVG with exact brand look
function WhatsAppBrandIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Message {
  id: string;
  sender: "customer" | "admin";
  text: string;
  timestamp: number;
}

export function FloatingWhatsApp() {
  const { user, profile } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(true);
  const [isTypingAdmin, setIsTypingAdmin] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastKnownMsgIdRef = useRef<string>("");
  const typingTimeoutRef = useRef<any>(null);

  const phoneNumber = "+994 55-766-90-50";
  const whatsappUrl =
    "https://wa.me/994557669050?text=" +
    encodeURIComponent("Salam! Horwalle atelyesinə yazıram. Məhsul və ya sifarişlə bağlı kömək edə bilərsiniz?");

  // Initialize unique customer session ID
  useEffect(() => {
    let sid = "";
    try {
      sid = localStorage.getItem("hv_livechat_session_id") || "";
      if (!sid) {
        sid = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("hv_livechat_session_id", sid);
      }
    } catch {
      sid = `cust_${Date.now()}`;
    }
    setSessionId(sid);
  }, []);

  // Poll for messages and admin status
  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    const pollChat = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}&role=customer`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && active) {
            const thread = data.thread;
            setIsAdminOnline(thread?.adminOnline ?? true);
            setIsTypingAdmin(Boolean(thread?.isTypingAdmin));

            const fetchedMessages: Message[] = data.messages || [];
            
            // Check for new message sound
            if (fetchedMessages.length > 0) {
              const lastMsg = fetchedMessages[fetchedMessages.length - 1];
              if (lastKnownMsgIdRef.current && lastMsg.id !== lastKnownMsgIdRef.current && lastMsg.sender === "admin") {
                playMessageReceivedSound();
                if (!isChatOpen) {
                  setUnreadCount((prev) => prev + 1);
                }
              }
              lastKnownMsgIdRef.current = lastMsg.id;
            }

            setMessages(fetchedMessages);
          }
        }
      } catch (e) {
        // network silent
      }
    };

    pollChat();
    const interval = setInterval(pollChat, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sessionId, isChatOpen]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isChatOpen, messages]);

  // Handle customer typing notification
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (sessionId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      fetch(`/api/chat?sessionId=${sessionId}&role=customer&typing=true`).catch(() => {});
      typingTimeoutRef.current = setTimeout(() => {
        fetch(`/api/chat?sessionId=${sessionId}&role=customer&typing=false`).catch(() => {});
      }, 2500);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !sessionId) return;

    setInputText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const customerName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "Müştəri");
    const customerEmail = user?.email || undefined;

    // Optimistic local add
    const tempMsg: Message = {
      id: `temp_${Date.now()}`,
      sender: "customer",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    playMessageSentSound();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "customer",
          text,
          customerName,
          customerEmail,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          lastKnownMsgIdRef.current = data.message.id;
          setMessages((prev) =>
            prev.map((m) => (m.id === tempMsg.id ? data.message : m))
          );
        }
      }
    } catch (e) {
      // rollback or retry
    }
  };

  return (
    <aside
      aria-label="Canlı Dəstək və Əlaqə"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none pointer-events-auto"
    >
      {/* ─── LIVE CHAT POPUP WINDOW ─────────────────────────────────────────── */}
      {isChatOpen && (
        <div
          role="dialog"
          aria-label="Horwalle Canlı Dəstək"
          className="w-[calc(100vw-2.5rem)] sm:w-[360px] h-[480px] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right"
        >
          {/* Header */}
          <div className="bg-[#111111] text-white p-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#94713A] to-[#E6C280] p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center font-bold text-xs text-[#E6C280]">
                    H
                  </div>
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-stone-900 ${
                    isAdminOnline ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  title={isAdminOnline ? "Operator Xəttədir" : "Xətdə Deyil"}
                />
              </div>

              <div>
                <h4 className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <span>Horwalle Dəstək</span>
                  <ShieldCheck size={13} className="text-[#E6C280]" />
                </h4>
                <div className="text-[10.5px] text-stone-400 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAdminOnline ? "bg-emerald-400 animate-pulse" : "bg-stone-500"
                    }`}
                  />
                  <span>{isAdminOnline ? "Onlayn • Dərhal cavab" : "Tezliklə cavablandırılacaq"}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition cursor-pointer"
              aria-label="Çatı bağla"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/60">
            {/* Welcome banner */}
            <div className="text-center py-2">
              <span className="text-[11px] bg-white border border-stone-200/80 px-3 py-1 rounded-full text-stone-500 shadow-2xs font-medium">
                Xoş gəlmisiniz! Sizə necə kömək edə bilərik?
              </span>
            </div>

            {messages.length === 0 && (
              <div className="text-center text-xs text-stone-400 pt-10">
                Sualınızı daxil edin, atelye nümayəndəmiz dərhal cavablayacaq.
              </div>
            )}

            {messages.map((m) => {
              const isCust = m.sender === "customer";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCust ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isCust
                        ? "bg-[#111111] text-white rounded-br-xs"
                        : "bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                  <span className="text-[9.5px] text-stone-400 mt-1 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}

            {/* Admin typing indicator */}
            {isTypingAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-white/80 border border-stone-200 px-3 py-1.5 rounded-full w-fit">
                <span className="text-[11px] font-medium text-stone-600">Operator yazır</span>
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#B08D57] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#B08D57] rounded-full animate-bounce" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Mesajınızı daxil edin..."
              className="flex-1 bg-stone-100 border border-stone-200/80 rounded-full px-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-400 placeholder:text-stone-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full bg-[#111111] hover:bg-black text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shadow-sm shrink-0 active:scale-95"
              aria-label="Göndər"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* ─── FLOATING ACTION BUTTONS STACK ──────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2.5">
        {/* 1. TOP BUTTON: LIVE CHAT TRIGGER */}
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Canlı Dəstək Çatını Aç"
          className="relative group flex items-center justify-center w-13 h-13 rounded-full bg-[#111111] hover:bg-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-stone-900/10 cursor-pointer"
        >
          {isChatOpen ? (
            <X size={22} className="text-white" />
          ) : (
            <>
              <MessageCircle size={22} className="text-white" />
              {/* Online Green Indicator */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              {/* Unread badge counter */}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </>
          )}

          {/* Tooltip on hover */}
          <span className="hidden group-hover:sm:block absolute right-15 bg-stone-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap pointer-events-none">
            {isChatOpen ? "Bağla" : "Canlı Dəstək (Onlayn)"}
          </span>
        </button>

        {/* 2. BOTTOM BUTTON: OFFICIAL WHATSAPP TRIGGER */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ilə əlaqə saxlayın: ${phoneNumber}`}
          className="relative group flex items-center justify-center w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-[#25D366]/20 cursor-pointer"
        >
          {/* Subtle radar pulse glow */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />

          {/* Official WhatsApp Logo Icon */}
          <WhatsAppBrandIcon className="w-6 h-6 text-white relative z-10" />

          {/* Tooltip on hover */}
          <span className="hidden group-hover:sm:block absolute right-15 bg-[#25D366] text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap pointer-events-none">
            WhatsApp Dəstək
          </span>
        </a>
      </div>
    </aside>
  );
}

export default FloatingWhatsApp;
