"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OnboardingStep2Skeleton from "@/components/skeletons/onboarding-step2";

export default function OnboardingStep2() {
  const router = useRouter();

  const [form, setForm] = useState({
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    organization: "",
    XUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/onboarding/me");

        if (!res.ok) throw new Error();

        const data = await res.json();

        setForm({
          organization: data.organization ?? "",
          linkedinUrl: data.linkedinUrl ?? "",
          githubUrl: data.githubUrl ?? "",
          portfolioUrl: data.portfolioUrl ?? "",
          XUrl: data.XUrl ?? "",
        });
      } catch {
      } finally {
        setHydrating(false);
      }
    }

    loadData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/step-2-social", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (res.status === 400) {
        if (
          Array.isArray(data.fields) &&
          data.fields.includes("organization")
        ) {
          toast.error("Organization is required");
        } else {
          toast.error(data?.error || "Invalid input");
        }
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || "Something went wrong");
        return;
      }

      toast.success("Step 2 completed");
      router.push("/onboarding/step-3");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (hydrating) {
    return <OnboardingStep2Skeleton />;
  }

  return (
    <div
      className="relative flex justify-center items-center
    px-3 sm:px-6 lg:px-8 overflow-hidden w-[95vw] my-auto
      max-w-md
      sm:max-w-lg
      lg:max-w-xl"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
    relative z-10 backdrop-blur-2xl
    bg-linear-to-br from-white/10 via-white/5 to-transparent
    border border-white/10 rounded-2xl
    p-6 sm:p-8 md:p-10
    w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
    text-white
  "
      >
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] sm:text-xs tracking-widest text-white/60">
              STEP 2 OF 4
            </span>
            <span className="text-[10px] sm:text-xs text-white/40">
              Social & organization
            </span>
          </div>

          <div className="mt-2 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-2/4 bg-teal-400 rounded-full" />
          </div>
        </div>

        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Your online presence
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Help others know where to find your work
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm mb-1">
              Current organization *
            </label>
            <input
              name="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="College, company, or community"
              className="w-full rounded-lg bg-white/5 border border-white/10
              px-2 sm:px-3 py-1.5
            sm:py-2.5 text-xs sm:text-sm
              outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1">LinkedIn</label>
            <input
              name="linkedinUrl"
              value={form.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full rounded-lg bg-white/5 border border-white/10
              px-2 sm:px-3 py-1.5
            sm:py-2.5 text-xs sm:text-sm
              outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1">GitHub</label>
            <input
              name="githubUrl"
              value={form.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full rounded-lg bg-white/5 border border-white/10
              px-2 sm:px-3 py-1.5
            sm:py-2.5 text-xs sm:text-sm
              outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1">X</label>
            <input
              name="XUrl"
              value={form.XUrl}
              onChange={handleChange}
              placeholder="https://x.com/username"
              className="w-full rounded-lg bg-white/5 border border-white/10
              px-2 sm:px-3 py-1.5
            sm:py-2.5 text-xs sm:text-sm
              outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1">
              Portfolio / Website
            </label>
            <input
              name="portfolioUrl"
              value={form.portfolioUrl}
              onChange={handleChange}
              placeholder="https://yourwebsite.dev"
              className="w-full rounded-lg bg-white/5 border border-white/10
              px-2 sm:px-3 py-1.5
            sm:py-2.5 text-xs sm:text-sm
              outline-none focus:border-white/30"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/onboarding/step-1")}
              className="
              w-full sm:w-1/2
              rounded-lg border border-white/20
              py-2 sm:py-3 text-xs sm:text-sm
              text-white/70 hover:bg-white/5 transition cursor-pointer
            "
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-1/2
          auth-form-main-btn text-xs sm:text-sm
          rounded-lg
          py-2 sm:py-3
          font-medium
          disabled:opacity-60 cursor-pointer"

              // className="
              //   w-full sm:w-1/2
              //   rounded-lg bg-white text-black
              //   py-2 text-xs sm:text-sm font-medium
              //   hover:bg-white/90 transition
              //   disabled:opacity-60
              // "
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
