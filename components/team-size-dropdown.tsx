"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownOption {
  label: string;
  value: number | null;
}

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  placeholder?: string;
  selected: DropdownOption | null;
  setSelected: (value: DropdownOption) => void;
  onChange?: (value: DropdownOption) => void;
  required?: string;
}

export default function TeamSizeDropdown({
  label,
  options,
  required,
  placeholder = `Select team size ${!required ? "*" : ""}`,
  selected,
  setSelected,
  onChange,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (opt: DropdownOption) => {
    setSelected(opt);
    setIsOpen(false);
    onChange?.(opt);
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-white/70 tracking-wide">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full bg-white/10 backdrop-blur-md text-left px-4 py-2.5 rounded-xl 
            border border-white/10 flex justify-between items-center
            hover:bg-white/15 focus:ring-1 focus:ring-teal-600 transition-all cursor-pointer
            ${selected ? "text-white" : "text-white/60"}`}
        >
          {selected ? selected.label : placeholder}

          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-white/60"
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 w-full bg-[#0b0f0f]/90 
                border border-white/10 rounded-xl backdrop-blur-lg 
                shadow-lg overflow-hidden z-20"
            >
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className="px-4 py-2.5 text-sm text-white/80 
                    hover:bg-white/10 hover:text-teal-300 
                    transition-all cursor-pointer"
                >
                  {opt.label}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
