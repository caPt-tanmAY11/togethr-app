"use client";

import SignInOauthButton from "@/components/auth/oauth-btn";
import SigninForm from "@/components/auth/sign-in-form";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SigninClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get("reason");

    if (reason === "auth-required") {
      toast.info("Please sign in to continue");
    }
  }, [searchParams]);

  return (
    <div className="relative flex justify-center items-center min-h-dvh px-4 overflow-hidden">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 backdrop-blur-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 sm:p-10 w-full max-w-md sm:max-w-lg text-white my-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-poppins font-semibold tracking-wide">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-[#4cd6d6c4] mt-2 font-inter">
            Enter your credentials to sign in
          </p>
        </div>

        <div className="font-inter">
          <SigninForm />
        </div>

        <div className="flex flex-col gap-4 my-8 font-inter">
          <SignInOauthButton provider="google" signUp={false} />
          <SignInOauthButton provider="github" signUp={false} />
        </div>

        <div className="text-gray-400 text-sm text-center font-inter mt-6">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#2ee0cf] hover:text-[#69f3de] font-medium transition-all duration-200 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
