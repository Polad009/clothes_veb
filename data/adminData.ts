export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  totalAmount: number;
  paymentMethod: "card" | "apple_pay" | "google_pay" | "cash_on_delivery";
  hasCustomItems: boolean;
  orderStatus: "yeni" | "təsdiqləndi" | "çapdadır" | "kuryerdə" | "tamamlandı" | "ləğv_edildi";
  createdAt: string;
  items: {
    name: string;
    type: "ready" | "custom";
    color: string;
    size: string;
    quantity: number;
    price: number;
    customDesignId?: string;
  }[];
}

export interface AdminCustomDesign {
  id: string;
  productSlug: string;
  productName: string;
  color: string;
  size: string;
  status: "göndərildi" | "təsdiqləndi" | "çapdadır" | "hazırdır" | "ləğv_edildi";
  previewUrl: string;
  printFileUrl: string;
  createdAt: string;
}

export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "ord_101",
    orderNumber: "ATL-948210",
    customerName: "Kamran Quliyev",
    customerPhone: "+994 50 212 34 56",
    customerCity: "Bakı",
    customerAddress: "Səməd Vurğun küç. 34, mən. 18",
    totalAmount: 64.0,
    paymentMethod: "apple_pay",
    hasCustomItems: true,
    orderStatus: "çapdadır",
    createdAt: "2026-10-10 16:45",
    items: [
      {
        name: "Fərdi Dizayn Boxy T-Shirt",
        type: "custom",
        color: "Qara",
        size: "L",
        quantity: 1,
        price: 64.0,
        customDesignId: "custom_8841",
      },
    ],
  },
  {
    id: "ord_102",
    orderNumber: "ATL-948209",
    customerName: "Aygün Məmmədova",
    customerPhone: "+994 55 980 12 34",
    customerCity: "Bakı",
    customerAddress: "Nərimanov r., Təbriz küç. 88",
    totalAmount: 138.0,
    paymentMethod: "cash_on_delivery",
    hasCustomItems: false,
    orderStatus: "kuryerdə",
    createdAt: "2026-10-10 14:20",
    items: [
      {
        name: "Heavyweight Boxy T-Shirt",
        type: "ready",
        color: "Süd Rəngi",
        size: "M",
        quantity: 1,
        price: 49.0,
      },
      {
        name: "Minimal French Terry Hoodie",
        type: "ready",
        color: "Qara",
        size: "M",
        quantity: 1,
        price: 89.0,
      },
    ],
  },
  {
    id: "ord_103",
    orderNumber: "ATL-948195",
    customerName: "Rəşad Əliyev",
    customerPhone: "+994 70 345 67 89",
    customerCity: "Sumqayıt",
    customerAddress: "4-cü məhəllə, ev 12",
    totalAmount: 104.0,
    paymentMethod: "card",
    hasCustomItems: true,
    orderStatus: "təsdiqləndi",
    createdAt: "2026-10-09 19:10",
    items: [
      {
        name: "Fərdi Dizayn French Hoodie",
        type: "custom",
        color: "Boz Melanj",
        size: "XL",
        quantity: 1,
        price: 104.0,
        customDesignId: "custom_8840",
      },
    ],
  },
];

export const INITIAL_CUSTOM_DESIGNS: AdminCustomDesign[] = [
  {
    id: "custom_8841",
    productSlug: "custom-tshirt",
    productName: "Boxy T-Shirt (DTG Çap)",
    color: "Qara",
    size: "L",
    status: "çapdadır",
    previewUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
    printFileUrl: "/downloads/print_8841_hd.png",
    createdAt: "2026-10-10 16:45",
  },
  {
    id: "custom_8840",
    productSlug: "custom-hoodie",
    productName: "French Hoodie (DTG Çap)",
    color: "Boz Melanj",
    size: "XL",
    status: "təsdiqləndi",
    previewUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop",
    printFileUrl: "/downloads/print_8840_hd.png",
    createdAt: "2026-10-09 19:10",
  },
];
