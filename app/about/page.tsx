"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="relative font-inter min-h-screen bg-[#090a15] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full blur-[160px] opacity-60 bg-[#2b9f9f]" />
        <div className="absolute top-24 -right-32 h-72 w-72 rounded-full blur-[140px] opacity-50 bg-[#19b4b4]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 py-28 space-y-20">
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
            togethr.
          </h1>
          <p className="text-white/60 text-lg sm:text-2xl">
            Building teams. Creating trust. Working together.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 sm:p-12"
        >
          <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-[#2b9f9f] to-transparent" />

          <div className="space-y-5 text-lg text-white/80 leading-relaxed max-w-3xl">
            <p>
              togethr is not just a web application or a user platform. It is a
              community of curious, enthusiastic students, developers, and
              builders who want to create real things together.
            </p>
            <p>
              It is built for people who genuinely want to build, but struggle
              to find the right collaborators. Forming hackathon teams or
              finding serious teammates often turns into random DMs, confusion,
              and last-minute stress.
            </p>
            <p className="text-white font-medium">
              That problem is what led to togethr.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-3xl"
          >
            <h3 className="text-xl sm:text-2xl font-semibold">
              Finding the right people
            </h3>
            <p className="text-white/70 text-lg leading-relaxed">
              togethr helps you find people who share the same mindset, goals,
              and seriousness. Whether it’s for hackathons or long-term
              projects, the platform focuses on real collaboration, not just
              temporary teaming up.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-3xl"
          >
            <h3 className="text-xl sm:text-2xl font-semibold">
              Clear and structured collaboration
            </h3>
            <p className="text-white/70 text-lg leading-relaxed">
              To avoid spam and chaos, togethr uses a structured request system.
              Users send join or collaboration requests, and team leads or
              project owners review and approve them. This keeps everything
              intentional and organized.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-3xl"
          >
            <h3 className="text-xl sm:text-2xl font-semibold">
              Trust built through action
            </h3>
            <p className="text-white/70 text-lg leading-relaxed">
              togethr includes a trust score system to reduce fake profiles and
              spam. Trust is earned through real actions, like being accepted
              into teams or projects - so credibility comes from actual platform
              activity, not just claims.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl pt-10 border-t border-white/10"
        >
          <p className="text-white/80 text-lg leading-relaxed">
            Whether you are starting a hackathon team, building a long-term
            project, or looking for serious builders to collaborate with,
            togethr gives you a clean and focused space to work together.
          </p>
          <p className="mt-4 text-lg text-white font-medium">
            We believe good teams are built on clarity, trust, and shared goals
            - and togethr is designed around exactly that.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
