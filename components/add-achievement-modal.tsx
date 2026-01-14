"use client";

import { AchievementCategory } from "@/lib/generated/prisma/enums";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: AchievementInput) => void;
  loading: boolean;
}

export interface AchievementInput {
  title: string;
  issuer?: string;
  description?: string;
  category?: AchievementCategory;
  proofUrl?: string;
}

export default function AddAchievementModal({
  open,
  onClose,
  onAdd,
  loading,
}: Props) {
  const [form, setForm] = useState<AchievementInput>({ title: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAdd(form);
  };

  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="fixed inset-0 z-998 bg-black/60 backdrop-blur-sm"
                  onClick={onClose}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                <motion.div
                  className="
              fixed z-998 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[90vw] max-w-lg sm:max-w-xl text-white
              rounded-3xl bg-gradient-to-b from-[#1a1a1a]/80 to-[#111]/80
              border border-white/10 shadow-xl p-6 sm:p-8
              backdrop-blur-lg
            "
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Add Achievement
                  </h2>
                  <p className="text-white/60 text-sm sm:text-base mb-4">
                    Add your achievement details to showcase your
                    accomplishments.
                  </p>

                  <div className="space-y-3">
                    <input
                      name="title"
                      placeholder="Achievement title *"
                      onChange={handleChange}
                      className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/10"
                    />

                    <input
                      name="issuer"
                      placeholder="Issued by"
                      onChange={handleChange}
                      className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/10"
                    />

                    <input
                      name="proofUrl"
                      placeholder="Proof URL"
                      onChange={handleChange}
                      className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/10"
                    />

                    <textarea
                      name="description"
                      placeholder="Description"
                      onChange={handleChange}
                      className="w-full rounded-lg bg-white/10 border border-white/10
                           px-4 py-2.5 text-white text-sm placeholder:text-white/40
                           outline-none focus:ring-1 focus:ring-teal-600
                           transition resize-none min-h-[100px]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm sm:text-base text-white/60
                           hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={loading}
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-xl text-[white] bg-[#0d6969] hover:bg-[#118585]
                            font-medium text-sm sm:text-base
                           hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Adding..." : "Add"}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
