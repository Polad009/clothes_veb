// Editorial photos for the home page (free Unsplash licence: https://unsplash.com/license).
// Each one can be replaced from the admin panel (hero / category / studio image).

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

export const DEFAULT_PHOTOS: Record<string, string> = {
  hero: unsplash("photo-1647540573277-4954a0c302c5"),
  koynek: unsplash("photo-1747094600551-25d1cdddd46c"),
  hudi: unsplash("photo-1565986829115-4e19371ce860"),
  salvar: unsplash("photo-1660486044177-45cd45bb5e99"),
  aksesuar: unsplash("photo-1792273440038-426fac397e0e"),
  studio: unsplash("photo-1789110854055-fc924935fd09"),
};
