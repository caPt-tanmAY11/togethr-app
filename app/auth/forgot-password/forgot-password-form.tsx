"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const isSetPassword = searchParams.get("set-password") === "true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = new URL(
      "/auth/reset-password",
      process.env.NEXT_PUBLIC_APP_URL
    );

    if (isSetPassword) {
      redirectUrl.searchParams.set("set-password", "true");
    }

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: redirectUrl.toString(),
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        `If an account exists, a ${isSetPassword ? "" : "reset"} link has been sent`
      );
    }
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
            {isSetPassword ? "Set password" : "Forgot your password?"}
          </h1>
          <p className="text-sm text-[#8ee8e8c4] mt-2 font-inter">
            {isSetPassword
              ? "We’ll send you a link to set your password"
              : "We’ll send you a link to reset it"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-inter">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-wide text-gray-300 font-medium"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading
              ? "Sending..."
              : isSetPassword
              ? "Send link"
              : "Send reset link"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
