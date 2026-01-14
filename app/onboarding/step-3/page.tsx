"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import OnboardingStep3Skeleton from "@/components/skeletons/onboarding-step3";

interface EducationForm {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  grade?: string;
  startYear?: string;
  endYear?: string;
  description?: string;
}

export default function OnboardingStep3() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const [education, setEducation] = useState<EducationForm[]>([
    { institution: "" },
  ]);

  useEffect(() => {
    async function loadEducation() {
      try {
        const res = await fetch("/api/onboarding/me");
        if (!res.ok) return;

        const data = await res.json();

        if (Array.isArray(data.education) && data.education.length > 0) {
          setEducation(
            data.education.map((edu: EducationForm) => ({
              institution: edu.institution || "",
              degree: edu.degree || "",
              fieldOfStudy: edu.fieldOfStudy || "",
              grade: edu.grade || "",
              startYear: edu.startYear || "",
              endYear: edu.endYear || "",
              description: edu.description || "",
            }))
          );
        }
      } catch {
      } finally {
        setHydrating(false);
      }
    }

    loadEducation();
  }, []);
  /* ------------------------------------------------------------ */

  function updateField(
    index: number,
    field: keyof EducationForm,
    value: string
  ) {
    setEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addEducation() {
    setEducation((prev) => [...prev, { institution: "" }]);
  }

  function removeEducation(index: number) {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/step-3-education", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ education }),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || "Failed to save education");
        return;
      }

      toast.success("Step 3 completed");
      router.push("/onboarding/step-4");
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (hydrating) {
    return <OnboardingStep3Skeleton />;
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
        w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
        text-white
      "
      >
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] sm:text-xs tracking-widest text-white/60">
              STEP 3 OF 4
            </span>
            <span className="text-[10px] sm:text-xs text-white/40">
              Education
            </span>
          </div>

          <div className="mt-2 h-[2px] w-full bg-white/10 rounded-full">
            <div className="h-full w-3/4 bg-teal-400 rounded-full" />
          </div>
        </div>

        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">Education</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Add your academic background
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <AnimatePresence>
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="
                relative rounded-xl border border-white/10
                p-4 sm:p-5
                space-y-4 bg-white/5
              "
              >
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="
                    absolute top-3 right-3
                    text-white/50 hover:text-red-400
                  "
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div>
                  <input
                    value={edu.institution}
                    onChange={(e) =>
                      updateField(index, "institution", e.target.value)
                    }
                    placeholder="University / College / School"
                    className="
                    w-full rounded-lg bg-white/5 border border-white/10
                    px-2 sm:px-3 py-1.5
                    sm:py-2.5
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <input
                    placeholder="Degree (B.Tech, BSc, etc.)"
                    value={edu.degree || ""}
                    onChange={(e) =>
                      updateField(index, "degree", e.target.value)
                    }
                    className="
                    rounded-lg bg-white/5 border border-white/10
                   px-2 sm:px-3 py-1.5
            sm:py-2.5
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />

                  <input
                    placeholder="Field of study"
                    value={edu.fieldOfStudy || ""}
                    onChange={(e) =>
                      updateField(index, "fieldOfStudy", e.target.value)
                    }
                    className="
                    rounded-lg bg-white/5 border border-white/10
                    px-2 sm:px-3 py-1.5
            sm:py-2.5
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />

                  <input
                    placeholder="Grade / CGPA"
                    value={edu.grade || ""}
                    onChange={(e) =>
                      updateField(index, "grade", e.target.value)
                    }
                    className="
                    rounded-lg bg-white/5 border border-white/10
                    px-2 sm:px-3 py-1.5
            sm:py-2.5
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    placeholder="Start year"
                    value={edu.startYear || ""}
                    onChange={(e) =>
                      updateField(index, "startYear", e.target.value)
                    }
                    className="
                    rounded-lg bg-white/5 border border-white/10
                    px-2 sm:px-3 py-1.5
            sm:py-2.5
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />

                  <input
                    placeholder="End year"
                    value={edu.endYear || ""}
                    onChange={(e) =>
                      updateField(index, "endYear", e.target.value)
                    }
                    className="
                    rounded-lg bg-white/5 border border-white/10
                    px-2 sm:px-3 py-1.5
            sm:py-2.5
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />
                </div>

                <textarea
                  placeholder="Description"
                  value={edu.description || ""}
                  onChange={(e) =>
                    updateField(index, "description", e.target.value)
                  }
                  rows={3}
                  className="
                  w-full rounded-lg bg-white/5 border border-white/10
                  px-2 sm:px-3 py-1.5
            sm:py-2.5
                  text-xs sm:text-sm
                  outline-none resize-none focus:border-white/30
                "
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={addEducation}
            className="
            flex items-center gap-2
            text-xs sm:text-sm text-white/70
            hover:text-white transition
          "
          >
            <Plus size={16} /> Add another education
          </button>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
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
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
