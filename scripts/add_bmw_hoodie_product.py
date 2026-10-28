import json

product = {
    "id": "vtx-bmw-m-hoodie",
    "slug": "horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
    "name": "HORWALLE \"BMW M Motorsport\" Heavyweight Fleece Hoodie",
    "refCode": "HUDI-BMW-M-2026",
    "gender": "unisex",
    "category": "hudi",
    "fit": "Oversized Streetwear Fit",
    "price": 89,
    "compareAtPrice": 129,
    "badge": "LIMITED MOTORSPORT EDITION",
    "composition": "100% Xalis Daranmış Pambıq (380 GSM), İsti Şardonlu 3-İplik Fleece toxuma",
    "inStock": True,
    "description": (
        "HORWALLE — \"BMW M Motorsport\" Heavyweight Fleece Hoodie\n\n"
        "Bavariya avtomobil mühəndisliyinin ikonik gücü və yarış ruhu HORWALLE lüks küçə dəbi (streetwear) estetikası ilə görüşür. "
        "380 GSM yüksək sıxlıqlı pambıq parçadan, daxili isti və yumşaq şardonlu astarla hazırlanmış premium hudi.\n\n"
        "Xüsusiyyətlər:\n\n"
        "• Kəsim: Düşük çiyinli (dropped shoulder), xüsusi rahat oversized boxy streetwear kəsim\n"
        "• Ön Detal: Sağ sinədə orijinal BMW roundel emblemi, sol sinədə ikonik BMW ///M Motorsport zolaqları və naxışlı loqo\n"
        "• Arxa Detal: Təmiz, minimalist və zərif monoxrom toxuma\n"
        "• Yaxa & Kapüşon: İkiqat qalın pambıq astarla forması pozulmayan kapüşon, metal ucluqlu və metal halqalı sıxıcı kordonlar\n"
        "• Ciblər: Geniş və rahat ön kenquru cibi, elastik rib manjetlər və ətək\n"
        "• Parça: 100% Xalis Daranmış Pambıq (380 GSM Heavyweight Fleece)\n"
        "• Qulluq: 30°C dərəcədə tərsinə çevirərək yuyulması və tərsdən ütülənməsi tövsiyə olunur."
    ),
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "image": "/images/uploads/bmw_hoodie_black_front_v3.png",
    "hoverImage": "/images/uploads/bmw_hoodie_black_back_v3.png",
    "gallery": [
        "/images/uploads/bmw_hoodie_black_front_v3.png",
        "/images/uploads/bmw_hoodie_black_back_v3.png",
        "/images/uploads/bmw_hoodie_grey_front_v3.png",
        "/images/uploads/bmw_hoodie_grey_back_v3.png",
        "/images/uploads/bmw_hoodie_white_front_v3.png",
        "/images/uploads/bmw_hoodie_white_back_v3.png"
    ],
    "colors": [
        {
            "name": "Washed Black",
            "hex": "#1A1A1A",
            "image": "/images/uploads/bmw_hoodie_black_front_v3.png",
            "hoverImage": "/images/uploads/bmw_hoodie_black_back_v3.png",
            "gallery": [
                "/images/uploads/bmw_hoodie_black_front_v3.png",
                "/images/uploads/bmw_hoodie_black_back_v3.png"
            ]
        },
        {
            "name": "Heather Grey",
            "hex": "#8C8C8C",
            "image": "/images/uploads/bmw_hoodie_grey_front_v3.png",
            "hoverImage": "/images/uploads/bmw_hoodie_grey_back_v3.png",
            "gallery": [
                "/images/uploads/bmw_hoodie_grey_front_v3.png",
                "/images/uploads/bmw_hoodie_grey_back_v3.png"
            ]
        },
        {
            "name": "Clean White",
            "hex": "#F5F5F7",
            "image": "/images/uploads/bmw_hoodie_white_front_v3.png",
            "hoverImage": "/images/uploads/bmw_hoodie_white_back_v3.png",
            "gallery": [
                "/images/uploads/bmw_hoodie_white_front_v3.png",
                "/images/uploads/bmw_hoodie_white_back_v3.png"
            ]
        }
    ]
}

with open("data/storeData.json", "r", encoding="utf-8") as f:
    store = json.load(f)

products = store.setdefault("products", [])
existing_idx = next((i for i, p in enumerate(products) if p.get("slug") == product["slug"]), -1)

if existing_idx >= 0:
    products[existing_idx] = product
    print("Updated existing BMW hoodie in storeData.json!")
else:
    products.insert(0, product)
    print("Added new BMW hoodie at index 0 of storeData.json!")

with open("data/storeData.json", "w", encoding="utf-8") as f:
    json.dump(store, f, indent=2, ensure_ascii=False)

print("storeData.json successfully written!")
