"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { CloudflareTurnstile } from "@/components/CloudflareTurnstile";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const { t } = useLanguage();

  useBodyScrollLock(isAuthModalOpen);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg(t.checkout.fullName);
          setIsSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(t.auth.registrationSuccess || "Qeydiyyat tamamlandı! İndi daxil olun.");
          setPassword("");
          setMode("signin");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overscroll-contain"
      onClick={closeAuthModal}
    >
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-stone-900 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
            <Lock size={12} />
            <span>HORVVALLE SECURE AUTH</span>
          </div>
          <h2 className="font-eb-garamond text-2xl sm:text-3xl font-normal text-stone-900">
            {mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {mode === "signin"
              ? t.checkout.loginPrompt
              : t.auth.signUp}
          </p>
        </div>

        {/* Google 1-Click Button */}
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t.auth.signInWithGoogle}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-stone-200 flex-1" />
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            {t.account.status || "EMAIL"}
          </span>
          <div className="h-px bg-stone-200 flex-1" />
        </div>

        {/* Error / Success Alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
            >
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
            >
              <Check size={15} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-700 uppercase">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-700 uppercase">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-stone-700 uppercase">
                {t.auth.password}
              </label>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile Verification */}
          <CloudflareTurnstile
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <span>...</span>
            ) : (
              <>
                <span>{mode === "signin" ? t.auth.signIn : t.auth.signUp}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2">
          {mode === "signin" ? (
            <p className="text-xs text-stone-500">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className="font-bold text-stone-900 underline hover:text-black cursor-pointer"
              >
                {t.auth.dontHaveAccount}
              </button>
            </p>
          ) : (
            <p className="text-xs text-stone-500">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className="font-bold text-stone-900 underline hover:text-black cursor-pointer"
              >
                {t.auth.alreadyHaveAccount}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
