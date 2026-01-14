"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "HACKATHON", label: "Hackathon" },
  { value: "CERTIFICATION", label: "Certification" },
  { value: "AWARD", label: "Award" },
  { value: "OPEN_SOURCE", label: "Open Source" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "OTHER", label: "Other" },
];

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export default function AchievementCategoryDropdown({
  value,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    CATEGORIES.find((c) => c.value === value)?.label ?? "Select category";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`
          w-full bg-white/10 backdrop-blur-md
          px-4 py-2.5 rounded-xl
          border border-white/10
          flex items-center justify-between
          text-sm transition-all
          hover:bg-white/15
          focus:ring-1 focus:ring-teal-400
          ${value ? "text-white" : "text-white/60"}
        `}
      >
        {selectedLabel}

        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="w-4 h-4 text-white/60 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="
              absolute bottom-full mb-2 w-full z-30
              rounded-xl overflow-hidden
              bg-[#0b0f0f]/90 backdrop-blur-xl
              border border-white/10 shadow-xl
            "
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  onChange(cat.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2.5
                  text-sm transition-all
                  hover:bg-white/10
                  ${
                    value === cat.value
                      ? "text-teal-300 bg-white/5"
                      : "text-white/80 hover:text-teal-200"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
