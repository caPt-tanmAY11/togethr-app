"use client";

import SignupForm from "@/components/auth/sign-up-form";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Signup() {
  return (
    <div className="relative flex justify-center items-center min-h-screen px-4 overflow-hidden">

      {/* Glass container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="
          relative z-10 backdrop-blur-2xl
          bg-linear-to-br from-white/10 via-white/5 to-transparent
          border border-white/10
          rounded-2xl p-8 sm:p-10
          w-full max-w-md sm:max-w-lg
          text-white
        "
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-poppins font-semibold tracking-wide">
            Create Account
          </h1>
          <p className="text-sm sm:text-base text-[#8ee8e8c4] mt-2 font-inter">
            Join us and start collaborating
          </p>
        </div>

        {/* Form */}
        <div className="font-inter">
          <SignupForm />
        </div>

        {/* Footer */}
        <div className="text-gray-400 text-sm text-center font-inter mt-6">
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-[#2ee0cf] hover:text-[#69f3de]
              font-medium transition-all duration-200 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
