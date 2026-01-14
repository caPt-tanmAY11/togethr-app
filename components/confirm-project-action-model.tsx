"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface ConfirmProjectActionModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  confirmColor?: "red" | "green";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmProjectActionModal({
  open,
  title,
  description,
  confirmText,
  confirmColor = "green",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmProjectActionModalProps) {
  if (!open) return null;

  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-998"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                />

                <motion.div
                  className="fixed z-998 inset-0 flex items-center justify-center px-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="w-full max-w-md rounded-2xl bg-[#0e0e0e] border border-white/10 shadow-xl p-6 text-white">
                    <h2 className="text-lg font-semibold mb-2">{title}</h2>

                    <p className="text-sm text-[#bdbdbd] mb-6">{description}</p>

                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
                        disabled={loading}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                          confirmColor === "red"
                            ? "bg-[#b62222b7] hover:bg-[#e24040b7]"
                            : "bg-green-700 hover:bg-green-600 "
                        }`}
                      >
                        {loading ? "Processing..." : confirmText}
                      </button>
                    </div>
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
