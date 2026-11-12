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

## "STORM" collection (horror / lightning / mentality, 2026-11-12)

Print designs (`scripts/media/storm-designs.py`) are built from these Pexels photos, reworked
(cropped, tone-mapped into screen-print style, faded or framed, combined with type) — never
sold as unaltered copies, which the Pexels License does not allow:

| Pexels photo | Design |
|---|---|
| https://www.pexels.com/photo/15580058/ | Strike (lightning) |
| https://www.pexels.com/photo/10349161/ | Born in the Storm |
| https://www.pexels.com/photo/5611491/ | Mentality (skull) |
| https://www.pexels.com/photo/36218813/ | Half Dead (skull) |
| https://www.pexels.com/photo/12660640/ | Save Yourself (hands) |

Type: Anton, Space Mono, UnifrakturMaguntia (SIL Open Font License). Bolt icon drawn by the script.
Product images: `scripts/media/storm-images.py` on the photos listed above.

## "ƏSAS 01" and "ZƏRİF 01" product photos (2026-11-12)

Files in Storage `product-images/products/photo/` and the section photos
`product-images/categories/don-*.jpg`, `etek-*.jpg`, `ust-geyim-*.jpg` are free Unsplash stock photos
([Unsplash License](https://unsplash.com/license): commercial use and modification allowed, no
attribution required), cropped to 4:5 and otherwise unchanged (`scripts/media/esas-zerif.ts`).
Only photos from the free library were taken (no Unsplash+).

They show stock models wearing plain garments of the same type, colour and cut as the listed
product. They are NOT photos of Horwalle's own garments: the people are not Horwalle staff or
customers and are not presented as endorsing the brand, and the photos are not exclusive.
Replace them with photos of the real samples once those exist.

Source of each file: `https://images.unsplash.com/photo-<id>`

| Product (ref) | Photo ids |
|---|---|
| HW-ES-TEE | 1663573689907-23811551910b, 1592994238317-fcf75c5466fd |
| HW-ES-HOODIE, HW-ES-SET | 1779675789591-5b91f3acc404, 1779675790227-b8e7802db81c, 1779676086744-a83b1f0e00bd, 1779675789882-ff0ab3bb1764, 1779675788296-e268de59beeb |
| HW-ES-CREW | 1605122897309-17343bb5bfb8, 1646724104632-013a77b033ab |
| HW-ES-SHIRT | 1674583598960-73827180d519 |
| HW-ES-RUGBY | 1670003406474-30100ad8536b |
| HW-ES-TROUSERS | 1715541448068-7a6af59ff4a4, 1715541448446-3369e1cc0ee9 |
| HW-ES-JOGGER | 1789110854262-ec66f0648ec7, 1789110519766-117eb0e35bea, 1602573991155-21f0143bb45c |
| HW-ES-TOTE | 1572196284554-4e321b0e7e0b, 1632942480766-9cee148c4ee8 |
| HW-ZR-SKIRT | 1708363390847-b4af54f45273, 1708363390932-15e8a29c0f56 |
| HW-ZR-WRAP | 1641840007671-06412f440b65 |
| HW-ZR-KNIT | 1713425886845-fe080154ec73, 1713425886590-ba01e750b083 |
| HW-ZR-MIDI | 1741605115361-269851d41f06 |
| HW-ZR-BLOUSE | 1704775983224-43dae05da876, 1704775983313-756dd3ac2569, 1704775989365-eebfd4659a23 |
| HW-ZR-BLAZER | 1744691842534-d7a3b0b2489a, 1779406166699-662a041a12a9 |
| HW-ZR-TROUSERS | 1741605037162-b1f475a4a4d3, 1741605037041-acc44c229698, 1741605037045-516447152dfa |
| HW-ZR-TRENCH | 1617391258031-f8d80b22fb35 |
| Section photos: Don, Ətək, Üst geyim | 1713425887001-5c7bb45711f8, 1597253702951-6b83f54bcb37, 1589400445193-c881a4b0b38a |

## Dark graphic prints: Money, Stay Awake, Eternal, Strike (2026-11-12)

The "ƏSAS 01" / "ZƏRİF 01" products above were deleted the same day; their photos are no longer shown.

Print designs (`scripts/media/dark-designs.py`) are Horwalle's own compositions built from free
Unsplash photos ([Unsplash License](https://unsplash.com/license)), reworked (cropped, tone-mapped,
recoloured, combined with type), never used as unaltered copies. The owner's Pinterest references
set the style only; no artwork from them was copied. Type: Anton, Space Mono, UnifrakturMaguntia
(SIL Open Font License, from github.com/google/fonts).

Product images (`scripts/media/dark-images.py`, Storage `products/photo/dark-*.jpg`) are the designs
placed digitally on Unsplash photos of plain black garments. The people are stock models, not
Horwalle staff or customers, and are not presented as endorsing the brand. Replace with photos
of the real printed garments when samples exist.

Source of each file: `https://images.unsplash.com/photo-<id>`

| Photo id | Used for |
|---|---|
| 1568581357391-c71a1675ef93 | Money: banknote texture inside the letters |
| 1565230698474-2a8a500c35cb | Stay Awake: eye |
| 1748641179611-d70cdd5e0f2c | Eternal: marble bust |
| 1598336331578-0fe91c2a0abd, 1598336329498-d9099903946a | Strike: lightning |
| 1793518808366-9711a4b0b703 | black tee on a model (first photo) |
| 1666358776237-08ca4183249e | black tee on a model (third photo) |
| 1610502778270-c5c6f4c7d575 | black tee on a hanger |
| 1748354304454-815d57b8e331 | black hoodie on a model |
