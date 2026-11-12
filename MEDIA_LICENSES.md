# Media licences

## Home page intro video

Files: `public/videos/horwalle-intro-desktop.mp4`, `public/videos/horwalle-intro-mobile.mp4`
and their poster images (`.jpg`).

These are Horwalle's own edit (cut, crop, triptych layout, colour grade) made on 2026-11-12
with `scripts/media/make-intro-video.py` from these free stock clips:

| Pexels video | Used for |
|---|---|
| https://www.pexels.com/video/8128354/ | dark close-up, black hoodie |
| https://www.pexels.com/video/6322410/ | hoodie against a textured wall |
| https://www.pexels.com/video/6322407/ | hoodie against a light wall |
| https://www.pexels.com/video/10378651/ | night bridge, hood up |

Licence: [Pexels License](https://www.pexels.com/license/) — free for commercial use,
no attribution required, modification allowed. Not allowed: selling unaltered copies,
implying the people shown endorse Horwalle, showing them in a bad light.
None of the clips shows a brand logo.

## Home and category photos

Default photos in `components/store/photos.ts` come from Unsplash under the
[Unsplash License](https://unsplash.com/license) (free for commercial use, no attribution
required). They show real people and are not exclusive; replace them with your own
photos in Admin → Sayt kontenti / Kateqoriyalar when available.

## "Bakı Seriyası 01" product photos

Product images in Storage `product-images/products/collection01-photo/` are Horwalle's own
composites (2026-11-12): real photos of blank garments, cut out, cleaned and recoloured,
with our original designs placed on them (`scripts/media/photo-cutout.py`,
`photo-blanks.py`, `photo-compose.py`). The tee "back" view is the same photo mirrored;
the hoodie back image is a close-up made from the hoodie photo's own fabric.
No people and no third-party logos are shown.

| Source photo | Used for | Licence |
|---|---|---|
| https://www.pexels.com/photo/8532616/ | black tee | Pexels License |
| https://www.pexels.com/photo/18257675/ | white tee | Pexels License |
| https://unsplash.com/photos/3b2a02fd9a77 (images.unsplash.com/photo-1620799140188-3b2a02fd9a77) | hoodie (white, recoloured black/grey) | Unsplash License |
| https://unsplash.com/photos/20e5c6d4bc92 (images.unsplash.com/photo-1691256676359-20e5c6d4bc92) | cap (recoloured black) | Unsplash License |

Both licences allow commercial use and modification without attribution. These are
stock photos of plain garments, so the blanks are not exclusive to Horwalle; replace them
with photos of the real printed products when samples exist.

## On-model product photos and the "Dəst" category photo

Files `product-images/products/collection01-photo/*-m1.jpg|*-m2.jpg` are our designs placed on
Pexels photos of people wearing plain garments (`scripts/media/photo-model.py`). The people
are stock models, not Horwalle staff or customers, and are not presented as endorsing the brand.
The category image `product-images/categories/dest-6310998.jpg` is the unmodified photo 6310998.

| Pexels photo | Used for |
|---|---|
| https://www.pexels.com/photo/8217461/ | white tee, front |
| https://www.pexels.com/photo/6311141/ | white tee, back |
| https://www.pexels.com/photo/4066293/ | black tee, front |
| https://www.pexels.com/photo/8217415/ | white hoodie, back |
| https://www.pexels.com/photo/6311619/ | black hoodie / joggers / Essential set, front |
| https://www.pexels.com/photo/6311506/ | black hoodie / joggers / Essential set, back |
| https://www.pexels.com/photo/9558786/ | white cap, Baku set |
| https://www.pexels.com/photo/6310998/ | "Dəst" category photo |

Licence: [Pexels License](https://www.pexels.com/license/) — commercial use and modification
allowed, no attribution required; the people shown must not be portrayed as endorsing us or
in a bad light. Replace with photos of the real products on your own models when available.

## "NOX" collection (2026-11-12)

Designs are original artwork drawn by `scripts/media/nox-designs.py` (thorn "sigil" lines, stars,
chrome lettering are generated shapes; the worn texture comes from `nox-distress.py`). Style
research looked at current gothic / grunge streetwear trends; no other brand's artwork was copied.
Fonts, all under the SIL Open Font License (free for commercial printing, text is converted to
outlines): UnifrakturMaguntia, Grenze Gotisch, Space Mono, Archivo (from github.com/google/fonts).
Product images reuse the photos listed above (`scripts/media/nox-images.py`).
