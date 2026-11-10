/**
 * Free Order Notification Dispatcher
 * Sends instant notifications to phone via:
 * 1. Telegram Bot (private bot with chat_id)
 * 2. NTFY Push Notifications (configurable private topic or self-hosted server)
 */

function maskPhone(phone: string): string {
  if (!phone) return '-';
  const clean = phone.trim();
  if (clean.length <= 6) return '***';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-2);
  return `${prefix}***${suffix}`;
}

function maskName(name: string): string {
  if (!name) return 'Müştəri';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p.length > 1 ? `${p[0]}***` : p).join(' ');
}

function maskAddress(order: any): string {
  // Only reveal city and country on push alerts, never exact apartment/street
  const city = order.customer?.city || '';
  const country = order.customer?.country || 'Azərbaycan';
  return [city, country].filter(Boolean).join(', ') || 'Ünvan qeyd olunub';
}

export async function notifyNewOrder(order: any) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const isNtfyDisabled = process.env.DISABLE_NTFY === 'true';
    const ntfyServerUrl = process.env.NTFY_SERVER_URL || 'https://ntfy.sh';
    const ntfyTopic = process.env.NTFY_TOPIC;
    const ntfyToken = process.env.NTFY_ACCESS_TOKEN;

    const itemsSummary = (order.items || [])
      .map((item: any) => {
        let line = `• ${item.quantity || 1}x ${item.name} (${item.color || ""}, ${item.size || ""}) — ${((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)} ₼`;
        if (item.customData?.placement) {
          line += `\n   ↳ 📍 Dizaynın yeri: ${item.customData.placement}`;
        }
        if (item.customData?.customerNote) {
          line += `\n   ↳ 📝 Qeyd: "${item.customData.customerNote}"`;
        }
        return line;
      })
      .join("\n");

    const destinationParts = [
      order.customer?.address,
      order.customer?.addressLine2,
      order.customer?.city,
      order.customer?.stateOrRegion,
      order.customer?.postalCode,
      order.customer?.country || "Azərbaycan",
    ].filter(Boolean);
    const destinationStr = destinationParts.join(", ") || "-";
    const carrierStr = order.shippingMethodLabel
      ? `${order.shippingMethodLabel}${order.estimatedDelivery ? ` (${order.estimatedDelivery})` : ""}`
      : (order.shippingMethod || "Kuryer");
    const currencyStr = order.currency || "AZN";
    const shippingStr = Number(order.shipping || 0) === 0 ? "PULSUZ" : `${Number(order.shipping || 0).toFixed(2)} ${currencyStr}`;

    const promises: Promise<any>[] = [];

    // 1. Send via Telegram Bot (if configured)
    if (telegramToken && telegramChatId) {
      const messageText =
        `🛍 *YENİ SİFARİŞ GƏLDİ! (HORVVALLE)*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 *Sifariş №:* \`${order.id}\`\n` +
        `👤 *Müştəri:* ${order.customer?.fullName || "Müştəri"}\n` +
        `📞 *Əlaqə:* ${order.customer?.phone || "-"}\n` +
        `📍 *Ünvan:* ${destinationStr}\n` +
        `🚚 *Çatdırılma:* ${carrierStr} — ${shippingStr}\n` +
        `💳 *Ödəniş:* ${order.paymentMethod || "Kart"}\n` +
        `💰 *Yekun Məbləğ:* *${Number(order.total || 0).toFixed(2)} ${currencyStr}*\n\n` +
        `🛒 *Məhsullar:*\n${itemsSummary}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `⏰ ${new Date().toLocaleString("az-AZ")}`;

      promises.push(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: "Markdown",
          }),
        }).catch((e) => console.warn("Telegram notification error:", e.message))
      );
    }

    // 2. Send via NTFY push service (gated behind configured topic, with masked PII)
    if (!isNtfyDisabled && ntfyTopic) {
      const maskedCustomerName = maskName(order.customer?.fullName || "Müştəri");
      const maskedPhone = maskPhone(order.customer?.phone || "");
      const maskedDest = maskAddress(order);

      const ntfyHeaders: Record<string, string> = {
        // Headers in Node fetch must be ISO-8859-1 / ASCII: no raw unicode/emojis
        Title: `New Order: ${order.id} (${Number(order.total || 0).toFixed(2)} ${currencyStr})`,
        Priority: "urgent",
        Tags: "shopping_bags,moneybag,bell",
      };
      if (ntfyToken) {
        ntfyHeaders["Authorization"] = `Bearer ${ntfyToken}`;
      }

      const ntfyBody = `Müştəri: ${maskedCustomerName} (${maskedPhone})\nÜnvan: ${maskedDest}\nÇatdırılma: ${carrierStr} (${shippingStr})\nMəbləğ: ${Number(order.total || 0).toFixed(2)} ${currencyStr}\n${(order.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}`;

      const ntfyEndpoint = `${ntfyServerUrl.replace(/\/+$/, '')}/${encodeURIComponent(ntfyTopic)}`;
      promises.push(
        fetch(ntfyEndpoint, {
          method: "POST",
          headers: ntfyHeaders,
          body: ntfyBody,
        }).catch((e) => console.warn("NTFY push notification error:", e.message))
      );
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  } catch (error) {
    console.warn("Order notification error:", error);
  }
}
