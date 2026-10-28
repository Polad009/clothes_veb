const initialProducts = [
  {
    id: "classic-tee",
    name: "Classic Tee",
    category: "Uniseks",
    subcategory: "T-Shirt",
    price: 35,
    currency: "₼",
    description: "100% premium daranmış pambıqdan hazırlanmış klassik kəsim köynək. Nəfəs alan, formasını itirməyən və fərdi çap üçün ideal parça.",
    material: "100% Premium Pambıq (180 gsm)",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Açıq Boz", hex: "#E8E7E4", silhouetteColor: "#E2E0DC" },
      { name: "Ağ", hex: "#FFFFFF", silhouetteColor: "#F7F7F7" },
      { name: "Qara", hex: "#1C1C1E", silhouetteColor: "#222224" },
      { name: "Qum Beji", hex: "#D6C7B2", silhouetteColor: "#D0C0A8" }
    ],
    silhouetteType: "tshirt",
    silhouetteColor: "#E2E0DC",
    rating: 5.0,
    reviewsCount: 48,
    isFeatured: true,
    customizable: true,
    stock: 50
  },
  {
    id: "heavy-hoodie",
    name: "Heavy Hoodie",
    category: "Uniseks",
    subcategory: "Hoodie",
    price: 65,
    currency: "₼",
    description: "Ağır çəkili premium 3 sap toxunuşlu kapüşonlu sviter. İsti saxlayan daxili fleece təbəqəsi və rahat oversize kəsim.",
    material: "100% Ağır Pambıq / Fleece (380 gsm)",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Dumanlı Boz", hex: "#B8B9BB", silhouetteColor: "#B5B7B9" },
      { name: "Qara", hex: "#1C1C1E", silhouetteColor: "#222224" },
      { name: "Süd Rəngi", hex: "#F3EFE6", silhouetteColor: "#EDE7DC" }
    ],
    silhouetteType: "hoodie",
    silhouetteColor: "#B5B7B9",
    rating: 4.9,
    reviewsCount: 36,
    isFeatured: true,
    customizable: true,
    stock: 35
  },
  {
    id: "oversize-tee",
    name: "Oversize Tee",
    category: "Uniseks",
    subcategory: "T-Shirt",
    price: 40,
    currency: "₼",
    description: "Düşük çiyinli, rahat və müasir oversize kəsim t-shirt. Yüksək sıxlıqlı parçası ilə küçə modasının vazkeçilməz modeli.",
    material: "100% Daranmış Pambıq (240 gsm)",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Qara", hex: "#1C1C1E", silhouetteColor: "#222224" },
      { name: "Ağ", hex: "#FFFFFF", silhouetteColor: "#F7F7F7" },
      { name: "Boz", hex: "#A8A8A8", silhouetteColor: "#A0A0A0" }
    ],
    silhouetteType: "oversize",
    silhouetteColor: "#222224",
    rating: 4.9,
    reviewsCount: 52,
    isFeatured: true,
    customizable: true,
    stock: 40
  },
  {
    id: "essential-tee",
    name: "Essential Tee",
    category: "Uniseks",
    subcategory: "T-Shirt",
    price: 35,
    currency: "₼",
    description: "Təbii qum və krem tonlarında hər gün üçün əvəzolunmaz baza köynək. Ultra yumşaq silikon yuma ilə işlənmişdir.",
    material: "100% Üzvi Pambıq (190 gsm)",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Qum Beji", hex: "#D6C7B2", silhouetteColor: "#D0C0A8" },
      { name: "Zeytun", hex: "#4A5342", silhouetteColor: "#434B3C" },
      { name: "Ağ", hex: "#FFFFFF", silhouetteColor: "#F7F7F7" }
    ],
    silhouetteType: "tshirt",
    silhouetteColor: "#D0C0A8",
    rating: 4.8,
    reviewsCount: 29,
    isFeatured: true,
    customizable: true,
    stock: 45
  },
  {
    id: "crewneck-sweatshirt",
    name: "Minimalist Crewneck",
    category: "Uniseks",
    subcategory: "Sweatshirt",
    price: 55,
    currency: "₼",
    description: "Yumru yaxalıqlı təmiz kəsim sweatshirt. Elastik manjetlər və zərif tikiş detalları.",
    material: "85% Pambıq, 15% Polyester (320 gsm)",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Qara", hex: "#1C1C1E", silhouetteColor: "#222224" },
      { name: "Boz", hex: "#D8D8D8", silhouetteColor: "#D0D0D0" }
    ],
    silhouetteType: "crewneck",
    silhouetteColor: "#333336",
    rating: 5.0,
    reviewsCount: 19,
    isFeatured: false,
    customizable: true,
    stock: 25
  },
  {
    id: "canvas-tote",
    name: "Atelier Kətan Çanta",
    category: "Aksesuar",
    subcategory: "Çanta",
    price: 25,
    currency: "₼",
    description: "Təbii ağır kətan parçadan gündəlik ekoloji çanta. Fərdi qrafik və ya yazı çapı üçün uyğundur.",
    material: "100% Təbii Kətan (300 gsm)",
    sizes: ["Standart (38x42 sm)"],
    colors: [
      { name: "Təbii Kətan", hex: "#E8E2D5", silhouetteColor: "#E0D9CB" },
      { name: "Qara", hex: "#1C1C1E", silhouetteColor: "#222224" }
    ],
    silhouetteType: "tote",
    silhouetteColor: "#E0D9CB",
    rating: 4.9,
    reviewsCount: 22,
    isFeatured: false,
    customizable: true,
    stock: 60
  }
];

const initialCategories = [
  { id: "all", name: "Kolleksiyalar", count: 6 },
  { id: "kisi", name: "Kişi", count: 4 },
  { id: "qadin", name: "Qadın", count: 4 },
  { id: "studio", name: "Studio", count: 6 }
];

const studioMaterials = [
  { id: "cotton-180", name: "Klassik Pambıq (180 gsm)", priceMultiplier: 1.0, desc: "Yüngül, nəfəs alan və gündəlik rahatlıq" },
  { id: "heavy-240", name: "Ağır Premium Pambıq (240 gsm)", priceMultiplier: 1.15, desc: "Sıx toxunuşlu, oversize kəsimlər üçün əla forma" },
  { id: "fleece-380", name: "Qalın Qış Fleece (380 gsm)", priceMultiplier: 1.6, desc: "İsti saxlayan üç sap toxunuşlu hoodie parçası" }
];

const studioColors = [
  { id: "light-grey", name: "Açıq Boz", hex: "#E2E0DC", bgHex: "#F2F1EE" },
  { id: "grey", name: "Dumanlı Boz", hex: "#B5B7B9", bgHex: "#EAEBEC" },
  { id: "black", name: "Qara", hex: "#222224", bgHex: "#1C1C1E" },
  { id: "sand", name: "Qum Beji", hex: "#D0C0A8", bgHex: "#F0EAE1" },
  { id: "white", name: "Təmiz Ağ", hex: "#F7F7F7", bgHex: "#FFFFFF" },
  { id: "olive", name: "Zeytun", hex: "#434B3C", bgHex: "#E5E8E2" }
];

const promoCodes = [
  { code: "HORVVALLE10", discountPercent: 10, minAmount: 30, desc: "İlk sifarişə 10% endirim" },
  { code: "HORVVALLE20", discountPercent: 20, minAmount: 70, desc: "Xüsusi 20% endirim" },
  { code: "STUDIO20", discountPercent: 20, minAmount: 70, desc: "Studio sifarişlərinə 20% endirim" }
];

module.exports = {
  initialProducts,
  initialCategories,
  studioMaterials,
  studioColors,
  promoCodes
};
