import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import crypto from "crypto";

// Lightweight server-side token verification (second layer after middleware)
function verifyTokenServer(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "horvvalle_super_secure_admin_secret_key_2026_98124";
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) return false;

    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const data = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
    if (!data.exp || data.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

interface AdminPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};

  // Check secret access key strictly: MUST be present in URL
  const rawAccess = resolvedParams.access;
  const accessKey = typeof rawAccess === "string" ? rawAccess.trim() : "";
  const expectedKey = (process.env.ADMIN_ACCESS_KEY || "horvvalle_portal_2026_xQ9mK").trim();
  const hasValidAccessKey = Boolean(accessKey && accessKey === expectedKey);

  // If secret access key is missing or invalid → 404
  if (!hasValidAccessKey) {
    notFound();
  }

  // Pass access parameter to iframe
  // Add build/timestamp cache-buster to prevent stale cached admin.html in browser
  const cacheBuster = `v=2026.04.${Date.now()}`;
  const iframeSrc = `/admin.html?access=${encodeURIComponent(expectedKey)}&${cacheBuster}`;

  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-[#090A0F] overflow-hidden m-0 p-0">
      <iframe
        src={iframeSrc}
        className="w-full h-full border-none m-0 p-0 block bg-[#090A0F]"
        title="HORWALLE İdarəetmə Portalı"
      />
    </div>
  );
}
