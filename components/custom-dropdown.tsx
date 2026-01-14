"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDropdownProps {
    label: string;
    options: string[];
    placeholder?: string;
    onChange?: (value: string) => void;
    selected: string;
    setSelected: (value: string) => void;
    type?: string;
}

export default function CustomDropdown({
    label,
    options,
    placeholder = "Select an option",
    onChange,
    selected,
    setSelected,
    type
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (opt: string) => {
        setSelected(opt);
        setIsOpen(false);
        if (onChange) onChange(opt);
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
                    className={`w-full bg-white/10 backdrop-blur-md text-left px-4 py-2.5 rounded-xl outline-none border border-white/10 
            transition-all duration-200 cursor-pointer flex justify-between items-center 
            hover:bg-white/15 ${type === "projects" ? "focus:ring-1 focus:ring-[#f36262]" : "focus:ring-1 focus:ring-teal-600"} ${selected ? "text-white" : "text-white/60"
                        }`}
                >
                    {selected || placeholder}
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
                            className="absolute bottom-full mb-2 w-full bg-[#0b0f0f]/90 border border-white/10 rounded-xl 
                         backdrop-blur-lg shadow-lg overflow-hidden z-20"
                        >
                            {options.map((opt, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 ${type === "projects" ? "hover:text-[#ff7b7b]" : "hover:text-teal-300 "} transition-all cursor-pointer`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
