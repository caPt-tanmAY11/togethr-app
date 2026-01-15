"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#090a15] text-white font-inter overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -top-32 -left-32 h-72 w-72 sm:h-105 sm:w-105 rounded-full blur-[120px] sm:blur-[160px] opacity-70"
          style={{ backgroundColor: "#2b9f9f" }}
        />
        <div
          className="absolute top-24 -right-28 h-64 w-64 sm:h-95 sm:w-95 rounded-full blur-[100px] sm:blur-[140px] opacity-60"
          style={{ backgroundColor: "#19b4b4" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 my-20 sm:my-2">
        <div className="w-full max-w-5xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="
              backdrop-blur-2xl
              bg-gradient-to-br from-white/10 via-white/5 to-transparent
              border border-white/10
              rounded-3xl
              p-8 sm:p-12
              text-center
            "
          >
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
              Contact Us
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-white/70 max-w-xl mx-auto">
              Have a question, feedback, or partnership idea? We’d love to hear
              from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="
                backdrop-blur-2xl
                bg-gradient-to-br from-white/10 via-white/5 to-transparent
                border border-white/10
                rounded-3xl
                p-8 sm:p-10
                space-y-6
              "
            >
              <div>
                <h3 className="text-2xl font-semibold mb-2">Let’s talk</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Whether you’re facing an issue, have a feature suggestion, or
                  want to collaborate, drop us a message and we’ll get back to
                  you as soon as possible.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-white/50">Email</p>
                  <p className="text-white font-medium">community.togethr@gmail.com</p>
                </div>

                <div>
                  <p className="text-white/50">Response time</p>
                  <p className="text-white font-medium">Within 24–48 hours</p>
                </div>
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-3xl p-8 sm:p-10 space-y-5"
            >
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
              />

              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
              />

              <textarea
                rows={4}
                placeholder="Tell us how we can help..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg bg-white/10 px-4 py-2.5 resize-none text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
              />

              <button
                type="submit"
                disabled={loading}
                className="auth-form-main-btn cursor-pointer text-white rounded-lg w-full py-2 sm:py-3 font-medium transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
