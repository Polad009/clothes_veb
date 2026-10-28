import json
import uuid

new_product = {
    "id": "vtx-" + str(uuid.uuid4())[:8],
    "slug": "horwalle-mclaren-750s-heavyweight-oversized-tee",
    "name": "HORWALLE \"McLaren 750S\" Heavyweight Oversized Tee",
    "refCode": "TEE-MCLAREN-750S-2026",
    "gender": "men",
    "category": "tisort",
    "fit": "Oversized Boxy Fit",
    "price": 59,
    "compareAtPrice": 89,
    "badge": "LIMITED MOTORSPORT EDITION",
    "composition": "100% Xalis Daranmış Ağır Pambıq (280 GSM), Heavyweight Jersey toxuma",
    "inStock": True,
    "description": (
        "HORWALLE — \"McLaren 750S\" Heavyweight Oversized Tee\n\n"
        "Superkar mühəndisliyinin dəqiqliyi və dinamikası lüks küçə dəbi (streetwear) estetikası ilə görüşür. "
        "280 GSM yüksək sıxlıqlı xalis pambıq parçadan hazırlanmış, nəfəs alan və forması itməyən premium oversize köynək.\n\n"
        "Xüsusiyyətlər:\n\n"
        "• Kəsim: Düşük çiyinli (dropped shoulder), xüsusi rahat boxy oversized streetwear kəsim\n"
        "• Ön Detal: Sol sinədə relyefli HORWALLE 3D lent monoqram loqosu\n"
        "• Arxa Detal: Yüksək dəqiqlikli McLaren 750S triptik aerodinamik qrafik sənət çapı və texniki göstəricilər paneli (740 PS, 1,277 KG, 2.8 SEC, Track Engineered)\n"
        "• Yaxa & Qol: Geniş rib yaxalıq və möhkəmləndirilmiş ikiqat tikişlər\n"
        "• Parça: 100% Xalis Pambıq (280 GSM)\n"
        "• Qulluq: 30°C dərəcədə tərsinə çevirərək yuyulması və tərsdən ütülənməsi tövsiyə olunur."
    ),
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "image": "/images/uploads/mclaren_tee_white_back_v1.png",
    "hoverImage": "/images/uploads/mclaren_tee_white_front_v1.png",
    "gallery": [
        "/images/uploads/mclaren_tee_white_back_v1.png",
        "/images/uploads/mclaren_tee_white_front_v1.png",
        "/images/uploads/mclaren_tee_white_side_v1.png",
        "/images/uploads/mclaren_tee_black_back_v2.png",
        "/images/uploads/mclaren_tee_black_front_v2.png",
        "/images/uploads/mclaren_tee_sand_back_v2.png",
        "/images/uploads/mclaren_tee_sand_front_v2.png"
    ],
    "colors": [
        {
            "name": "Clean White",
            "hex": "#F5F5F7",
            "image": "/images/uploads/mclaren_tee_white_front_v1.png",
            "hoverImage": "/images/uploads/mclaren_tee_white_back_v1.png",
            "leftShoulderImage": "/images/uploads/mclaren_tee_white_side_v1.png",
            "rightShoulderImage": "/images/uploads/mclaren_tee_white_right_v2.png",
            "gallery": [
                "/images/uploads/mclaren_tee_white_front_v1.png",
                "/images/uploads/mclaren_tee_white_back_v1.png",
                "/images/uploads/mclaren_tee_white_side_v1.png",
                "/images/uploads/mclaren_tee_white_right_v2.png"
            ]
        },
        {
            "name": "Washed Black",
            "hex": "#1A1A1A",
            "image": "/images/uploads/mclaren_tee_black_front_v2.png",
            "hoverImage": "/images/uploads/mclaren_tee_black_back_v2.png",
            "leftShoulderImage": "/images/uploads/mclaren_tee_black_left_v2.png",
            "rightShoulderImage": "/images/uploads/mclaren_tee_black_right_v2.png",
            "gallery": [
                "/images/uploads/mclaren_tee_black_front_v2.png",
                "/images/uploads/mclaren_tee_black_back_v2.png",
                "/images/uploads/mclaren_tee_black_left_v2.png",
                "/images/uploads/mclaren_tee_black_right_v2.png"
            ]
        },
        {
            "name": "Heather Grey",
            "hex": "#8C8C8C",
            "image": "/images/uploads/mclaren_tee_sand_front_v2.png",
            "hoverImage": "/images/uploads/mclaren_tee_sand_back_v2.png",
            "leftShoulderImage": "/images/uploads/mclaren_tee_sand_left_v2.png",
            "rightShoulderImage": "/images/uploads/mclaren_tee_sand_right_v2.png",
            "gallery": [
                "/images/uploads/mclaren_tee_sand_front_v2.png",
                "/images/uploads/mclaren_tee_sand_back_v2.png",
                "/images/uploads/mclaren_tee_sand_left_v2.png",
                "/images/uploads/mclaren_tee_sand_right_v2.png"
            ]
        }
    ]
}

with open("data/storeData.json", "r", encoding="utf-8") as f:
    store = json.load(f)

existing_idx = next((i for i, p in enumerate(store.get("products", [])) if p.get("slug") == new_product["slug"]), -1)
if existing_idx >= 0:
    new_product["id"] = store["products"][existing_idx]["id"]
    store["products"][existing_idx] = new_product
    print("Updated existing product:", new_product["slug"])
else:
    store.setdefault("products", []).insert(0, new_product)
    print("Added new product to storeData.json! ID:", new_product["id"])

with open("data/storeData.json", "w", encoding="utf-8") as f:
    json.dump(store, f, indent=2, ensure_ascii=False)

print("storeData.json successfully saved!")
