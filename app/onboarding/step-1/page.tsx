"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OnboardingStep1Skeleton from "@/components/skeletons/onboarding-step1";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface OnboardingMeResponse {
  headline: string | null;
  about: string | null;
  locationCity: string | null;
  locationCountry: string | null;
}

export default function OnboardingStep1() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const cachedData = queryClient.getQueryData<OnboardingMeResponse>([
    "onboarding-me",
  ]);

  const [form, setForm] = useState({
    headline: cachedData?.headline ?? "",
    about: cachedData?.about ?? "",
    locationCity: cachedData?.locationCity ?? "",
    locationCountry: cachedData?.locationCountry ?? "",
  });

  const { data: freshData, isLoading: hydrating } = useQuery({
    queryKey: ["onboarding-me"],
    queryFn: async () => {
      const res = await fetch("/api/onboarding/me");
      if (!res.ok) throw new Error();
      return (await res.json()) as OnboardingMeResponse;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (freshData) {
      setForm({
        headline: freshData.headline ?? "",
        about: freshData.about ?? "",
        locationCity: freshData.locationCity ?? "",
        locationCountry: freshData.locationCountry ?? "",
      });
    }
  }, [freshData]);

  const { mutate: submitStep1, isPending: loading } = useMutation({
    mutationFn: async (formData: typeof form) => {
      const res = await fetch("/api/onboarding/step-1-basic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        throw new Error("Unauthorized");
      }

      if (res.status === 400) {
        handleValidationError(data);
        throw new Error("Validation Error");
      }

      if (!res.ok) {
        toast.error(data?.error || "Something went wrong");
        throw new Error("Server Error");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Step 1 completed");
      queryClient.invalidateQueries({ queryKey: ["onboarding-me"] });
      router.push("/onboarding/step-2");
    },
    onError: (error: any) => {
      if (error.message === "Network error") {
        toast.error("Network error. Please try again.");
      }
    },
  });

  function handleValidationError(data: any) {
    if (Array.isArray(data.fields)) {
      const fieldPriority = [
        "headline",
        "about",
        "locationCity",
        "locationCountry",
      ];
      const firstMissingField = fieldPriority.find((field) =>
        data.fields.includes(field)
      );

      const labels: Record<string, string> = {
        headline: "Headline",
        about: "About section",
        locationCity: "City",
        locationCountry: "Country",
      };

      if (firstMissingField) {
        toast.error(`${labels[firstMissingField]} is required`);
      } else {
        toast.error("Missing required fields");
      }
    } else {
      toast.error(data?.error || "Invalid input");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitStep1(form);
  }

  if (hydrating && !cachedData) {
    return <OnboardingStep1Skeleton />;
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="my-auto w-[95vw] font-inter max-w-md sm:max-w-lg lg:max-w-xl backdrop-blur-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-4 sm:p-8 md:p-10 text-white max-h-[90vh] overflow-y-auto"
    >
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="tracking-widest text-white/60">STEP 1 OF 4</span>
          <span className="text-white/40">Basic details</span>
        </div>
        <div className="mt-2 h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-teal-400 rounded-full" />
        </div>
      </div>

      <div className="mb-5 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold">Let’s get started</h1>
        <p className="text-xs sm:text-base text-white/60 mt-1">
          Add your basic profile information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block mb-1 text-sm text-white/60">Headline *</label>
          <input
            name="headline"
            value={form.headline}
            onChange={handleChange}
            placeholder="Full Stack Developer | Hackathon Enthusiast"
            className="w-full bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2.5 border border-white/10 rounded-md outline-none text-xs sm:text-sm text-white focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-white/60">About *</label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={4}
            placeholder="A short introduction about you..."
            className="w-full whitespace-pre-wrap rounded-lg bg-white/5 border border-white/10 px-2 py-2 sm:px-4 sm:py-2.5 outline-none resize-none text-xs sm:text-sm focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-white/60">City *</label>
            <input
              name="locationCity"
              value={form.locationCity}
              onChange={handleChange}
              placeholder="Mumbai"
              className="w-full bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2.5 border border-white/10 rounded-md outline-none text-xs sm:text-sm focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white/60">
              Country *
            </label>
            <input
              name="locationCountry"
              value={form.locationCountry}
              onChange={handleChange}
              placeholder="India"
              className="w-full bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2.5 border border-white/10 text-xs sm:text-sm rounded-md outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full auth-form-main-btn rounded-lg py-2 sm:py-3 mt-2 text-xs sm:text-sm font-medium disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </motion.div>
  );
}
