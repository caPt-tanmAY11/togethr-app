"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function OnboardingSuccess() {
  const router = useRouter();

  useEffect(() => {
    let redirected = false;

    const completeOnboarding = async () => {
      try {
        await fetch("/api/onboarding/complete", {
          method: "PATCH",
        });
      } catch (err) {
        console.error("Onboarding completion failed", err);
      }
    };

    completeOnboarding();

    const timer = setTimeout(() => {
      if (!redirected) {
        redirected = true;
        router.push("/main/hacks-teamup");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex justify-center items-center min-h-screen px-4 overflow-hidden">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 backdrop-blur-2xl
        bg-linear-to-br from-white/10 via-white/5 to-transparent
        border border-white/10 rounded-2xl
        p-10 w-full max-w-md text-center text-white"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle size={64} className="text-teal-400" />
        </motion.div>

        <h1 className="text-2xl font-semibold mb-2">Profile Setup Complete!</h1>

        <p className="text-sm text-white/60 mb-6">
          Your profile is ready. You’ll be redirected shortly.
        </p>

        <button
          onClick={() => router.push("/main/hacks-teamup")}
          className="w-full rounded-lg bg-white text-black
          py-2 text-sm font-medium hover:bg-white/90 transition"
        >
          Go to Main page
        </button>

        <p className="mt-4 text-xs text-white/40">Redirecting in 5 seconds…</p>
      </motion.div>

      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2
          w-72 h-72 rounded-full bg-teal-400/20 blur-[120px]"
        />
      </div>
    </div>
  );
}
