"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated. Please sign in again.");
      await authClient.signOut();
      router.push("/auth/signin");
      onClose();
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[998] flex items-center justify-center
                     bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="
              w-full max-w-sm sm:max-w-md
              rounded-2xl
              p-4 sm:p-6
              backdrop-blur-xl bg-black/50
              border border-white/10
              text-white
            "
          >
            <div className="mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold">
                Change password
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Enter your current password and choose a new one.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-white/60">
                  Current password
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="
                      w-full rounded-md
                      px-3 py-2.5 sm:py-2
                      pr-10
                      bg-white/10 text-white
                      outline-none
                      focus:ring-1 focus:ring-teal-600 border border-white/15
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      text-white/50 hover:text-white transition
                    "
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-white/60">New password</label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="
                      w-full rounded-md
                      px-3 py-2.5 sm:py-2
                      pr-10
                      bg-white/10 text-white
                      outline-none
                      focus:ring-1 focus:ring-teal-600 border border-white/15
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      text-white/50 hover:text-white transition
                    "
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>

                <p className="text-sm text-white/40">
                  Must be at least 8 characters long.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    text-sm text-white/60
                    hover:text-white transition
                    cursor-pointer
                    w-full sm:w-auto
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-4 py-2.5 sm:py-2
                    text-sm rounded-lg
                    bg-teal-500/20 text-teal-300
                    hover:bg-teal-500/30
                    disabled:opacity-60
                    transition cursor-pointer
                    w-full sm:w-auto
                  "
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-white/40 leading-relaxed">
              Changing your password will log you out of other active sessions.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
