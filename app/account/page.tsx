"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Package,
  Clock,
  MapPin,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, signOut, isLoading, openAuthModal } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal();
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!user || !user.email) {
      setRecentOrders([]);
      setIsOrdersLoading(false);
      return;
    }

    // Clean up outdated test orders from local storage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("horvvalle_saved_orders");
      } catch (e) {}
    }

    let isMounted = true;
    setIsOrdersLoading(true);

    fetch(`/api/account/orders?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data && Array.isArray(data.orders)) {
            setRecentOrders(data.orders);
          } else {
            setRecentOrders([]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load user orders:", err);
        if (isMounted) setRecentOrders([]);
      })
      .finally(() => {
        if (isMounted) setIsOrdersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Hesab məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F2] px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-md">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-700">
            <User size={30} />
          </div>
          <h1 className="font-eb-garamond text-2xl sm:text-3xl font-normal text-stone-900">
            Hesabınıza daxil olun
          </h1>
          <p className="text-xs text-stone-500">
            Sifarişlərinizi idarə etmək və profilinizə baxmaq üçün zəhmət olmasa daxil olun.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            Daxil Ol / Qeydiyyat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 pt-8 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition">Ana Səhifə</Link>
          <ChevronRight size={14} className="text-stone-400" />
          <span className="text-stone-900 font-medium">Müştəri Hesabı</span>
        </div>

        {/* User Welcome Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-eb-garamond text-2xl font-bold shadow-sm">
              {(profile?.full_name || user.email || "H")[0].toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck size={12} className="text-amber-700" />
                <span>Rəsmi Müştəri</span>
              </div>
              <h1 className="font-eb-garamond text-2xl sm:text-3xl font-normal text-stone-900">
                {profile?.full_name || "Hörmətli Müştəri"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-stone-400" />
                  {user.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-stone-400" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <LogOut size={14} />
            <span>Hesabdan Çıx</span>
          </button>
        </div>

        {/* Content Grid: Orders & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Section (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-eb-garamond text-2xl font-normal text-stone-900 flex items-center gap-2">
                <Package size={20} className="text-stone-700" />
                <span>Son Sifarişlərim</span>
              </h2>
              <Link
                href="/track"
                className="text-xs font-semibold text-[#B08D57] hover:underline flex items-center gap-1"
              >
                <span>Sifarişi İzlə</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {isOrdersLoading ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500">Sifarişləriniz yoxlanılır...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-3">
                <Package size={36} className="text-stone-300 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">Hələ heç bir sifarişiniz yoxdur</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Bu e-poçt ünvanı ilə hələ heç bir sifariş qeydə alınmayıb. Kolleksiyamıza baxaraq bəyəndiyiniz lüks geyimi seçə bilərsiniz.
                </p>
                <div className="pt-2">
                  <Link
                    href="/collections"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    Kolleksiyanı Kəşf Et
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:shadow-xs transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-sm text-stone-900">#{ord.id}</span>
                        <div className="text-[11px] text-stone-500">
                          {new Date(ord.date || Date.now()).toLocaleDateString("az-AZ", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {ord.orderStatus || "Yeni Sifariş"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-600">
                        Məbləğ: <strong className="text-stone-900">{formatPrice(ord.total || 0)}</strong>
                      </span>
                      <Link
                        href={`/track?orderId=${ord.id}`}
                        className="inline-flex items-center gap-1 font-bold text-[#B08D57] hover:underline"
                      >
                        <span>İzləməyə Bax</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Address & Quick Support (Right 1 column) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-eb-garamond text-xl font-normal text-stone-900 flex items-center gap-2">
                <MapPin size={18} className="text-stone-700" />
                <span>Çatdırılma Ünvanı</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {profile?.address ? (
                  <>
                    <strong className="block text-stone-900">{profile.city || "Bakı"}</strong>
                    {profile.address}
                  </>
                ) : (
                  <span className="text-stone-400 italic">
                    Hələ heç bir ünvan qeyd olunmayıb. Sifariş verərkən ünvanınız avtomatik yadda saxlanılacaq.
                  </span>
                )}
              </p>
            </div>

            <div className="bg-gradient-to-br from-stone-900 to-black text-white rounded-3xl p-6 shadow-md space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E6C280]">
                FƏRDİ MÜŞTƏRİ MENECERİ
              </span>
              <h4 className="font-eb-garamond text-xl font-normal">
                Suallarınız və ya fərdi sifarişiniz var?
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                WhatsApp dəstək xətti 7/24 xidmətinizdədir.
              </p>
              <a
                href="https://wa.me/994557669050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-[#E6C280] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#d4b06d] transition"
              >
                WhatsApp ilə Yaz
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

