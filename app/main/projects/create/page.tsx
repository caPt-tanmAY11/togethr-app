"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import CustomDropdown from "@/components/custom-dropdown";
import SkillStackSection from "@/components/skill-stack-section";
import { authClient } from "@/lib/auth-client";
import { isValidEmail } from "@/lib/utils";

export default function CreateProjectPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedProjectStage, setSelectedProjectedStage] =
    useState<string>("");
  const [selectedCommitment, setSelectedCommitment] = useState<string>("");

  const [skills, setSkills] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  async function handleCreateProjectFormSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    if (isCreating) return;

    setIsCreating(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const projectData = {
        title: String(formData.get("project-name") || "").trim(),
        githubURL:
          String(formData.get("project-github-url") || "").trim() || undefined,
        shortDesc: String(formData.get("short-desc") || "").trim(),
        detailedDesc: String(formData.get("detailed-desc") || "").trim(),
        skillStack: skills,
        tags: tags,
        stage: selectedProjectStage,
        commitment: selectedCommitment,
        extraNote: String(formData.get("extra-note") || "").trim() || undefined,
        ownerLinkedInURL: String(formData.get("linkedin") || "").trim(),
        contactPhone: String(formData.get("phone") || "").trim() || undefined,
        contactEmail: String(formData.get("email") || "").trim(),
        ownerId: session?.user.id,
        ownerName: session?.user.name,
      };

      if (!isValidEmail(projectData.contactEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (
          data.fields &&
          Array.isArray(data.fields) &&
          data.fields.length > 0
        ) {
          const field = data.fields[0];
          let msg = "";

          switch (field) {
            case "title":
              msg = "Project title is required";
              break;
            case "shortDesc":
              msg = "Short description is required";
              break;
            case "detailedDesc":
              msg = "Detailed description is required";
              break;
            case "stage":
              msg = "Project stage is required";
              break;
            case "commitment":
              msg = "Commitment is required";
              break;
            case "contactEmail":
              msg = "Contact email is required";
              break;
            case "ownerLinkedInURL":
              msg = "LinkedIn URL is required";
              break;
            case "ownerId":
            case "ownerName":
              msg = "Owner information is missing";
              break;
            case "tags":
              msg = "Add at least one project tag";
              break;
            case "skillStack":
              msg = "Add at least one skill";
              break;
            default:
              msg = "Some required field is missing";
          }

          toast.error(msg);
        } else {
          toast.error(data?.error || "Failed to create project");
        }

        return;
      }

      toast.success("Project created successfully!");
      router.replace("/main/projects");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Could not create project");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleCreateProjectFormSubmit}>
      <div className="mx-auto mt-28 mb-40 w-[92%] max-w-7xl font-inter text-white">
        <motion.div
          className="mb-14 text-center"
          // initial={{ y: -30, opacity: 0 }}
          // animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Create a Project
          </h1>
          <p className="mt-3 text-white/60 max-w-2xl mx-auto">
            Share your idea, define expectations, and find collaborators who
            genuinely want to build.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10">
          <div className="flex flex-col gap-10">
            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-lg font-semibold mb-5">Project Overview</h2>

              <div className="space-y-4">
                <input
                  name="project-name"
                  placeholder="Project name *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
                />

                <input
                  name="project-github-url"
                  placeholder="GitHub repository"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
                />

                <textarea
                  name="short-desc"
                  rows={3}
                  maxLength={220}
                  placeholder="Short description (what & why) *"
                  className="
    w-full rounded-lg bg-white/10
    px-4 py-3 text-sm
    resize-none outline-none
    border border-white/15
    focus:ring-1 focus:ring-[#f36262]
    whitespace-pre-wrap
  "
                />

                <textarea
                  name="detailed-desc"
                  rows={9}
                  maxLength={2500}
                  placeholder="Detailed description (problem, solution, scope) *"
                  className="w-full rounded-lg bg-white/10 px-4 py-3 whitespace-pre-wrap text-sm resize-none outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
                />
              </div>
            </motion.div>

            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-lg font-semibold mb-5">Project Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <CustomDropdown
                  label=""
                  options={["IDEA", "BUILDING", "MVP", "LIVE"]}
                  placeholder="Project stage *"
                  selected={selectedProjectStage}
                  setSelected={setSelectedProjectedStage}
                  type="projects"
                />

                <CustomDropdown
                  label=""
                  options={["LOW", "MEDIUM", "HIGH"]}
                  placeholder="Commitment level *"
                  selected={selectedCommitment}
                  setSelected={setSelectedCommitment}
                  type="projects"
                />
              </div>

              <SkillStackSection
                section="projects"
                elements={tags}
                setElements={setTags}
                type="tags"
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-10">
            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-lg font-semibold mb-5">
                Tech Stack & Collaboration
              </h2>

              <SkillStackSection
                section="projects"
                elements={skills}
                setElements={setSkills}
                type="skillstack"
              />

              <textarea
                rows={3}
                name="extra-note"
                placeholder="What kind of collaborators are you looking for?"
                className="mt-4 w-full whitespace-pre-wrap rounded-lg bg-white/10 px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
              />
            </motion.div>

            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-lg font-semibold mb-5">Owner & Contact</h2>

              <div className="space-y-4">
                <input
                  name="linkedin"
                  placeholder="LinkedIn profile URL *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
                />

                <input
                  name="phone"
                  placeholder="Phone number"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
                />

                <input
                  name="email"
                  placeholder="Contact email *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#f36262] border border-white/15"
                />
              </div>

              <div className="mt-6">
                <motion.button
                  type="submit"
                  disabled={isCreating}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full rounded-xl px-8 py-2 font-medium shadow-md transition-all cursor-pointer
                    ${
                      isCreating
                        ? "bg-[#c93a3ab7] cursor-not-allowed"
                        : "bg-[#f36262b7] hover:bg-[#fc8e8eb7]"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {isCreating ? (
                      <motion.div
                        key="loading"
                        className="flex items-center justify-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Creating project…</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Create Project
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </form>
  );
}
