"use client";

import CustomDropdown from "@/components/custom-dropdown";
import ProjectCard from "@/components/project-card";
import ProjectCardSkeleton from "@/components/skeletons/project-card-skeleton";
import SkillStackSection from "@/components/skill-stack-section";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ProjectBrief {
  id: string;
  title: string;
  shortDesc: string;
  stage: "IDEA" | "BUILDING" | "MVP" | "LIVE";
  skillStack: string[];
  commitment: "LOW" | "MEDIUM" | "HIGH";
  tags: string[];
  currentMembers: number;
}

type ProjectScope = "ALL" | "MY_PROJECT" | "CONTRIBUTING_IN" | "REQUESTED";

interface Props {
  initialFilters: {
    scope?: string;
    stage?: string;
    commitment?: string;
    skills?: string;
    tags?:string;
  };
}

export default function ProjectsClient({ initialFilters }: Props) {
  const [isFilterChanging, setIsFilterChanging] = useState(false);

  const [projectCommitmentFilter, setProjectCommitmentFilter] = useState(
    initialFilters.commitment || "",
  );
  const [skills, setSkills] = useState<string[]>(
    initialFilters.skills?.split(",") || [],
  );

  const [tags, setTags] = useState<string[]>(
    initialFilters.tags?.split(",") || [],
  );

  const [projectStageFilter, setProjectStageFilter] = useState(
    initialFilters.stage || "",
  );
  const [scopeFilter, setScopeFilter] = useState<ProjectScope>(
    (initialFilters.scope as ProjectScope) || "ALL",
  );

  const [showFilter, setShowFilter] = useState(false);

  const { data: session } = authClient.useSession();

  const router = useRouter();

  const [appliedQueryString, setAppliedQueryString] = useState(() => {
    const params = new URLSearchParams();
    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    return params.toString();
  });

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["projects", appliedQueryString],

    queryFn: async () => {
      const url = appliedQueryString
        ? `/api/projects?${appliedQueryString}`
        : "/api/projects";

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 401)
          throw new Error("You must be logged in to view these projects.");
        if (res.status === 400)
          throw new Error(json.error || "Invalid request.");
        throw new Error(json.error || "Something went wrong.");
      }

      return json.projects as ProjectBrief[];
    },

    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,

    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!isFetching) {
      setIsFilterChanging(false);
    }
  }, [isFetching]);

  const projects = data || [];

  const FilterModal =
    typeof window !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {showFilter && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-998"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilter(false)}
                />

                <motion.form
                  onSubmit={handleApplyFilters}
                  className="fixed top-1/2 left-1/2 z-998 w-[90%] max-w-md
              -translate-x-1/2 -translate-y-1/2 rounded-2xl
              bg-[#0c0a0a] border border-white/10 p-6 text-white"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Filter Projects</h2>

                    <button
                      type="button"
                      onClick={() => setShowFilter(false)}
                      className="
                text-white/60 hover:text-white
                transition
                text-lg leading-none cursor-pointer
              "
                      aria-label="Close filter modal"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {session && (
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">
                          Project Scope
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              "ALL",
                              "MY_PROJECT",
                              "CONTRIBUTING_IN",
                              "REQUESTED",
                            ] as ProjectScope[]
                          ).map((scope) => (
                            <button
                              key={scope}
                              type="button"
                              onClick={() => setScopeFilter(scope)}
                              className={`rounded-lg px-3 py-2 text-sm border transition cursor-pointer
                            ${
                              scopeFilter === scope
                                ? "bg-[#882d2d5d] border-[#be3939c5] text-[#be3939c5]"
                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                            }`}
                            >
                              {scope.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <CustomDropdown
                      label=""
                      options={["ANY", "IDEA", "BUILDING", "MVP", "LIVE"]}
                      placeholder="Select project stage"
                      selected={projectStageFilter}
                      setSelected={setProjectStageFilter}
                      type="projects"
                    />

                    <CustomDropdown
                      label=""
                      options={["ANY", "LOW", "MEDIUM", "HIGH"]}
                      placeholder="Select commitment level"
                      selected={projectCommitmentFilter}
                      setSelected={setProjectCommitmentFilter}
                      type="projects"
                    />

                    <SkillStackSection
                      elements={skills}
                      setElements={setSkills}
                      type="skillstack"
                      section="projects"
                    />

                    <SkillStackSection
                      section="projects"
                      elements={tags}
                      setElements={setTags}
                      type="tags"
                    />
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#f36262b7] hover:bg-[#fc8e8eb7] py-2 rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </motion.form>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null;

  async function handleApplyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (scopeFilter !== "ALL") params.set("scope", scopeFilter);
    if (projectStageFilter) params.set("stage", projectStageFilter);

    if (projectCommitmentFilter)
      params.set("commitment", projectCommitmentFilter);
    if (skills.length > 0) params.set("skills", skills.join(","));

    if (tags.length > 0) params.set("tags", tags.join(","));

    const newQueryString = params.toString();

    setIsFilterChanging(true);

    setAppliedQueryString(newQueryString);

    router.push(`/main/projects?${newQueryString}`, { scroll: false });
    setShowFilter(false);
  }

  function handleResetFilters() {
    setScopeFilter("ALL");
    setProjectCommitmentFilter("ANY");
    setProjectStageFilter("ANY");
    setSkills([]);
    setTags([]);

    setAppliedQueryString("");
    router.push("/main/projects", { scroll: false });

    setShowFilter(false);
  }

  const hasActiveFilters = appliedQueryString.length > 0;

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-between mt-15 sm:mt-20 max-w-7xl mx-auto animate-pulse">
          <div className="h-7 w-40 bg-white/10 rounded" />
          <div className="h-9 w-24 bg-white/10 rounded-lg" />
        </div>

        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6 sm:gap-8 lg:gap-10
          my-14 sm:my-20
          max-w-7xl
          mx-auto
          place-items-center
        "
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (error) return <p className="text-red-400">{(error as Error).message}</p>;

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-between mt-15 sm:mt-20 max-w-7xl mx-auto animate-pulse">
          <div className="h-7 w-40 bg-white/10 rounded" />
          <div className="h-9 w-24 bg-white/10 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 my-14 sm:my-20 max-w-7xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // const hasActiveFilters =
  //   Boolean(projectCommitmentFilter) ||
  //   Boolean(projectStageFilter) ||
  //   Boolean(scopeFilter) ||
  //   // scopeFilter !== "ALL" ||
  //   skills.length > 0;

  if (projects.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mt-15 sm:mt-20 font-inter max-w-7xl mx-auto">
          <div className="relative inline-block">
            <h1 className="text-lg sm:text-2xl font-extrabold text-white">
              Projects
            </h1>

            <span
              className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full
      bg-linear-to-r from-[#f36262] via-[#fc8e8e] to-[#f36262]
      shadow-[0_0_12px_rgba(243,98,98,0.6)]"
            />
          </div>

          <button
            onClick={() => setShowFilter(true)}
            className="bg-[#f36262b7] hover:bg-[#fc8e8eb7]
          px-5 py-2 rounded-lg text-sm font-medium text-white transition"
          >
            Filters
          </button>
        </div>

        <div className="my-24 flex flex-col items-center justify-center text-center text-white/80 px-4">
          <div
            className="
            w-full max-w-md
            rounded-2xl
            bg-black/40
            backdrop-blur-md
            border border-white/10
            p-10
          "
          >
            <h2 className="text-xl font-semibold text-white">
              {hasActiveFilters
                ? "No projects match your filters"
                : "No projects yet"}
            </h2>

            <p className="text-sm text-white/60 mt-2">
              {hasActiveFilters
                ? "Looks like no projects match your current filters."
                : "Be the first one to create a project and start building together."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {hasActiveFilters ? (
                <button
                  onClick={() => setShowFilter(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition"
                >
                  Change Filters
                </button>
              ) : (
                <button
                  onClick={() => router.push("/main/hacks-teamup/create")}
                  className="flex-1 bg-[#236565] hover:bg-[#2f8787] py-2 rounded-lg transition"
                >
                  Create a Project
                </button>
              )}
            </div>
          </div>
        </div>
        {FilterModal}
      </>
    );
  }

  return (
    <>
      <motion.div
        animate={{ opacity: isFilterChanging ? 0.6 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between mt-15 sm:mt-20 max-w-7xl mx-auto">
          <div className="relative inline-block">
            <h1 className="text-lg sm:text-2xl font-semibold text-white">
              Projects
            </h1>

            <span
              className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full
      bg-linear-to-r from-[#f36262] via-[#fc8e8e] to-[#f36262]
      shadow-[0_0_12px_rgba(243,98,98,0.6)]"
            />
          </div>

          <button
            onClick={() => setShowFilter(true)}
            className="bg-[#f36262b7] hover:bg-[#fc8e8eb7]
    px-5 py-2 rounded-lg text-sm font-medium text-white transition cursor-pointer"
          >
            Filters
          </button>
        </div>

        <div
          className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-6 sm:gap-8 lg:gap-10
    my-14 sm:my-20
    max-w-7xl
    mx-auto
    place-items-center
  "
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="
    relative
    py-3
    w-full
    max-w-sm
    bg-black/40 backdrop-blur-md
    border border-white/10 text-white
    min-h-[520px]
    rounded-2xl
    hover:border-[#fd716c3f]
    transition-all duration-300
  "
            >
              <ProjectCard
                projectId={project.id}
                title={project.title}
                shortDesc={project.shortDesc}
                stage={project.stage}
                skillStack={project.skillStack}
                commitment={project.commitment}
                tags={project.tags}
                currentMembers={project.currentMembers}
              />
            </div>
          ))}
        </div>

        {FilterModal}
      </motion.div>
    </>
  );
}
