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
        {/* Logo */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          togethr<span className="text-[#4ff1f1]">.</span>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link href="/about" className="hover:text-white transition">
            About
          </Link>
          <Link href="/contact-us" className="hover:text-white transition">
            Contact
          </Link>
        </nav>

        {/* Desktop Auth */}
        {!session?.user && (
          <Link
            href="/auth/sign-in"
            className="hidden md:inline-flex bg-[#1f1f1f] hover:bg-[#2a2a2a] px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign in
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
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
                  href="/auth/sign-in"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] px-4 py-2 rounded-lg font-medium transition"
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
