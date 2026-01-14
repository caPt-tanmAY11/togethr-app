"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="relative min-h-screen bg-[#090a15] text-white font-inter overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -top-30 -left-30 h-80 w-80 sm:h-105 sm:w-105 rounded-full blur-[120px] sm:blur-[160px] opacity-70"
          style={{ backgroundColor: "#2b9f9f" }}
        />
        <div
          className="absolute top-24 -right-28 h-72 w-72 sm:h-95 sm:w-95 rounded-full blur-[100px] sm:blur-[140px] opacity-60"
          style={{ backgroundColor: "#19b4b4" }}
        />
      </div>

      <div className="relative z-10 max-w-[90%] mx-auto my-20">
        <h1 className="text-center my-10 text-[white] text-3xl sm:text-5xl font-medium sm:font-semibold">togethr.</h1>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 backdrop-blur-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 sm:p-10 w-full text-white"
        ></motion.div>
      </div>
    </div>
  );
}
