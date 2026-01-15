"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function LandingHeader({ session }: { session: any }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative w-full border-b border-white/10">
      <div className="px-4 sm:px-6 md:px-12 py-4 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          togethr<span className="text-[#4ff1f1]">.</span>
        </h1>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link href="/about" className="hover:text-white text-lg font-semibold transition">
            About
          </Link>
          <Link href="/contact-us" className="hover:text-white text-lg font-semibold transition">
            Contact
          </Link>
        </nav>

        {!session?.user && (
          <Link
            href="/auth/signin"
            className="sm:flex hidden items-center gap-2
            text-gray-300 hover:text-white
            text-sm px-4 py-1.5 rounded-2xl bg-white/10
            hover:bg-white/20 cursor-pointer"
          >
            Sign in
          </Link>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden absolute left-0 top-full w-full overflow-hidden 
           border-t border-white/10 bg-black/50 rounded-2xl backdrop-blur-lg z-50"
          >
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-4 text-sm">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                About
              </Link>

              <Link
                href="/contact-us"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                Contact
              </Link>

              {!session?.user && (

                <Link
                  href="/auth/signin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2
                  text-gray-300 hover:text-white
                  text-sm px-4 py-1.5 rounded-2xl bg-white/10
                  hover:bg-white/20 cursor-pointer"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
