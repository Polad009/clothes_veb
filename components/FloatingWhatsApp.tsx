"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  User,
  Phone,
  ShieldCheck,
  Check,
  CheckCheck,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { playMessageReceivedSound, playMessageSentSound } from "@/lib/chatSound";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

// WhatsApp Brand Icon
function WhatsAppBrandIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// WhatsApp-style Status Checkmark
function MessageStatusIcon({ status }: { status?: "sending" | "sent" | "delivered" | "read" }) {
  if (status === "sending") {
    // Dotted/single check outline
    return <Check size={12} className="text-stone-400 opacity-60 stroke-[1.5]" />;
  }
  if (status === "read") {
    // Double Blue Check (WhatsApp style)
    return <CheckCheck size={13} className="text-[#34B7F1] stroke-[2.2]" />;
  }
  if (status === "delivered") {
    // Double Grey Check
    return <CheckCheck size={13} className="text-stone-400 stroke-[1.8]" />;
  }
  // Single Check (Sent)
  return <Check size={12} className="text-stone-400 stroke-[1.8]" />;
}

export interface Message {
  id: string;
  sender: "customer" | "admin";
  text: string;
  timestamp: number;
  status?: "sending" | "sent" | "delivered" | "read";
  read?: boolean;
}

// Multi-language UI Dictionaries for Live Chat
const CHAT_I18N = {
  az: {
    headerTitle: "Horwalle Dəstək",
    onlineBadge: "Onlayn • Dərhal cavab",
    offlineBadge: "Tezliklə cavablandırılacaq",
    welcomeBadge: "Xoş gəlmisiniz! Sizə necə kömək edə bilərik?",
    welcomeSubtitle: "Sualınızı daxil edin, atelye nümayəndəmiz dərhal cavablayacaq.",
    inputPlaceholder: "Mesajınızı daxil edin...",
    operatorTyping: "Operator yazır",
    endChatBtn: "Söhbəti bitir",
    endChatConfirm: "Canlı dəstək söhbətini yekunlaşdırmaq istədiyinizdən əminsiniz?",
    chatEndedTitle: "Söhbət Yekunlaşdı",
    chatEndedSubtitle: "Bizimlə əlaqə saxladığınız üçün təşəkkür edirik. Yeni söhbət başlada bilərsiniz.",
    startNewChatBtn: "Yeni Söhbət Başlat",
    welcomeFormTitle: "Canlı Dəstəyə Xoş Gəlmisiniz",
    welcomeFormDesc: "Sizə daha operativ və fərdi xidmət göstərməyimiz üçün zəhmət olmasa məlumatlarınızı qeyd edin:",
    nameLabel: "Ad və Soyadınız",
    namePlaceholder: "Məs: Alex Smith",
    phoneLabel: "Əlaqə Nömrəniz",
    phonePlaceholder: "+994 50 123 45 67",
    startChatSubmit: "Söhbətə Başla",
    nameRequired: "Zəhmət olmasa adınızı qeyd edin",
    liveChatAria: "Canlı Dəstək",
    closeAria: "Çatı bağla",
  },
  en: {
    headerTitle: "Horwalle Support",
    onlineBadge: "Online • Instant reply",
    offlineBadge: "Will reply shortly",
    welcomeBadge: "Welcome! How can we assist you today?",
    welcomeSubtitle: "Type your query, our atelier concierge will reply immediately.",
    inputPlaceholder: "Type your message...",
    operatorTyping: "Support is typing",
    endChatBtn: "End Chat",
    endChatConfirm: "Are you sure you want to end this chat session?",
    chatEndedTitle: "Chat Ended",
    chatEndedSubtitle: "Thank you for contacting Horwalle Atelier. You can start a new chat anytime.",
    startNewChatBtn: "Start New Chat",
    welcomeFormTitle: "Welcome to Live Support",
    welcomeFormDesc: "Please provide your details so we can assist you with your bespoke orders:",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. John Smith",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+1 234 567 8900",
    startChatSubmit: "Start Chat",
    nameRequired: "Please enter your name",
    liveChatAria: "Live Support",
    closeAria: "Close chat",
  },
  ru: {
    headerTitle: "Служба Поддержки",
    onlineBadge: "В сети • Быстрый ответ",
    offlineBadge: "Ответим в ближайшее время",
    welcomeBadge: "Добро пожаловать! Чем мы можем вам помочь?",
    welcomeSubtitle: "Задайте ваш вопрос, консьерж ателье ответит прямо сейчас.",
    inputPlaceholder: "Введите сообщение...",
    operatorTyping: "Оператор печатает",
    endChatBtn: "Завершить чат",
    endChatConfirm: "Вы уверены, что хотите завершить сеанс чата?",
    chatEndedTitle: "Чат Завершен",
    chatEndedSubtitle: "Спасибо за обращение в Horwalle Atelier. Вы можете начать новый диалог в любое время.",
    startNewChatBtn: "Начать Новый Чат",
    welcomeFormTitle: "Добро пожаловать в Онлайн-Чат",
    welcomeFormDesc: "Пожалуйста, укажите контактные данные для более оперативного обслуживания:",
    nameLabel: "Ваше Имя и Фамилия",
    namePlaceholder: "Напр: Александр Иванов",
    phoneLabel: "Номер Телефона",
    phonePlaceholder: "+7 999 123 45 67",
    startChatSubmit: "Начать диалог",
    nameRequired: "Пожалуйста, укажите ваше имя",
    liveChatAria: "Живая поддержка",
    closeAria: "Закрыть чат",
  },
  tr: {
    headerTitle: "Horwalle Canlı Destek",
    onlineBadge: "Çevrimiçi • Anında yanıt",
    offlineBadge: "Kısa sürede yanıtlanacak",
    welcomeBadge: "Hoş geldiniz! Size nasıl yardımcı olabiliriz?",
    welcomeSubtitle: "Sorunuzu iletin, atölye temsilcimiz derhal cevaplasın.",
    inputPlaceholder: "Mesajınızı yazın...",
    operatorTyping: "Temsilci yazıyor",
    endChatBtn: "Sohbeti Bitir",
    endChatConfirm: "Canlı destek görüşmesini sonlandırmak istediğinize emin misiniz?",
    chatEndedTitle: "Sohbet Sonlandırıldı",
    chatEndedSubtitle: "Horwalle Atölyesi ile iletişime geçtiğiniz için teşekkür ederiz.",
    startNewChatBtn: "Yeni Sohbet Başlat",
    welcomeFormTitle: "Canlı Desteğe Hoş Geldiniz",
    welcomeFormDesc: "Siparişlerinizle ilgili size özel destek sunabilmemiz için bilgilerinizi giriniz:",
    nameLabel: "Adınız ve Soyadınız",
    namePlaceholder: "Örn: Mehmet Yılmaz",
    phoneLabel: "İletişim Numaranız",
    phonePlaceholder: "+90 555 123 45 67",
    startChatSubmit: "Sohbete Başla",
    nameRequired: "Lütfen adınızı giriniz",
    liveChatAria: "Canlı Destek",
    closeAria: "Sohbeti kapat",
  },
};

export function FloatingWhatsApp() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const t = CHAT_I18N[language as keyof typeof CHAT_I18N] || CHAT_I18N.az;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(true);
  const [isTypingAdmin, setIsTypingAdmin] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isChatClosed, setIsChatClosed] = useState(false);

  // Onboarding Lead Form state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadError, setLeadError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastKnownMsgIdRef = useRef<string>("");
  const hasInitializedSoundRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<any>(null);

  const phoneNumber = "+994 10 328 31 52";
  const whatsappUrl =
    "https://wa.me/994103283152?text=" +
    encodeURIComponent("Salam! Horwalle atelyesinə yazıram. Məhsul və ya sifarişlə bağlı kömək edə bilərsiniz?");

  // Initialize unique customer session ID & onboarding check
  useEffect(() => {
    let sid = "";
    try {
      sid = localStorage.getItem("hv_livechat_session_id") || "";
      const savedName = localStorage.getItem("hv_livechat_customer_name") || "";
      const savedPhone = localStorage.getItem("hv_livechat_customer_phone") || "";

      if (savedName) setLeadName(savedName);
      if (savedPhone) setLeadPhone(savedPhone);

      // If user is already logged in, onboarding is auto-filled
      const autoName = profile?.full_name || user?.user_metadata?.full_name || "";
      if (autoName || savedName) {
        setHasCompletedOnboarding(true);
      } else {
        // If brand new visitor with no messages yet, show onboarding
        setHasCompletedOnboarding(false);
      }

      if (!sid) {
        sid = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("hv_livechat_session_id", sid);
      }
    } catch {
      sid = `cust_${Date.now()}`;
    }
    setSessionId(sid);
  }, [profile, user]);

  // Poll for messages and admin status (Fast 1.5s interval)
  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    const pollChat = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}&role=customer&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && active) {
            const thread = data.thread;
            setIsAdminOnline(thread?.adminOnline ?? true);
            setIsTypingAdmin(Boolean(thread?.isTypingAdmin));
            setIsChatClosed(Boolean(thread?.isClosed));

            const fetchedMessages: Message[] = data.messages || [];

            // If there are existing messages in this session, user already onboarded
            if (fetchedMessages.length > 0) {
              setHasCompletedOnboarding(true);
            }

            // Check for new incoming message sound
            if (fetchedMessages.length > 0) {
              const lastMsg = fetchedMessages[fetchedMessages.length - 1];
              if (
                hasInitializedSoundRef.current &&
                lastKnownMsgIdRef.current &&
                lastMsg.id !== lastKnownMsgIdRef.current &&
                lastMsg.sender === "admin"
              ) {
                playMessageReceivedSound();
                if (!isChatOpen) {
                  setUnreadCount((prev) => prev + 1);
                }
              }
              lastKnownMsgIdRef.current = lastMsg.id;
              hasInitializedSoundRef.current = true;
            } else {
              hasInitializedSoundRef.current = true;
            }

            // Sync messages list cleanly preserving pending local optimistic messages
            setMessages((prev) => {
              const pendingTemps = prev.filter((m) => m.id.startsWith("temp_"));
              if (pendingTemps.length === 0) {
                if (
                  prev.length === fetchedMessages.length &&
                  prev[prev.length - 1]?.id === fetchedMessages[fetchedMessages.length - 1]?.id &&
                  prev[prev.length - 1]?.status === fetchedMessages[fetchedMessages.length - 1]?.status
                ) {
                  return prev;
                }
                return fetchedMessages;
              }

              // Filter out temp messages that are now present in fetchedMessages
              const remainingTemps = pendingTemps.filter(
                (temp) => !fetchedMessages.some((fm) => fm.text === temp.text && Math.abs(fm.timestamp - temp.timestamp) < 10000)
              );
              return [...fetchedMessages, ...remainingTemps];
            });
          }
        }
      } catch (e) {
        // silent
      }
    };

    pollChat();
    const interval = setInterval(pollChat, 1500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sessionId, isChatOpen]);

  // Reset unread count when opening chat & lock background scroll on all devices
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Stop background page scrolling on desktop (Lenis) and mobile (body overflow)
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.stop();
        } catch {}
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        if (typeof window !== "undefined" && (window as any).__lenis) {
          try {
            (window as any).__lenis.start();
          } catch {}
        }
      };
    }
  }, [isChatOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

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

  // Submit onboarding lead form
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = leadName.trim();
    const cleanPhone = leadPhone.trim();

    if (!cleanName) {
      setLeadError(t.nameRequired);
      return;
    }

    try {
      localStorage.setItem("hv_livechat_customer_name", cleanName);
      if (cleanPhone) localStorage.setItem("hv_livechat_customer_phone", cleanPhone);
    } catch {}

    setHasCompletedOnboarding(true);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "set_customer_info",
          customerName: cleanName,
          customerPhone: cleanPhone,
          customerEmail: user?.email || undefined,
        }),
      });
    } catch {}
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !sessionId || isChatClosed) return;

    setInputText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const customerName =
      leadName ||
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      (user?.email ? user.email.split("@")[0] : "Müştəri");
    const customerPhone = leadPhone || profile?.phone || undefined;
    const customerEmail = user?.email || undefined;

    // Optimistic local add with "sending" status
    const tempId = `temp_${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      sender: "customer",
      text,
      timestamp: Date.now(),
      status: "sending",
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
          customerPhone,
          customerEmail,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          lastKnownMsgIdRef.current = data.message.id;
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...data.message, status: "delivered" } : m))
          );
        }
      }
    } catch (e) {
      // mark as sent fallback
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "sent" } : m))
      );
    }
  };

  // End Chat Action
  const handleEndChat = async () => {
    if (!confirm(t.endChatConfirm)) return;
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "end_chat",
        }),
      });
      setIsChatClosed(true);
    } catch {}
  };

  // Start New Chat (Resets session)
  const handleStartNewChat = () => {
    const newSid = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    try {
      localStorage.setItem("hv_livechat_session_id", newSid);
    } catch {}
    setSessionId(newSid);
    setMessages([]);
    setIsChatClosed(false);
    lastKnownMsgIdRef.current = "";
    hasInitializedSoundRef.current = false;
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
          aria-label={t.headerTitle}
          className="fixed inset-x-2 bottom-24 sm:static sm:inset-auto w-[calc(100vw-1rem)] sm:w-[390px] h-[calc(100dvh-7.5rem)] sm:h-[530px] max-h-[640px] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right z-50 overscroll-contain"
        >
          {/* Header */}
          <div className="bg-[#111111] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-stone-800 shrink-0">
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
                  title={isAdminOnline ? t.onlineBadge : t.offlineBadge}
                />
              </div>

              <div>
                <h4 className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <span>{t.headerTitle}</span>
                  <ShieldCheck size={13} className="text-[#E6C280]" />
                </h4>
                <div className="text-[10.5px] text-stone-400 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAdminOnline ? "bg-emerald-400 animate-pulse" : "bg-stone-500"
                    }`}
                  />
                  <span>{isAdminOnline ? t.onlineBadge : t.offlineBadge}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* End chat button */}
              {hasCompletedOnboarding && !isChatClosed && messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleEndChat}
                  className="px-2 py-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-rose-400 transition text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  title={t.endChatBtn}
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">{t.endChatBtn}</span>
                </button>
              )}

              {/* Close window button */}
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition cursor-pointer"
                aria-label={t.closeAria}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ─── CASE A: FIRST VISIT ONBOARDING FORM ───────────────────────────── */}
          {!hasCompletedOnboarding ? (
            <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-center bg-[#FAF7F2]/60">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-sm text-left">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center mb-3">
                  <User size={18} className="text-[#E6C280]" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 mb-1">{t.welcomeFormTitle}</h3>
                <p className="text-[11.5px] text-stone-500 mb-4 leading-relaxed">{t.welcomeFormDesc}</p>

                <form onSubmit={handleOnboardingSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {t.nameLabel} *
                    </label>
                    <div className="relative">
                      <User size={14} className="text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={leadName}
                        onChange={(e) => {
                          setLeadName(e.target.value);
                          setLeadError("");
                        }}
                        placeholder={t.namePlaceholder}
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-black font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {t.phoneLabel}
                    </label>
                    <div className="relative">
                      <Phone size={14} className="text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-black font-medium transition"
                      />
                    </div>
                  </div>

                  {leadError && (
                    <p className="text-[11px] text-rose-600 font-medium">{leadError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    {t.startChatSubmit}
                  </button>
                </form>
              </div>
            </div>
          ) : isChatClosed ? (
            /* ─── CASE B: CHAT ENDED SCREEN ───────────────────────────────────── */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-[#FAF7F2]/60">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 mb-3 shadow-xs">
                <CheckCheck size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 mb-1">{t.chatEndedTitle}</h3>
              <p className="text-xs text-stone-500 max-w-[260px] mb-6 leading-relaxed">
                {t.chatEndedSubtitle}
              </p>
              <button
                type="button"
                onClick={handleStartNewChat}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{t.startNewChatBtn}</span>
              </button>
            </div>
          ) : (
            /* ─── CASE C: ACTIVE LIVE CONVERSATION ────────────────────────────── */
            <>
              {/* Messages Container */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/60 overscroll-contain">
                {/* Welcome banner */}
                <div className="text-center py-1">
                  <span className="text-[11px] bg-white border border-stone-200/80 px-3 py-1 rounded-full text-stone-500 shadow-2xs font-medium">
                    {t.welcomeBadge}
                  </span>
                </div>

                {messages.length === 0 && (
                  <div className="text-center text-xs text-stone-400 pt-10">
                    {t.welcomeSubtitle}
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
                        className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isCust
                            ? "bg-[#111111] text-white rounded-br-xs"
                            : "bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      </div>

                      {/* Timestamp & WhatsApp Status Checks */}
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[9.5px] text-stone-400">
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isCust && <MessageStatusIcon status={m.status} />}
                      </div>
                    </div>
                  );
                })}

                {/* Admin typing indicator animation */}
                {isTypingAdmin && (
                  <div className="flex items-center gap-2 text-xs text-stone-600 bg-white/90 border border-stone-200/90 px-3.5 py-2 rounded-2xl w-fit shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-[11px] font-medium text-stone-700">{t.operatorTyping}</span>
                    <span className="flex gap-1 items-center pt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#B08D57] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-[#B08D57] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-[#B08D57] rounded-full animate-bounce" />
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer: 16px font-size to strictly prevent iOS auto-zoom */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 bg-stone-100 border border-stone-200/80 rounded-full px-4 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-none focus:border-stone-400 placeholder:text-stone-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-full bg-[#111111] hover:bg-black text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shadow-sm shrink-0 active:scale-95"
                  aria-label="Göndər"
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ─── FLOATING ACTION BUTTONS STACK (Without hover tooltips) ───────────── */}
      <div className="flex flex-col items-center gap-3">
        {/* 1. TOP BUTTON: LIVE CHAT TRIGGER */}
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label={t.liveChatAria}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111111] hover:bg-black text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-black/10 cursor-pointer"
        >
          {isChatOpen ? (
            <X size={26} className="text-white" />
          ) : (
            <>
              <MessageCircle size={28} className="text-white" />
              {/* Online Green Indicator */}
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              {/* Unread badge counter */}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </button>

        {/* 2. BOTTOM BUTTON: OFFICIAL WHATSAPP TRIGGER */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp: ${phoneNumber}`}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-[#25D366]/25 cursor-pointer"
        >
          {/* Subtle radar pulse glow */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

          {/* Official WhatsApp Logo Icon */}
          <WhatsAppBrandIcon className="w-8 h-8 text-white relative z-10" />
        </a>
      </div>
    </aside>
  );
}

export default FloatingWhatsApp;
