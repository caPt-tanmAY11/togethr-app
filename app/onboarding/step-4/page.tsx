"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CustomDropdown from "@/components/custom-dropdown";
import AchievementCategoryDropdown from "@/components/achievement-category-dropdown";

interface AchievementForm {
  title: string;
  description?: string;
  issuer?: string;
  category?: string;
  proofUrl?: string;
}

export default function OnboardingStep4() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* -------------------- Skills -------------------- */
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  /* -------------------- Achievements -------------------- */
  const [achievements, setAchievements] = useState<AchievementForm[]>([
    { title: "" },
  ]);

  const [selectedProjectStage, setSelectedProjectedStage] =
    useState<string>("");

  /* -------------------- LOAD PREVIOUS DATA -------------------- */
  useEffect(() => {
    async function loadStep4Data() {
      try {
        const res = await fetch("/api/onboarding/me");
        if (!res.ok) return;

        const data = await res.json();

        // Load skills
        if (Array.isArray(data.skills)) {
          setSkills(data.skills);
        }

        // Load achievements
        if (Array.isArray(data.achievements) && data.achievements.length > 0) {
          setAchievements(
            data.achievements.map((ach: AchievementForm) => ({
              title: ach.title || "",
              description: ach.description || "",
              issuer: ach.issuer || "",
              category: ach.category || "",
              proofUrl: ach.proofUrl || "",
            }))
          );
        }
      } catch (err) {
        // silent fail
      }
    }

    loadStep4Data();
  }, []);
  /* -------------------------------------------------- */

  /* -------------------- Skills Functions -------------------- */
  function addSkill() {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  /* -------------------- Achievements Functions -------------------- */
  function updateAchievement(
    index: number,
    field: keyof AchievementForm,
    value: string
  ) {
    setAchievements((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  function addAchievement() {
    setAchievements((prev) => [...prev, { title: "" }]);
  }

  function removeAchievement(index: number) {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  }

  /* -------------------- Submit -------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ---------- VALIDATE SKILLS ----------
    if (!skills.length) {
      toast.error("Add at least one skill");
      return;
    }

    // ---------- VALIDATE ACHIEVEMENTS ----------
    const missingAchievement = achievements.find((a) => !a.title?.trim());
    if (missingAchievement) {
      toast.error("Achievement title is required");
      return;
    }

    setLoading(true);

    try {
      // ---------- CLEAN DATA ----------
      const cleanedAchievements = achievements.filter(
        (a) => a.title?.trim() !== ""
      );

      // ---------- SEND REQUEST ----------
      const res = await fetch("/api/onboarding/step-4-skills-achievements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          achievements: cleanedAchievements,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Show server validation error if exists
        if (data?.error) toast.error(data.error);
        else throw new Error();
        return;
      }

      toast.success("Step 4 completed!");
      router.push("/onboarding/success");
    } catch {
      toast.error("Failed to save details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex justify-center items-center min-h-screen
    px-3 sm:px-6 lg:px-8 overflow-hidden"
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
        w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl
        text-white
      "
      >
        {/* STEP INDICATOR */}
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-between gap-4 text-[10px] sm:text-xs text-white/60 tracking-widest">
            <span>STEP 4 OF 4</span>
            <span>Skills & Achievements</span>
          </div>

          <div className="mt-2 h-[2px] bg-white/10 rounded-full">
            <div className="h-full w-full bg-teal-400 rounded-full" />
          </div>
        </div>

        {/* HEADER */}
        <h1 className="text-xl sm:text-2xl font-semibold mb-1">
          Skills & Achievements
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mb-5 sm:mb-6">
          Showcase what you’re good at
        </p>

        <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
          {/* SKILLS */}
          <div>
            <label className="block text-xs sm:text-sm mb-2">Skills</label>

            {/* SKILL TAGS */}
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="
                  flex items-center gap-1
                  bg-white/10 border border-white/10
                  px-2.5 sm:px-3 py-1
                  rounded-full
                  text-xs sm:text-sm
                "
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-white/60 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            {/* ADD SKILL */}
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill"
                className="
                flex-1 rounded-lg bg-white/5 border border-white/10
                px-3 sm:px-4 py-2
                text-xs sm:text-sm
                outline-none focus:border-white/30
              "
              />

              <button
                type="button"
                onClick={addSkill}
                disabled={!skillInput.trim()}
                className="
                flex items-center justify-center
                rounded-lg bg-white/10 border border-white/10
                px-3
                hover:bg-white/20
                disabled:opacity-40 disabled:cursor-not-allowed
              "
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* ACHIEVEMENTS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm">Achievements</label>
              <button
                type="button"
                onClick={addAchievement}
                className="flex items-center gap-1 text-xs sm:text-sm text-white/70 hover:text-white"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <AnimatePresence>
              {achievements.map((ach, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="
                  relative mb-4 rounded-xl
                  border border-white/10 bg-white/5
                  p-4 sm:p-5
                  space-y-3
                "
                >
                  {achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="absolute top-3 right-3 text-white/50 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <input
                    placeholder="Achievement title *"
                    value={ach.title}
                    onChange={(e) =>
                      updateAchievement(index, "title", e.target.value)
                    }
                    className="
                    w-full rounded-lg bg-white/5 border border-white/10
                    px-3 sm:px-4 py-2
                    text-xs sm:text-sm
                    outline-none focus:border-white/30
                  "
                  />

                  <textarea
                    placeholder="Description (optional)"
                    value={ach.description || ""}
                    onChange={(e) =>
                      updateAchievement(index, "description", e.target.value)
                    }
                    rows={2}
                    className="
                    w-full rounded-lg bg-white/5 border border-white/10
                    px-3 sm:px-4 py-2
                    text-xs sm:text-sm
                    outline-none resize-none
                  "
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Issuer (Hackathon, Company, etc.)"
                      value={ach.issuer || ""}
                      onChange={(e) =>
                        updateAchievement(index, "issuer", e.target.value)
                      }
                      className="
                      rounded-lg bg-white/5 border border-white/10
                      px-3 sm:px-4 py-2
                      text-xs sm:text-sm
                      outline-none
                    "
                    />

                    <AchievementCategoryDropdown
                      value={ach.category}
                      onChange={(val) =>
                        updateAchievement(index, "category", val)
                      }
                    />
                  </div>

                  <input
                    placeholder="Proof URL (optional)"
                    value={ach.proofUrl || ""}
                    onChange={(e) =>
                      updateAchievement(index, "proofUrl", e.target.value)
                    }
                    className="
                    w-full rounded-lg bg-white/5 border border-white/10
                    px-3 sm:px-4 py-2
                    text-xs sm:text-sm
                    outline-none
                  "
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="
              w-full sm:w-1/2
              rounded-lg border border-white/20
              py-2 text-xs sm:text-sm
              text-white/70 hover:bg-white/5 cursor-pointer
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
          py-1.5 sm:py-3
          font-medium
          disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Finishing..." : "Finish"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
