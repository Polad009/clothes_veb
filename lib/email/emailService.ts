import { Resend } from "resend";
import {
  orderLang,
  generateOrderConfirmationHtml,
  generateStatusUpdateHtml,
  generateCampaignHtml,
  generateNewOrderAlertHtml,
  generateLowStockAlertHtml,
  generateBackInStockHtml,
} from "./emailTemplates";
import { LOW_STOCK } from "@/lib/stock";
import { supabaseServer } from "@/lib/supabaseServer";
import { getSettings } from "@/lib/db/site";
import { whatsappNumber } from "@/lib/contact";

/** Support number for the e-mail footer, as set in the admin panel. */
async function contact() {
  try {
    return { phone: whatsappNumber(await getSettings()) };
  } catch {
    return {};
  }
}

// Resend client initialization with fallback
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/** True when real e-mails can be sent (a Resend API key is configured). */
export function isEmailConfigured(): boolean {
  return Boolean(resend);
}

export const SENDER_EMAIL = process.env.EMAIL_FROM || "HORWALLE <orders@horwalle.com>";

/**
 * Tells the shop about a new order, at the address set in Admin → Tənzimləmələr → E-poçt.
 */
export async function sendNewOrderAlert(order: any): Promise<boolean> {
  let to = "";
  try {
    to = String((await getSettings() as any).orderNotifyEmail || "").trim();
  } catch {}
  if (!to || !to.includes("@") || !resend) return false;
  try {
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject: `Yeni sifariş ${order.id} — ${Number(order.total || 0).toFixed(2)} ${order.currency === "USD" ? "$" : "₼"}`,
      html: generateNewOrderAlertHtml(order, await contact()),
      ...(order?.customer?.email ? { replyTo: order.customer.email } : {}),
    });
    if (error) {
      console.error("[EmailService] New order alert failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[EmailService] Exception in sendNewOrderAlert:", err);
    return false;
  }
}

/**
 * After an order: tells the shop which stock-tracked colour/size combinations it bought
 * now have LOW_STOCK units or fewer left. Sent to the same address as new-order alerts.
 */
export async function sendLowStockAlert(order: any): Promise<boolean> {
  let to = "";
  try {
    to = String((await getSettings() as any).orderNotifyEmail || "").trim();
  } catch {}
  if (!to || !to.includes("@") || !resend) return false;

  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const bought = (order.items || []).filter((i: any) => !i.isCustom && uuid.test(String(i.productId || "")));
  if (!bought.length || !supabaseServer) return false;
  const sb = supabaseServer;

  try {
    const ids = Array.from(new Set(bought.map((i: any) => String(i.productId))));
    const { data: products } = await sb.from("products").select("id, name, track_stock").in("id", ids);
    const tracked = new Map((products || []).filter((p: any) => p.track_stock).map((p: any) => [p.id, p.name]));
    if (!tracked.size) return false;
    const { data: stock } = await sb
      .from("product_stock")
      .select("product_id, color, size, quantity")
      .in("product_id", Array.from(tracked.keys()));

    const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.horwalle.com").replace(/\/$/, "");
    const seen = new Set<string>();
    const rows: { name: string; color: string; size: string; left: number; adminUrl: string }[] = [];
    for (const item of bought) {
      const pid = String(item.productId);
      if (!tracked.has(pid)) continue;
      const key = `${pid}|${item.color || ""}|${item.size || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const row = (stock || []).find((s: any) => s.product_id === pid && (s.color || "") === (item.color || "") && (s.size || "") === (item.size || ""));
      const left = Math.max(0, Number(row?.quantity) || 0);
      if (left <= LOW_STOCK) {
        rows.push({ name: String(tracked.get(pid) || item.name), color: item.color || "", size: item.size || "", left, adminUrl: `${site}/admin/products/${pid}` });
      }
    }
    if (!rows.length) return false;

    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject: rows.some((r) => r.left === 0) ? `Stok bitdi: ${rows[0].name}` : `Stok azalır: ${rows[0].name}`,
      html: generateLowStockAlertHtml(rows, await contact()),
    });
    if (error) {
      console.error("[EmailService] Low stock alert failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[EmailService] Exception in sendLowStockAlert:", err);
    return false;
  }
}

/**
 * Back-in-stock e-mail to a customer who asked to be notified.
 * Azerbaijani for visitors who used the site in Azerbaijani, English for everyone else.
 */
export async function sendBackInStockEmail(input: {
  to: string;
  language: string;
  product: any;
  color: string;
  size: string;
}): Promise<boolean> {
  if (!resend || !input.to.includes("@")) return false;
  const lang: "az" | "en" = input.language === "az" ? "az" : "en";
  const product = input.product || {};
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.horwalle.com").replace(/\/$/, "");
  const name = lang === "en" ? product.translations?.en?.name || product.name : product.name;
  const colorObj = (product.colors || []).find((c: any) => c.name === input.color);
  const rawImage = String(colorObj?.image || product.image || "");
  const image = rawImage.startsWith("http") ? rawImage : rawImage ? `${site}${rawImage.startsWith("/") ? "" : "/"}${rawImage}` : "";
  const params = new URLSearchParams();
  if (input.color) params.set("color", input.color);
  if (input.size) params.set("size", input.size);
  const url = `${site}/products/${encodeURIComponent(product.slug || product.id)}${params.toString() ? `?${params}` : ""}`;
  try {
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [input.to],
      subject: lang === "en" ? `Back in stock: ${name}` : `Stoka gəldi: ${name}`,
      html: generateBackInStockHtml({ name, image, url, color: input.color, size: input.size }, lang, await contact()),
    });
    if (error) {
      console.error("[EmailService] Back-in-stock e-mail failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[EmailService] Exception in sendBackInStockEmail:", err);
    return false;
  }
}

/**
 * Sends order confirmation email to the customer.
 */
export async function sendOrderConfirmation(order: any): Promise<boolean> {
  const customerEmail = order?.customer?.email;
  if (!customerEmail || !customerEmail.includes("@")) {
    console.log("[EmailService] No valid customer email provided for order confirmation:", order?.id);
    return false;
  }

  const html = generateOrderConfirmationHtml(order, await contact());

  if (!resend) {
    console.log(`[EmailService:SIMULATED] Order confirmation to ${customerEmail} for order #${order.id}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [customerEmail],
      subject: orderLang(order) === "en" ? `HORWALLE — Order received #${order.id}` : `HORWALLE — Sifarişiniz Qəbul Edildi #${order.id}`,
      html,
    });

    if (error) {
      console.error("[EmailService] Error sending order confirmation:", error);
      return false;
    }

    console.log("[EmailService] Order confirmation sent successfully:", data?.id);
    return true;
  } catch (err) {
    console.error("[EmailService] Exception in sendOrderConfirmation:", err);
    return false;
  }
}

/**
 * Sends order status update email to the customer.
 */
export async function sendOrderStatusUpdate(order: any, newStatus: string): Promise<boolean> {
  const customerEmail = order?.customer?.email;
  if (!customerEmail || !customerEmail.includes("@")) {
    console.log("[EmailService] No customer email found for order status update:", order?.id);
    return false;
  }

  const html = generateStatusUpdateHtml(order, newStatus, await contact());

  if (!resend) {
    console.log(`[EmailService:SIMULATED] Status update to ${customerEmail} for #${order.id}: ${newStatus}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [customerEmail],
      subject: orderLang(order) === "en" ? `HORWALLE — Order update (#${order.id})` : `HORWALLE — Sifarişinizin Statusu: ${newStatus} (#${order.id})`,
      html,
    });

    if (error) {
      console.error("[EmailService] Error sending status update:", error);
      return false;
    }

    console.log("[EmailService] Status update email sent:", data?.id);
    return true;
  } catch (err) {
    console.error("[EmailService] Exception in sendOrderStatusUpdate:", err);
    return false;
  }
}

/**
 * Broadcasts marketing / campaign email to registered customer profiles or specified list.
 */
export async function sendBroadcastCampaign({
  subject,
  headline,
  message,
  promoCode,
  ctaLink,
}: {
  subject: string;
  headline: string;
  message: string;
  promoCode?: string;
  ctaLink?: string;
}): Promise<{ total: number; sent: number; failed: number }> {
  const html = generateCampaignHtml({ headline, message, promoCode, ctaLink }, await contact());

  // Recipients are the registered accounts (e-mail lives on the auth user, not the profile)
  let recipients: string[] = [];

  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      recipients = data.users
        .map((user) => user.email)
        .filter((em): em is string => Boolean(em && em.includes("@")));
    } catch (err) {
      console.error("[EmailService] Error fetching customers for broadcast:", err);
    }
  }

  // Deduplicate emails
  recipients = Array.from(new Set(recipients));

  if (recipients.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  if (!resend) {
    throw new Error("E-poçt xidməti qoşulmayıb (RESEND_API_KEY yoxdur), heç bir e-poçt göndərilmədi.");
  }

  let sent = 0;
  let failed = 0;

  // Send in chunks or sequentially
  for (const email of recipients) {
    try {
      const { error } = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [email],
        subject,
        html,
      });

      if (error) {
        failed++;
      } else {
        sent++;
      }
    } catch (err) {
      failed++;
    }
  }

  return { total: recipients.length, sent, failed };
}
