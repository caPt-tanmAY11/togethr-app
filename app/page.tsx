"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import collabSvg from "@/public/collab.svg";
import teamSvg from "@/public/team.svg";
import spamFreeSvg from "@/public/spamFree.svg";
import trustSvg from "@/public/trust.svg";
import profileSvg from "@/public/profile.svg";
import builderSvg from "@/public/builder.svg";

import featureOne from "@/public/feature1.svg";
import featureTwo from "@/public/feature2.svg";
import featureThree from "@/public/feature3.svg";
import LandingHeaderClient from "./landing-header-client";
import HeroSectionClient from "./hero-section-client";
import CTASectionClient from "./cta-section-client";
import Footer from "@/components/footer";

export default function Home() {
  const floatingAnimation = {
    animate: {
      y: [0, -12, 0],
    },
    transition: {
      duration: 5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  };

  const features = [
    {
      title: "HACKATHON TEAMS, DONE RIGHT",
      desc: "Create or join hackathon teams with clear roles, expectations, and a structured request system - no random DMs.",
      svg: teamSvg,
    },
    {
      title: "COLLABORATE BEYOND HACKATHONS",
      desc: "Build real-world projects, find contributors, and work together long-term, not just for competitions.",
      svg: collabSvg,
    },
    {
      title: "SPAM-FREE TEAM REQUESTS",
      desc: "Requests are structured, intentional, and tracked - so team leaders only see serious collaborators.",
      svg: spamFreeSvg,
    },
    {
      title: "BUILD & SHARE YOUR BUILDER PROFILE",
      desc: "Create a clean, professional profile with your skills, bio, and trust score, and share it like a portfolio.",
      svg: profileSvg,
    },
    {
      title: "TRUST-BASED COLLABORATION",
      desc: "Make better collaboration decisions using trust scores built from real platform activity.",
      svg: trustSvg,
    },
    {
      title: "DESIGNED FOR BUILDERS, NOT NOISE",
      desc: "A focused platform made for students and developers who want to build, not scroll or chase likes.",
      svg: builderSvg,
    },
  ];

  return (
    <>
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
          <div
            className="absolute top-[35%] left-1/2 -translate-x-1/2 h-96 w-96 sm:h-125 sm:w-125 rounded-full blur-[140px] sm:blur-[180px] opacity-60"
            style={{ backgroundColor: "#25c7c7" }}
          />
          <div
            className="absolute bottom-32 -left-28 h-64 w-64 sm:h-90 sm:w-90 rounded-full blur-[120px] sm:blur-[150px] opacity-55"
            style={{ backgroundColor: "#2f9b9b" }}
          />
        </div>

        <div className="relative z-10 max-w-[90%] mx-auto">
          <LandingHeaderClient />

          <HeroSectionClient />

          <section className="px-4 sm:px-6 md:px-12 pb-16 sm:pb-20 md:pb-24 mt-16 sm:mt-20">
            <motion.div
              className="
      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
      gap-4 sm:gap-6
      items-stretch
      auto-rows-fr
    "
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                  },
                },
              }}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  variants={{
                    hidden: { y: 40, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      },
                    },
                  }}
                  className="
          w-full h-full
          bg-[#090a15b0]
          border border-white/10
          rounded-2xl
          p-5 sm:p-6
          text-white/80
          hover:bg-[#141520b0]
          transition-colors duration-300
          flex flex-col
        "
                >
                  <div className="flex flex-col sm:flex-row gap-4 h-full">
                    <div className="shrink-0">
                      <Image
                        src={feature.svg}
                        alt="Feature icon"
                        width={45}
                        height={45}
                      />
                    </div>

                    <div className="flex flex-col flex-1">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {feature.title}
                      </h4>

                      <p className="text-sm text-white/60 font-medium leading-relaxed mt-2">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section
            id="about"
            className="px-4 md:max-w-3/4 md:mx-auto sm:px-6 md:px-12
  space-y-16 sm:space-y-20 md:space-y-28
  pb-16 sm:pb-20 md:pb-32"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <motion.div
                className="md:order-1 flex items-center justify-center"
                animate={{ y: [0, -18, 0] }}
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <Image
                  src={featureOne}
                  alt="Structured team formation"
                  width={500}
                  height={500}
                  className="opacity-90"
                />
              </motion.div>

              <div className="md:order-2">
                <h3 className="text-2xl sm:text-4xl font-bold font-poppins mb-3">
                  Structured Team Formation
                </h3>

                <p className="text-white/70 text-lg sm:text-xl leading-relaxed">
                  togethr replaces random DMs and last-minute chaos with clear
                  roles, expectations, and request-based joining. Team leaders
                  stay in control, and contributors know exactly what they’re
                  signing up for.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <motion.div
                className="md:order-2 flex items-center justify-center"
                animate={{ y: [0, -18, 0] }}
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <Image
                  src={featureThree}
                  alt="Collaboration beyond hackathons"
                  height={1000}
                  className="opacity-90"
                />
              </motion.div>

              <div className="md:order-1">
                <h3 className="text-2xl sm:text-4xl font-poppins font-bold mb-3">
                  Collaboration Beyond Hackathons
                </h3>

                <p className="text-white/70 text-lg sm:text-xl leading-relaxed">
                  togethr isn’t limited to weekend hackathons. Build long-term
                  projects, find serious collaborators, and keep working
                  together even after the event ends.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <motion.div
                className="md:order-1 flex items-center justify-center"
                animate={{ y: [0, -18, 0] }}
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <Image
                  src={featureTwo}
                  alt="Trust based ecosystem"
                  width={400}
                  height={400}
                  className="opacity-90"
                />
              </motion.div>

              <div className="md:order-2">
                <h3 className="text-2xl sm:text-4xl font-bold font-poppins mb-3">
                  Build & Share Your Builder Profile
                </h3>

                <p className="text-white/70 text-lg sm:text-xl leading-relaxed">
                  Build a simple, professional profile with your skills, bio,
                  and activity. Share it like a portfolio and get discovered by
                  serious builders, backed by trust earned from real
                  collaborations.
                </p>
              </div>
            </div>
          </section>

          <CTASectionClient />
        </div>
      </div>
      <Footer />
    </>
  );
}
