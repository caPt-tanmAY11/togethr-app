"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/reset-password";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const isSetPassword = searchParams.get("set-password") === "true";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Invalid or expired reset link
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await resetPasswordAction(token, password);

    if (result.success) {
      toast.success(isSetPassword ? "Password set successfully!" : "Password reset successfully!");
      router.push("/auth/signin");
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex-1 flex justify-center items-center px-4 py-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10
        backdrop-blur-2xl bg-black/40
        border border-white/10 rounded-2xl
        p-8 sm:p-10
        w-full max-w-100 md:max-w-100 mx-auto text-white my-auto
        "
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-poppins font-semibold tracking-wide">
            {isSetPassword ? "Set your new password" : "Reset Password"}
          </h1>
          <p className="text-sm text-[#8ee8e8c4] mt-2 font-inter">
            {isSetPassword ? "Choose a strong password" : "Choose a new strong password"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-inter">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wide text-gray-300 font-medium"
            >
              New password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-[#0f13198e] border border-[#2B303B]
              rounded-md py-2 px-3 text-sm placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-[#06a8a8cc]
              focus:border-transparent transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-form-main-btn w-full
            rounded-lg py-2 font-medium
            transition-all duration-300
            hover:scale-[1.03]
            hover:shadow-[0_0_15px_rgba(68,156,141,0.6)]
            active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSetPassword
              ? loading
                ? "Setting..."
                : "Set Password"
              : loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
