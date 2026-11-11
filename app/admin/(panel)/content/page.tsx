import { requireOwner } from "@/lib/adminSession";
import { getContent, getSettings } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v : "");

export default async function ContentPage() {
  await requireOwner();
  const [content, settings]: [any, any] = await Promise.all([getContent(), getSettings()]);
  const hero = content.hero || {};
  const studio = content.podBanner || {};
  return (
    <AdminPage narrow>
      <ContentEditor
        initial={{
          introVideo: {
            enabled: content.introVideo?.enabled !== false,
            desktop: str(content.introVideo?.desktop),
            mobile: str(content.introVideo?.mobile),
          },
          announcements: Array.isArray(content.announcements) ? content.announcements : [],
          whatsappNumber: settings.whatsappNumber || "",
          hero: { tag: str(hero.tag), title: str(hero.title), text: str(hero.text), photo: str(hero.photo), link: str(hero.link) },
          podBanner: {
            tag: str(studio.tag),
            title: str(studio.title),
            description: str(studio.description),
            ctaText: str(studio.ctaText),
            ctaLink: str(studio.ctaLink),
            photo: str(studio.photo),
          },
          i18n: content.i18n || {},
        }}
      />
    </AdminPage>
  );
}
