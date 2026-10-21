export interface ProductShapeConfig {
  shapeGroup: string;
  thickness: number; // 3D inflate depth scale (e.g. 0.12 - 0.22)
  scaleY?: number;
  widthFactor?: number;
  description?: string;
  view3d?: "full" | "limited"; // limited: +/-40 degree azimuth rotation around front/back
}

/**
 * Baza geyim → forma qrupu, qalınlıq və 3D baxış bucağı tənzimləmələri
 * Bütün məhsullar üçün standart olaraq view3d: "limited" təyin edilmişdir.
 */
export const PRODUCT_SHAPES: Record<string, ProductShapeConfig> = {
  // 1. T-shirt Regular (Süprəm) → t-shirt, 0.12
  "tshirt-regular": {
    shapeGroup: "t-shirt",
    thickness: 0.12,
    view3d: "limited",
    description: "Klassik müasir kəsimli t-shirt, yüngül qabaritli pambıq relyefi",
  },
  // 2. T-shirt Regular (2iplik) → t-shirt, 0.12
  "tshirt-regular-2thread": {
    shapeGroup: "t-shirt",
    thickness: 0.12,
    view3d: "limited",
    description: "Möhkəm 2iplik parça t-shirt",
  },
  // 3. Oversize T-shirt → oversize, 0.16
  "oversize-tshirt": {
    shapeGroup: "oversize",
    thickness: 0.16,
    view3d: "limited",
    description: "Geniş çiyinli və sərbəst formalı oversize t-shirt",
  },
  // 4. Polo Qısaqol → polo, 0.12
  "polo-short": {
    shapeGroup: "polo",
    thickness: 0.12,
    view3d: "limited",
    description: "Yaxalıqlı qısaqol polo köynək",
  },
  // 5. Polo Uzunqol → polo, 0.12
  "polo-long": {
    shapeGroup: "polo",
    thickness: 0.12,
    view3d: "limited",
    description: "Klassik yaxalıqlı uzunqol polo",
  },
  // 6. Sviter Nazik → sviter, 0.18
  "sviter-thin": {
    shapeGroup: "sviter",
    thickness: 0.18,
    view3d: "limited",
    description: "2iplik elastik sviter / sweatshirt",
  },
  // 7. Sviter Qalın → sviter, 0.18
  "sviter-thick": {
    shapeGroup: "sviter",
    thickness: 0.18,
    view3d: "limited",
    description: "3iplik içi isti qalın sviter",
  },
  // 8. Hody Nazik → hudi, 0.20
  "hoodie-thin": {
    shapeGroup: "hudi",
    thickness: 0.20,
    view3d: "limited",
    description: "Yüngül kapüşonlu 2iplik hudi",
  },
  // 9. Hody Qalın → hudi, 0.20
  "hoodie-thick": {
    shapeGroup: "hudi",
    thickness: 0.20,
    view3d: "limited",
    description: "Heavyweight 3iplik qalın isti hudi",
  },
  // 10. Yarımzamok Nazik → yarımzamok, 0.16
  "yarimzamok-thin": {
    shapeGroup: "yarımzamok",
    thickness: 0.16,
    view3d: "limited",
    description: "Yaxalıqlı yarımzamok kəsimli nazik sviter",
  },
  // 11. Yarımzamok Qalın → yarımzamok, 0.16
  "yarimzamok-thick": {
    shapeGroup: "yarımzamok",
    thickness: 0.16,
    view3d: "limited",
    description: "Qalın 3iplik yarımzamoklu üst geyim",
  },
  // 12. Balonka → balonka, 0.22
  "balonka": {
    shapeGroup: "balonka",
    thickness: 0.22,
    view3d: "limited",
    description: "Həcmli, külək keçirməyən qabarıq balonka gödəkcə",
  },
  // 13. Şalvar Nazik → şalvar, 0.14
  "salvar-thin": {
    shapeGroup: "şalvar",
    thickness: 0.14,
    view3d: "limited",
    description: "2iplik yüngül gündəlik idman şalvarı",
  },
  // 14. Şalvar Qalın → şalvar, 0.14
  "salvar-thick": {
    shapeGroup: "şalvar",
    thickness: 0.14,
    view3d: "limited",
    description: "3iplik içi tüklü qış idman şalvarı",
  },
  // 15. Kepka Nazik → kepka, 0.20
  "kepka-thin": {
    shapeGroup: "kepka",
    thickness: 0.20,
    view3d: "limited",
    description: "Yüngül yay kepkası, gün qoruyucu sipərli",
  },
  // 16. Kepka Qalın → kepka, 0.20
  "kepka-thick": {
    shapeGroup: "kepka",
    thickness: 0.20,
    view3d: "limited",
    description: "Qalın panelli möhkəm snapback kepka",
  },
};

/**
 * Məhsul ID-sinə əsasən forma qrupunu, qalınlığı və 3D görünüş rejimini qaytarır
 */
export function getProductShapeConfig(productId: string): ProductShapeConfig {
  if (PRODUCT_SHAPES[productId]) {
    return PRODUCT_SHAPES[productId];
  }

  const id = productId.toLowerCase();
  if (id.includes("oversize")) return { shapeGroup: "oversize", thickness: 0.16, view3d: "limited" };
  if (id.includes("polo-long") || id.includes("uzunqol")) return { shapeGroup: "polo", thickness: 0.12, view3d: "limited" };
  if (id.includes("polo")) return { shapeGroup: "polo", thickness: 0.12, view3d: "limited" };
  if (id.includes("balonka")) return { shapeGroup: "balonka", thickness: 0.22, view3d: "limited" };
  if (id.includes("hoodie") || id.includes("hody")) return { shapeGroup: "hudi", thickness: 0.20, view3d: "limited" };
  if (id.includes("yarimzamok") || id.includes("halfzip")) return { shapeGroup: "yarımzamok", thickness: 0.16, view3d: "limited" };
  if (id.includes("sviter") || id.includes("sweatshirt")) return { shapeGroup: "sviter", thickness: 0.18, view3d: "limited" };
  if (id.includes("salvar") || id.includes("pants")) return { shapeGroup: "şalvar", thickness: 0.14, view3d: "limited" };
  if (id.includes("kepka") || id.includes("cap")) return { shapeGroup: "kepka", thickness: 0.20, view3d: "limited" };

  return { shapeGroup: "t-shirt", thickness: 0.12, view3d: "limited" };
}
