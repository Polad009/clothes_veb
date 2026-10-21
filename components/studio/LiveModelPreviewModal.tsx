"use client";

import React, { useState, useEffect } from "react";
import { X, Check, SlidersHorizontal, Info, RefreshCw, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export interface SideDesignState {
  uploadedImage: string | null;
  originalImage?: string | null;
  customText: string;
  textColor: string;
  fontFamily: string;
  scale: number;
  posX: number;
  posY: number;
  rotation?: number;
  textScale?: number;
  textPosX?: number;
  textPosY?: number;
  textRotation?: number;
}

interface LiveModelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontDesign: SideDesignState;
  backDesign: SideDesignState;
  initialSide: "front" | "back";
  colorHex: string;
  garmentName: string;
  onApplyCorrection?: (
    side: "front" | "back",
    corrected: {
      posX: number;
      posY: number;
      scale: number;
      rotation?: number;
      textPosX?: number;
      textPosY?: number;
      textScale?: number;
      textRotation?: number;
    }
  ) => void;
  onSwitchStudioSide?: (side: "front" | "back") => void;
}

export function LiveModelPreviewModal({
  isOpen,
  onClose,
  frontDesign,
  backDesign,
  initialSide,
  colorHex,
  garmentName,
  onApplyCorrection,
  onSwitchStudioSide,
}: LiveModelPreviewModalProps) {
  const { t } = useLanguage();
  const [modelSide, setModelSide] = useState<"front" | "back">(initialSide);
  const [modelGender, setModelGender] = useState<"male" | "female">("male");
  const [aiAutoCorrect, setAiAutoCorrect] = useState(true);
  const [correctionAppliedToast, setCorrectionAppliedToast] = useState(false);

  // Sync side on open
  useEffect(() => {
    if (isOpen) {
      setModelSide(initialSide);
      setCorrectionAppliedToast(false);
    }
  }, [isOpen, initialSide]);

  if (!isOpen) return null;

  // Active side design (strictly separated for front and back)
  const currentSideDesign = modelSide === "front" ? frontDesign : backDesign;
  const hasDesign = Boolean(
    currentSideDesign.uploadedImage || currentSideDesign.customText.trim()
  );

  // Selected High-Res Authentic Model Mockup
  const modelImagePath =
    modelSide === "back"
      ? "/images/models/male_back.jpg"
      : modelGender === "male"
      ? "/images/models/male_front.jpg"
      : "/images/models/female_front.jpg";

  // Base Print Zone Anchor (percentage of photo height)
  // Front: 36% (Mid chest / sternum line - keeps graphic below collar at 18%)
  // Back: 40% (Upper back / shoulder blade line - keeps graphic well below collar at 24% and OFF the head)
  const chestTopPercent = modelSide === "back" ? 40 : modelGender === "male" ? 36 : 37;

  // AI Optimal Standard DTG Target
  const AI_OPTIMAL_POS_X = 0;
  const AI_OPTIMAL_POS_Y = 0; // Exactly centered in designated print zone
  const AI_OPTIMAL_ROTATION = 0;
  const AI_OPTIMAL_SCALE = Math.min(0.95, Math.max(0.65, currentSideDesign.scale));

  // Determine deviation from golden standard
  const diffX = Math.abs(currentSideDesign.posX - AI_OPTIMAL_POS_X);
  const diffY = Math.abs(currentSideDesign.posY - AI_OPTIMAL_POS_Y);
  const diffRot = Math.abs((currentSideDesign.rotation || 0) - AI_OPTIMAL_ROTATION);
  const isDeviated =
    diffX > 6 ||
    diffY > 8 ||
    diffRot > 3 ||
    currentSideDesign.scale > 1.25 ||
    currentSideDesign.scale < 0.65;

  // Deviation explanation
  let deviationDescription = "Dizayn standart çap zonasına mərkəzləşdirildi.";
  if (currentSideDesign.posY > 18) {
    deviationDescription = "Dizayn qarına tərəf çox aşağıda idi; optimal sinə mərkəzinə qaldırıldı.";
  } else if (currentSideDesign.posY < -20) {
    deviationDescription = "Dizayn yaxalıq/boyun hissəsinə çox yaxın idi; təhlükəsiz sinə sahəsinə endirildi.";
  } else if (Math.abs(currentSideDesign.posX) > 12) {
    deviationDescription = "Dizayn yan tərəfə sürüşmüşdü; simmetrik mərkəzə çəkildi.";
  } else if (diffRot > 3) {
    deviationDescription = "Çap bucağındakı əyilmə 0° simmetriyasına düzəldildi.";
  } else if (currentSideDesign.scale > 1.25) {
    deviationDescription = "Dizayn çap sahəsindən kənara çıxırdı; mütənasib ölçüyə salındı.";
  } else if (currentSideDesign.scale < 0.65) {
    deviationDescription = "Dizayn çox kiçik idi; estetik görünüş üçün böyüdüldü.";
  }

  // Live coordinates:
  // AI ON: Snaps to optimal standard (0, 0)
  // AI OFF: Reflects user's manual studio coordinates scaled to model mockup
  const effectivePosX = aiAutoCorrect ? AI_OPTIMAL_POS_X : currentSideDesign.posX * 0.7;
  const effectivePosY = aiAutoCorrect ? AI_OPTIMAL_POS_Y : currentSideDesign.posY * 0.7;
  const effectiveScale = aiAutoCorrect
    ? AI_OPTIMAL_SCALE
    : Math.max(0.4, Math.min(1.6, currentSideDesign.scale));
  const effectiveRotation = aiAutoCorrect ? AI_OPTIMAL_ROTATION : currentSideDesign.rotation || 0;

  const effectiveTextPosX = aiAutoCorrect ? AI_OPTIMAL_POS_X : (currentSideDesign.textPosX ?? 0) * 0.7;
  const effectiveTextPosY = aiAutoCorrect ? 35 : (currentSideDesign.textPosY ?? 55) * 0.7;
  const effectiveTextScale = aiAutoCorrect
    ? 1.0
    : Math.max(0.4, Math.min(1.6, currentSideDesign.textScale ?? 1.0));
  const effectiveTextRotation = aiAutoCorrect ? 0 : currentSideDesign.textRotation || 0;

  const handleApplyToStudio = () => {
    if (onApplyCorrection) {
      onApplyCorrection(modelSide, {
        posX: AI_OPTIMAL_POS_X,
        posY: AI_OPTIMAL_POS_Y,
        scale: AI_OPTIMAL_SCALE,
        rotation: AI_OPTIMAL_ROTATION,
        textPosX: AI_OPTIMAL_POS_X,
        textPosY: 55,
        textScale: 1.0,
        textRotation: 0,
      });
      setCorrectionAppliedToast(true);
      setTimeout(() => setCorrectionAppliedToast(false), 2500);
    }
  };

  const handleSwitchToStudioForDesign = () => {
    if (onSwitchStudioSide) {
      onSwitchStudioSide(modelSide);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#180B04] border border-white/15 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#180B04]">
            <div>
              <h2 className="font-eb-garamond text-lg sm:text-xl font-normal text-white">
                {t.studio.liveModelPreview}
              </h2>
              <p className="text-[11px] text-white/60 mt-0.5">
                {garmentName} · {modelSide === "front" ? t.studio.frontView : t.studio.backView}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body with Image Stage and Side Controls */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/40 flex flex-col md:flex-row items-center justify-center gap-6">
            
            {/* The Live Composite Model Image */}
            <div className="relative aspect-[3/4] w-full max-w-[360px] sm:max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/12 bg-black/60 select-none">
              <img
                src={modelImagePath}
                alt="Model wearing custom t-shirt"
                className="w-full h-full object-cover object-top pointer-events-none"
              />

              {/* Realistic Chest / Upper Back Print Zone */}
              {hasDesign ? (
                <div
                  className="absolute left-1/2 flex items-center justify-center pointer-events-none transition-all duration-300 ease-out"
                  style={{
                    top: `${chestTopPercent}%`,
                    width: "180px",
                    height: "180px",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Layer 1: Uploaded Graphic */}
                  {currentSideDesign.uploadedImage && (
                    <div
                      className="absolute flex items-center justify-center transition-all duration-300 ease-out"
                      style={{
                        transform: `translate(${effectivePosX}px, ${effectivePosY}px) rotate(${effectiveRotation}deg) scale(${effectiveScale})`,
                      }}
                    >
                      <img
                        src={currentSideDesign.uploadedImage}
                        alt="Printed Graphic"
                        className="max-w-[140px] max-h-[140px] object-contain select-none"
                        style={{
                          opacity: 0.98,
                          filter: "contrast(1.05)",
                        }}
                      />
                    </div>
                  )}

                  {/* Layer 2: Custom Text */}
                  {currentSideDesign.customText.trim() && (
                    <div
                      className="absolute flex items-center justify-center transition-all duration-300 ease-out"
                      style={{
                        transform: `translate(${effectiveTextPosX}px, ${effectiveTextPosY}px) rotate(${effectiveTextRotation}deg) scale(${effectiveTextScale})`,
                      }}
                    >
                      <div
                        className="text-center font-black tracking-tight select-none whitespace-nowrap px-2"
                        style={{
                          fontFamily: currentSideDesign.fontFamily,
                          color: currentSideDesign.textColor,
                          fontSize: "15px",
                          mixBlendMode: currentSideDesign.textColor === "#FFFFFF" ? "normal" : "multiply",
                          textShadow:
                            currentSideDesign.textColor === "#FFFFFF"
                              ? "0 1px 3px rgba(0,0,0,0.6)"
                              : "none",
                        }}
                      >
                        {currentSideDesign.customText}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Side Indicator Badge */
                <div className="absolute inset-x-8 top-[38%] p-3.5 rounded-2xl bg-black/75 backdrop-blur-md text-white text-center shadow-lg border border-white/20">
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {t.studio.noDesignOnSide}
                  </div>
                  <p className="text-[10px] text-white/60 mt-1">
                    {t.studio.noDesignDesc}
                  </p>
                </div>
              )}

              {/* Quality Label */}
              <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md text-[#E6C280] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-[#E6C280]/30 shadow-sm">
                {t.studio.dtgSimulation}
              </div>

              {/* Live Placement Indicator */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[10px] font-medium text-white/80 flex items-center justify-between shadow-lg">
                <span>
                  {modelSide === "front" ? t.studio.frontView : t.studio.backView}
                </span>
                <span className="font-mono text-[#E6C280]">
                  {hasDesign ? (aiAutoCorrect ? t.studio.optimalStandard : `X:${Math.round(effectivePosX)}px · Y:${Math.round(effectivePosY)}px`) : t.studio.noDesignOnSide}
                </span>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full md:w-72 space-y-4">
              
              {/* Model View (Front / Back) */}
              <div className="bg-black/40 border border-white/12 rounded-2xl p-4 space-y-2 backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  {t.studio.frontView} / {t.studio.backView}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModelSide("front")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      modelSide === "front"
                        ? "bg-white text-black shadow-lg"
                        : "bg-black/50 text-white/70 border border-white/15 hover:border-white/30"
                    }`}
                  >
                    {t.studio.frontView}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelSide("back")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      modelSide === "back"
                        ? "bg-white text-black shadow-lg"
                        : "bg-black/50 text-white/70 border border-white/15 hover:border-white/30"
                    }`}
                  >
                    {t.studio.backView}
                  </button>
                </div>
              </div>

              {/* Model Gender (Male / Female) - Front view only */}
              {modelSide === "front" && (
                <div className="bg-black/40 border border-white/12 rounded-2xl p-4 space-y-2 backdrop-blur-md">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                    {t.studio.maleModel} / {t.studio.femaleModel}:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModelGender("male")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        modelGender === "male"
                          ? "bg-white text-black shadow-lg"
                          : "bg-black/50 text-white/70 border border-white/15 hover:border-white/30"
                      }`}
                    >
                      {t.studio.maleModel}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelGender("female")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        modelGender === "female"
                          ? "bg-white text-black shadow-lg"
                          : "bg-black/50 text-white/70 border border-white/15 hover:border-white/30"
                      }`}
                    >
                      {t.studio.femaleModel}
                    </button>
                  </div>
                </div>
              )}

              {/* AI Auto-Alignment & Correction Switch Panel */}
              {hasDesign ? (
                <div className="bg-black/40 border border-white/12 rounded-2xl p-4 space-y-2.5 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal size={14} className="text-[#E6C280]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {t.studio.smartCorrection}:
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiAutoCorrect}
                        onChange={(e) => setAiAutoCorrect(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-black/60 border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E6C280]" />
                    </label>
                  </div>

                  {aiAutoCorrect ? (
                    isDeviated ? (
                      <div className="p-3 rounded-xl bg-[#E6C280]/15 border border-[#E6C280]/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[#E6C280] font-bold text-[11px]">
                          <Check size={14} className="shrink-0" />
                          <span>{t.studio.optimizedApplied}</span>
                        </div>
                        <p className="text-[10px] text-white/80 leading-relaxed">
                          {deviationDescription}
                        </p>
                        <div className="text-[10px] text-white/60 pt-1 border-t border-[#E6C280]/20 font-mono flex justify-between">
                          <span>Y:{currentSideDesign.posY}px</span>
                          <span className="font-bold text-[#E6C280]">Y:{AI_OPTIMAL_POS_Y}px</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                        <Check size={14} className="shrink-0" />
                        <span>{t.studio.optimalMatch}</span>
                      </div>
                    )
                  ) : (
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-white/90 font-bold text-[11px]">
                        <Info size={14} className="text-white/60 shrink-0" />
                        <span>{t.studio.manualMode}</span>
                      </div>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        {t.studio.manualDesc}
                      </p>
                      <div className="text-[10px] text-white/50 pt-1 border-t border-white/10 font-mono">
                        X: {currentSideDesign.posX}px · Y: {currentSideDesign.posY}px · {Math.round(currentSideDesign.scale * 100)}%
                      </div>
                    </div>
                  )}

                  {/* Apply AI Correction to Studio Workspace */}
                  {aiAutoCorrect && isDeviated && onApplyCorrection && (
                    <button
                      type="button"
                      onClick={handleApplyToStudio}
                      className="w-full py-2.5 px-3 rounded-full bg-white hover:bg-zinc-200 text-black text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <RefreshCw size={13} />
                      <span>{t.studio.applyToStudio}</span>
                    </button>
                  )}

                  {correctionAppliedToast && (
                    <div className="text-[10px] text-center font-bold text-emerald-400 bg-emerald-950/60 py-1.5 px-2 rounded-lg border border-emerald-500/40 animate-fadeIn">
                      ✓ {t.studio.appliedSuccess}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-black/40 border border-white/12 rounded-2xl p-4 space-y-2.5 backdrop-blur-md">
                  <div className="text-xs font-bold text-white/80">
                    {t.studio.noDesignOnSide}
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    {t.studio.noDesignDesc}
                  </p>
                  <button
                    type="button"
                    onClick={handleSwitchToStudioForDesign}
                    className="w-full py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={14} className="text-[#E6C280]" />
                    <span>{t.studio.addDesignToSide}</span>
                  </button>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition shadow-md"
                >
                  {t.studio.backToEditor}
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
