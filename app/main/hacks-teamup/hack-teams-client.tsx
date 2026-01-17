"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import HacksTeamupCard from "@/components/hacks-teamup-card";
import CustomDropdown from "@/components/custom-dropdown";
import SkillStackSection from "@/components/skill-stack-section";
import TeamSizeDropdown from "@/components/team-size-dropdown";
import HackTeamupCardSkeleton from "@/components/skeletons/hack-teamup-card-skeleton";
import { authClient } from "@/lib/auth-client";

interface HackTeamBrief {
  teamId: string;
  name: string;
  origin: string;
  image?: string;
  size: number;
  spotsLeft: number;
  skillStack: string[];
  hackName: string;
  hackMode: "INPERSON" | "VIRTUAL" | "HYBRID";
  hackLocation: string;
  createdAt: string;
  hackBegins: string;
  hackEnds: string;
}

type TeamScope = "ALL" | "MY_TEAM" | "JOINED_IN" | "REQUESTED";

interface Props {
  initialFilters: {
    scope?: string;
    mode?: string;
    teamSize?: string;
    location?: string;
    skills?: string;
  };
}

export default function HackTeamUpClient({ initialFilters }: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isFilterChanging, setIsFilterChanging] = useState(false);

  const teamSizeOptions = [
    { label: "2 Members", value: 2 },
    { label: "3 Members", value: 3 },
    { label: "4 Members", value: 4 },
    { label: "5 Members", value: 5 },
    { label: "6–10 Members", value: 10 },
    { label: "ANY", value: null },
  ];

  const [scopeFilter, setScopeFilter] = useState<TeamScope>(
    (initialFilters.scope as TeamScope) || "ALL"
  );
  const [hackModeFilter, setHackModeFilter] = useState(
    initialFilters.mode || ""
  );
  const [locationFilter, setLocationFilter] = useState(
    initialFilters.location || ""
  );
  const [skills, setSkills] = useState<string[]>(
    initialFilters.skills?.split(",") || []
  );
  const [teamSizeFilter, setSelectedTeamSizeFilter] = useState(
    initialFilters.teamSize
      ? teamSizeOptions.find(
          (opt) => opt.value === Number(initialFilters.teamSize)
        ) || null
      : null
  );

  const [showFilter, setShowFilter] = useState(false);

  const [appliedQueryString, setAppliedQueryString] = useState(() => {
    const params = new URLSearchParams();
    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    return params.toString();
  });

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["hack-teams", appliedQueryString],

    queryFn: async () => {
      const url = appliedQueryString
        ? `/api/hack-team?${appliedQueryString}`
        : "/api/hack-team";

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please sign in to view this section");
        }
        throw new Error(json.error || "Failed to fetch teams");
      }

      return json.teams as HackTeamBrief[];
    },

    placeholderData: (prev) => prev,

    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isFetching) {
      setIsFilterChanging(false);
    }
  }, [isFetching]);

  const teams = data || [];

  function handleApplyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (scopeFilter !== "ALL") params.set("scope", scopeFilter);
    if (hackModeFilter && hackModeFilter !== "ANY")
      params.set("mode", hackModeFilter);
    if (teamSizeFilter?.value)
      params.set("teamSize", teamSizeFilter.value.toString());
    if (locationFilter) params.set("location", locationFilter);
    if (skills.length > 0) params.set("skills", skills.join(","));

    const newQueryString = params.toString();

    setIsFilterChanging(true);

    setAppliedQueryString(newQueryString);

    router.push(`/main/hacks-teamup?${newQueryString}`, { scroll: false });
    setShowFilter(false);
  }

  function handleResetFilters() {
    setScopeFilter("ALL");
    setHackModeFilter("");
    setSelectedTeamSizeFilter(null);
    setLocationFilter("");
    setSkills([]);

    setAppliedQueryString("");
    router.push("/main/hacks-teamup", { scroll: false });
    setShowFilter(false);
  }

  const hasActiveFilters = appliedQueryString.length > 0;

  const FilterModal =
    typeof window !== "undefined" &&
    createPortal(
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
              className="fixed top-1/2 left-1/2 z-999 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#0f1f1f] border border-white/10 p-6 text-white"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filter Teams</h2>
                <button
                  type="button"
                  onClick={() => setShowFilter(false)}
                  className="text-white/60 hover:text-white transition text-lg leading-none cursor-pointer"
                  aria-label="Close filter modal"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {session && (
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">
                      Team Scope
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          "ALL",
                          "MY_TEAM",
                          "JOINED_IN",
                          "REQUESTED",
                        ] as TeamScope[]
                      ).map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => setScopeFilter(scope)}
                          className={`rounded-lg px-3 py-2 text-sm border transition cursor-pointer ${
                            scopeFilter === scope
                              ? "bg-teal-500/20 border-teal-400 text-teal-300"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          {scope.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  placeholder="Location (Mumbai, Pune...)"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-white/10 px-3 py-2 rounded-md outline-none border border-white/10 focus:border-teal-400/60"
                />

                <CustomDropdown
                  label=""
                  options={["ANY", "INPERSON", "VIRTUAL", "HYBRID"]}
                  placeholder="Select hack mode"
                  selected={hackModeFilter}
                  setSelected={setHackModeFilter}
                />

                <TeamSizeDropdown
                  label=""
                  options={teamSizeOptions}
                  selected={teamSizeFilter}
                  setSelected={setSelectedTeamSizeFilter}
                  required="false"
                />

                <SkillStackSection
                  elements={skills}
                  setElements={setSkills}
                  type="skillstack"
                  section="hack-team"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition cursor-pointer"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-[#236565] hover:bg-[#2f8787] py-2 rounded-lg transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </motion.form>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

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
            <HackTeamupCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (teams.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mt-15 sm:mt-20 font-inter max-w-7xl mx-auto">
          <div className="relative inline-block">
            <h1 className="text-lg sm:text-2xl font-extrabold text-white">
              Hack Teams
            </h1>
            <span className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full bg-linear-to-r from-[#216363] via-[#349292] to-[#216363] shadow-[0_0_12px_rgba(79,241,241,0.4)]" />
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="bg-[#236565] hover:bg-[#2f8787] px-5 py-2 rounded-lg text-sm font-medium text-white transition"
          >
            Filters
          </button>
        </div>

        <div className="my-24 flex flex-col items-center justify-center text-center text-white/80 px-4">
          <div className="w-full max-w-md rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-10">
            <h2 className="text-xl font-semibold text-white">
              {hasActiveFilters
                ? "No teams match your filters"
                : "No teams yet"}
            </h2>
            <p className="text-sm text-white/60 mt-2">
              {hasActiveFilters
                ? "Looks like no teams match your current filters."
                : "Be the first one to create a hack team and start building together."}
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
                  Create a Team
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
    <motion.div
      animate={{ opacity: isFilterChanging ? 0.6 : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mt-15 sm:mt-20 font-inter max-w-7xl mx-auto">
        <div className="relative inline-block">
          <h1 className="text-lg sm:text-2xl font-extrabold text-white">
            Hack Teams
          </h1>
          <span className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full bg-linear-to-r from-[#216363] via-[#349292] to-[#216363] shadow-[0_0_12px_rgba(243,98,98,0.6)]" />
        </div>
        <button
          onClick={() => setShowFilter(true)}
          className="bg-[#236565] hover:bg-[#2f8787] px-5 py-2 rounded-lg text-sm font-medium text-white transition cursor-pointer"
        >
          Filters
        </button>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 my-14 sm:my-20 max-w-7xl mx-auto ${
          isFilterChanging ? "pointer-events-none" : ""
        }`}
      >
        {teams.map((team) => (
          <div
            key={team.teamId}
            className="relative py-3 bg-black/40 backdrop-blur-md border border-white/10 text-white min-h-80 w-full rounded-2xl hover:border-[#4ff1f138] transition-all duration-300"
          >
            <HacksTeamupCard
              teamId={team.teamId}
              teamName={team.name}
              teamOrigin={team.origin}
              hackName={team.hackName}
              hackPlace={team.hackLocation}
              hackMode={team.hackMode}
              hackBegins={team.hackBegins}
              hackEnds={team.hackEnds}
              teamSize={team.size}
              requirements={team.skillStack}
              image={team.image}
            />
          </div>
        ))}
      </div>
      {FilterModal}
    </motion.div>
  );
}
