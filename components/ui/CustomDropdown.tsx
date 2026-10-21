"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  direction?: "down" | "up";
  variant?: "dark" | "light";
}

export function CustomDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "Seçin",
  className = "",
  direction = "down",
  variant = "dark",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const isDark = variant === "dark";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: direction === "down" ? -10 : 10,
      scale: 0.95,
      transition: { duration: 0.14, ease: "easeIn" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 24,
        stiffness: 380,
        mass: 0.7,
      },
    },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.025,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.15, ease: "easeOut" },
    },
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/70" : "text-zinc-700"}`}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium focus:outline-none transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm ${
          isDark
            ? "bg-white/10 hover:bg-white/15 border border-white/20 text-white"
            : "bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span className="truncate font-semibold">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`${isDark ? "text-white/70" : "text-zinc-400"} flex-shrink-0`}
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              transformOrigin: direction === "down" ? "top center" : "bottom center",
            }}
            className={`absolute z-50 w-full min-w-[210px] rounded-2xl border shadow-2xl py-1.5 overflow-hidden focus:outline-none backdrop-blur-xl ${
              isDark
                ? "bg-[#1C0D05]/95 border-white/20 text-white"
                : "bg-white/95 border-zinc-200 text-zinc-900"
            } ${
              direction === "down" ? "top-full mt-1.5" : "bottom-full mb-1.5"
            }`}
            role="listbox"
          >
            <motion.div variants={listVariants} initial="hidden" animate="visible">
              {options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <motion.div key={option.id} variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-white text-black font-bold"
                            : "bg-zinc-100 text-zinc-900 font-bold"
                          : isDark
                          ? "text-white/80 hover:text-white hover:bg-white/10"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                        <div className="truncate">
                          <div className="truncate">{option.label}</div>
                          {option.sublabel && (
                            <div className={`text-[10px] font-normal truncate ${isDark ? "text-white/50" : "text-zinc-400"}`}>
                              {option.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 450, damping: 22 }}
                          className={`${isDark ? "text-black" : "text-zinc-900"} flex-shrink-0 ml-2`}
                        >
                          <Check size={14} />
                        </motion.span>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
