import { Resend } from "resend";
import {
  generateOrderConfirmationHtml,
  generateStatusUpdateHtml,
  generateCampaignHtml,
} from "./emailTemplates";
import { supabaseServer } from "@/lib/supabaseServer";

// Resend client initialization with fallback
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/** True when real e-mails can be sent (a Resend API key is configured). */
export function isEmailConfigured(): boolean {
  return Boolean(resend);
}

const SENDER_EMAIL = process.env.EMAIL_FROM || "HORVVALLE <orders@horvvalle.com>";

/**
 * Sends order confirmation email to the customer.
 */
export async function sendOrderConfirmation(order: any): Promise<boolean> {
  const customerEmail = order?.customer?.email;
  if (!customerEmail || !customerEmail.includes("@")) {
    console.log("[EmailService] No valid customer email provided for order confirmation:", order?.id);
    return false;
  }

  const html = generateOrderConfirmationHtml(order);

  if (!resend) {
    console.log(`[EmailService:SIMULATED] Order confirmation to ${customerEmail} for order #${order.id}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [customerEmail],
      subject: `HORVVALLE — Sifarişiniz Qəbul Edildi #${order.id}`,
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

  const html = generateStatusUpdateHtml(order, newStatus);

  if (!resend) {
    console.log(`[EmailService:SIMULATED] Status update to ${customerEmail} for #${order.id}: ${newStatus}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [customerEmail],
      subject: `HORVVALLE — Sifarişinizin Statusu: ${newStatus} (#${order.id})`,
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
  const html = generateCampaignHtml({ headline, message, promoCode, ctaLink });

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
