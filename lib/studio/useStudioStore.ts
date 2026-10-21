import create from "zustand";
import { StudioSurface } from "@/components/studio/GarmentCanvas";

export interface SideDesignState {
  uploadedImage: string | null;
  originalImage?: string | null;
  customText: string;
  textColor: string;
  fontFamily: string;
  scale: number;
  posX: number;
  posY: number;
  rotation: number;
  textScale: number;
  textPosX: number;
  textPosY: number;
  textRotation: number;
}

export interface StudioGarment {
  id: string;
  name: string;
  category: "tshirt" | "oversize" | "polo" | "polo-long" | "sweatshirt" | "hoodie" | "yarimzamok" | "salvar" | "kepka";
  basePrice: number;
  smallPrintPrice: number;
  oneSidePrice: number;
  twoSidePrice: number;
  sleevePrice: number;
  description: string;
}

interface StudioState {
  viewSide: StudioSurface;
  designs: Record<StudioSurface, SideDesignState>;
  history: Record<StudioSurface, SideDesignState[]>;
  future: Record<StudioSurface, SideDesignState[]>;

  setViewSide: (side: StudioSurface) => void;
  updateCurrentDesign: (partial: Partial<SideDesignState>, recordHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetDesign: (side?: StudioSurface) => void;
}

const DEFAULT_SIDE_DESIGN: SideDesignState = {
  uploadedImage: null,
  originalImage: null,
  customText: "",
  textColor: "#111827",
  fontFamily: "Inter",
  scale: 1.0,
  posX: 0,
  posY: -30,
  rotation: 0,
  textScale: 1.0,
  textPosX: 0,
  textPosY: 55,
  textRotation: 0,
};

export const useStudioStore = create<StudioState>((set, get) => ({
  viewSide: "front",
  designs: {
    front: {
      ...DEFAULT_SIDE_DESIGN,
      uploadedImage: "/images/presets/bmw-m4-clean.png?v=3",
      customText: "NOVA STUDIO",
      posY: -35,
    },
    back: { ...DEFAULT_SIDE_DESIGN },
    leftSleeve: { ...DEFAULT_SIDE_DESIGN, scale: 0.8, textScale: 0.8, posY: -20, textPosY: 35 },
    rightSleeve: { ...DEFAULT_SIDE_DESIGN, scale: 0.8, textScale: 0.8, posY: -20, textPosY: 35 },
  },
  history: {
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: [],
  },
  future: {
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: [],
  },

  setViewSide: (viewSide) => set({ viewSide }),

  updateCurrentDesign: (partial, recordHistory = true) => {
    const { viewSide, designs, history } = get();
    const current = designs[viewSide];
    const updated = { ...current, ...partial };

    const newHistory = recordHistory
      ? { ...history, [viewSide]: [...history[viewSide].slice(-25), current] }
      : history;

    set({
      designs: { ...designs, [viewSide]: updated },
      history: newHistory,
      future: recordHistory ? { ...get().future, [viewSide]: [] } : get().future,
    });
  },

  undo: () => {
    const { viewSide, designs, history, future } = get();
    const sideHistory = history[viewSide];
    if (sideHistory.length === 0) return;

    const previous = sideHistory[sideHistory.length - 1];
    const newSideHistory = sideHistory.slice(0, -1);
    const current = designs[viewSide];

    set({
      designs: { ...designs, [viewSide]: previous },
      history: { ...history, [viewSide]: newSideHistory },
      future: { ...future, [viewSide]: [current, ...future[viewSide]] },
    });
  },

  redo: () => {
    const { viewSide, designs, history, future } = get();
    const sideFuture = future[viewSide];
    if (sideFuture.length === 0) return;

    const next = sideFuture[0];
    const newSideFuture = sideFuture.slice(1);
    const current = designs[viewSide];

    set({
      designs: { ...designs, [viewSide]: next },
      history: { ...history, [viewSide]: [...history[viewSide], current] },
      future: { ...future, [viewSide]: newSideFuture },
    });
  },

  resetDesign: (targetSide) => {
    const side = targetSide || get().viewSide;
    const { designs, history } = get();
    const current = designs[side];

    set({
      designs: {
        ...designs,
        [side]: {
          ...DEFAULT_SIDE_DESIGN,
          scale: side.includes("Sleeve") ? 0.8 : 1.0,
          textScale: side.includes("Sleeve") ? 0.8 : 1.0,
        },
      },
      history: { ...history, [side]: [...history[side].slice(-25), current] },
      future: { ...get().future, [side]: [] },
    });
  },
}));
