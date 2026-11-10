// app/admin/live-chat/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { PlayIcon, Send } from "lucide-react";
import { playMessageReceivedSound, playMessageSentSound } from "@/lib/chatSound";

interface ChatMessage {
  id: string;
  sender: "customer" | "admin";
  text: string;
  timestamp: number;
}

interface ChatThread {
  sessionId: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadAdmin: number;
  unreadCustomer: number;
  customerOnline?: boolean;
  adminOnline?: boolean;
  isTypingCustomer?: boolean;
  isTypingAdmin?: boolean;
  createdAt: number;
}

export default function AdminLiveChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const lastMsgIdRef = useRef<string>("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load thread list once
  useEffect(() => {
    const fetchThreads = async () => {
      const res = await fetch("/api/chat/threads");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    };
    fetchThreads();
  }, []);

  // When a thread is selected, start polling its messages / status
  useEffect(() => {
    if (!selectedThread) return;
    const sessionId = selectedThread.sessionId;
    const poll = async () => {
      const res = await fetch(`/api/chat?sessionId=${sessionId}&role=admin`);
      if (!res.ok) return;
      const data = await res.json();
      const thread: ChatThread = data.thread;
      const msgs: ChatMessage[] = data.messages || [];
      // Update thread info (online / typing)
      setSelectedThread(thread);
      // Detect new incoming customer message for sound
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.id !== lastMsgIdRef.current && lastMsg.sender === "customer") {
          playMessageReceivedSound();
        }
        lastMsgIdRef.current = lastMsg.id;
      }
      setMessages(msgs);
    };
    // Initial poll
    poll();
    // Set interval
    pollingRef.current = setInterval(poll, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedThread]);

  // Send admin typing notifications
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!selectedThread) return;
    if (isTyping) {
      // reset debounce
      clearTimeout((window as any).__adminTypingTimeout);
    } else {
      setIsTyping(true);
    }
    // send typing=true
    fetch(
      `/api/chat?sessionId=${selectedThread.sessionId}&role=admin&typing=true`
    ).catch(() => {});
    (window as any).__adminTypingTimeout = setTimeout(() => {
      fetch(
        `/api/chat?sessionId=${selectedThread.sessionId}&role=admin&typing=false`
      ).catch(() => {});
      setIsTyping(false);
    }, 2500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread) return;
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    // Optimistic UI
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: "admin",
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
          sessionId: selectedThread.sessionId,
          sender: "admin",
          text,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // replace temp with real message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? data.message : m))
        );
        lastMsgIdRef.current = data.message.id;
      }
    } catch (e) {
      // on error remove temp message
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
  };

  const renderThreadItem = (thread: ChatThread) => {
    const isSelected = selectedThread?.sessionId === thread.sessionId;
    return (
      <div
        key={thread.sessionId}
        className={`p-3 cursor-pointer hover:bg-stone-100 flex justify-between items-center ${
          isSelected ? "bg-stone-200" : ""
        }`}
        onClick={() => setSelectedThread(thread)}
      >
        <div className="flex flex-col">
          <span className="font-medium text-sm">{thread.customerName}</span>
          <span className="text-xs text-stone-500">{new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        {thread.unreadAdmin > 0 && (
          <span className="bg-rose-600 text-white text-xs rounded-full px-2 py-0.5">
            {thread.unreadAdmin}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-dvh bg-white">
      {/* Sidebar thread list */}
      <aside className="w-64 border-r border-stone-300 overflow-y-auto">
        <h2 className="p-4 font-sans text-lg font-semibold">Müştəri Söhbətləri</h2>
        {threads.map(renderThreadItem)}
      </aside>

      {/* Chat window */}
      <main className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <header className="flex items-center justify-between p-4 bg-[#111111] text-white">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedThread.customerName}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedThread.customerOnline ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  title={selectedThread.customerOnline ? "Müştəri onlayndır" : "Müştəri offline"}
                />
                {selectedThread.isTypingCustomer && (
                  <span className="text-xs text-stone-300 animate-pulse">Müştəri yazır...</span>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === "admin"
                        ? "bg-[#111111] text-white rounded-br-xs"
                        : "bg-gray-100 text-stone-900 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                    <div className="text-xs text-stone-400 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="p-3 border-t flex items-center gap-2 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Cavabınızı daxil edin…"
                className="flex-1 border border-stone-300 rounded-full px-4 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-[#111111] text-white rounded-full disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-500">
            Bir söhbət seçin
          </div>
        )}
      </main>
    </div>
  );
}
