/**
 * Server-Side Cloudflare Turnstile Verification Helper
 * Validates the token sent from frontend against Cloudflare Siteverify API
 */
export async function verifyTurnstileToken(token: string | undefined | null, clientIp?: string): Promise<{ success: boolean; error?: string }> {
  // If no secret key is configured (e.g. dev environment), allow gracefully
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "0x4AAAAAAF0wCP4_02vvTtRUdq5winSZDZQ";

  if (!token) {
    return { success: false, error: "Təhlükəsizlik yoxlanışı tamamlanmayıb (Turnstile token tapılmadı)." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      console.warn("[Cloudflare Turnstile] Verification failed:", data["error-codes"]);
      return {
        success: false,
        error: "Bot və ya təhlükəsizlik yoxlamasından keçilmədi. Zəhmət olmasa səhifəni yeniləyib yenidən cəhd edin.",
      };
    }
  } catch (err: any) {
    console.error("[Cloudflare Turnstile] Exception during verify:", err);
    // On unexpected network timeout to Cloudflare, log but prevent hard failure unless strictly enforced
    return { success: false, error: "Təhlükəsizlik xidmətinə qoşulma xətası." };
  }
}
