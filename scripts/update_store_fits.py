import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open("data/storeData.json", "r", encoding="utf-8") as f:
    store = json.load(f)

for p in store.get("products", []):
    name = p.get("name", "").lower()
    slug = p.get("slug", "").lower()
    cat = p.get("category", "").lower()

    if "bmw" in name or "bmw" in slug:
        p["fit"] = "Hody qalın (3iplik)"
    elif "mclaren" in name or "mclaren" in slug:
        p["fit"] = "Oversize T-shirt (Süprəm / 2iplik)"
    elif "polo" in name or "polo" in slug:
        p["fit"] = "Polo - qısaqol"
    elif "angel dust" in name or "hudi" in cat or "hoodie" in slug:
        p["fit"] = "Hody qalın (3iplik)"
    print(f"Updated product: {p['name']} -> fit: {p['fit']}")

with open("data/storeData.json", "w", encoding="utf-8") as f:
    json.dump(store, f, indent=2, ensure_ascii=False)

print("Updated storeData.json with official garment fits!")
