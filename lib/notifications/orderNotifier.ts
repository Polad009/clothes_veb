/**
 * Free Order Notification Dispatcher
 * Sends instant notifications to phone via:
 * 1. Telegram Bot (100% free, unlimited, instant push messages)
 * 2. NTFY Push Notifications (100% free, open source, no signup needed)
 */

export async function notifyNewOrder(order: any) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const ntfyTopic = process.env.NTFY_TOPIC || "horvvalle_orders";

    const itemsSummary = (order.items || [])
      .map((item: any) => {
        let line = `• ${item.quantity || 1}x ${item.name} (${item.color || ""}, ${item.size || ""}) — ${((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)} ₼`;
        if (item.customData?.placement) {
          line += `\n   ↳ 📍 Çap hissəsi: ${item.customData.placement}`;
        }
        if (item.customData?.customerNote) {
          line += `\n   ↳ 📝 Qeyd: "${item.customData.customerNote}"`;
        }
        return line;
      })
      .join("\n");

    const messageText =
      `🛍 *YENİ SİFARİŞ GƏLDİ! (HORVVALLE)*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Sifariş №:* \`${order.id}\`\n` +
      `👤 *Müştəri:* ${order.customer?.fullName || "Müştəri"}\n` +
      `📞 *Əlaqə:* ${order.customer?.phone || "-"}\n` +
      `📍 *Ünvan:* ${order.customer?.city || "Bakı"}, ${order.customer?.address || "-"}\n` +
      `💳 *Ödəniş:* ${order.paymentMethod || "Kart"}\n` +
      `💰 *Yekun Məbləğ:* *${Number(order.total || 0).toFixed(2)} ₼*\n\n` +
      `🛒 *Məhsullar:*\n${itemsSummary}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⏰ ${new Date().toLocaleString("az-AZ")}`;

    // 1. Send via Telegram Bot (if configured)
    if (telegramToken && telegramChatId) {
      fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: messageText,
          parse_mode: "Markdown",
        }),
      }).catch((e) => console.warn("Telegram notification error:", e.message));
    }

    // 2. Send via NTFY free push service
    if (ntfyTopic) {
      fetch(`https://ntfy.sh/${encodeURIComponent(ntfyTopic)}`, {
        method: "POST",
        headers: {
          Title: `🛍 Yeni Sifaris: ${order.id} (${Number(order.total || 0).toFixed(2)} AZN)`,
          Priority: "urgent",
          Tags: "shopping_bags,moneybag,bell",
        },
        body: `Müştəri: ${order.customer?.fullName || "Müştəri"} (${order.customer?.phone || ""})\nÜnvan: ${order.customer?.city || "Bakı"}, ${order.customer?.address || ""}\nMəbləğ: ${Number(order.total || 0).toFixed(2)} AZN\n${(order.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}`,
      }).catch((e) => console.warn("NTFY push notification error:", e.message));
    }
  } catch (error) {
    console.warn("Order notification error:", error);
  }
}
