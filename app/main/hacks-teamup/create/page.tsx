"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import SkillStackSection from "@/components/skill-stack-section";
import EventDetailsSection from "@/components/event-details-section";
import TeamSizeDropdown from "@/components/team-size-dropdown";
import { isValidEmail } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export default function CreateHackTeam() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const queryClient = useQueryClient();

  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const teamSizeOptions = [
    { label: "2 Members", value: 2 },
    { label: "3 Members", value: 3 },
    { label: "4 Members", value: 4 },
    { label: "5 Members", value: 5 },
    { label: "6–10 Members", value: 10 },
  ];

  const [selectedTeamSize, setSelectedTeamSize] = useState<{
    label: string;
    value: number | null;
  } | null>(null);

  const [skills, setSkills] = useState<string[]>([]);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    mode: "",
    link: "",
    location: "",
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      const res = await fetch("/api/hack-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw data;
      return data;
    },

    onSuccess: async (data, variables) => {
      if (teamImage) {
        if (teamImage.size > MAX_IMAGE_SIZE) {
          toast.error("Team created, but image exceeded size limit");
          return;
        }

        const imageFormData = new FormData();
        imageFormData.append("file", teamImage);
        imageFormData.append("type", "hack-team");
        imageFormData.append("entityId", data.hackTeam.teamId);

        const uploadRes = await fetch("/api/upload/image", {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadRes.ok) toast.error("Team created, but image upload failed");
      }

      await queryClient.invalidateQueries({
        queryKey: ["hack-teams"],
      });

      toast.success("Team created successfully!");
      router.push("/main/hacks-teamup");
    },

    onError: (err: any) => {
      if (Array.isArray(err.fields) && err.fields.length > 0) {
        const field = err.fields[0];
        switch (field) {
          case "name":
            toast.error("Team name is required");
            break;
          case "origin.city":
            toast.error("City is required");
            break;
          case "origin.country":
            toast.error("Country is required");
            break;
          case "size":
            toast.error("Invalid team size");
            break;
          case "skillStack":
            toast.error("Add at least one skill");
            break;
          case "hackDetails.name":
            toast.error("Hackathon name is required");
            break;
          case "hackDetails.startTime":
            toast.error("Hackathon start time is required");
            break;
          case "hackDetails.endTime":
            toast.error("Hackathon end time is required");
            break;
          case "hackDetails.location":
            toast.error("Hackathon location is required");
            break;
          case "hackDetails.mode":
            toast.error("Hackathon mode is required");
            break;
          case "teamLeadEmail":
            toast.error("Team lead email is required");
            break;
          default:
            toast.error(err.error || "Failed to create team");
        }
      } else toast.error(err.error || "Failed to create team");
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleCreateTeamFormSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in to create a hack team");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);

    const teamData = {
      name: String(formData.get("team-name") || "").trim(),
      origin: {
        city: String(formData.get("team-origin-city") || "").trim(),
        country: String(formData.get("team-origin-country") || "").trim(),
      },
      size: selectedTeamSize?.value,
      skillStack: skills,
      hackDetails: eventDetails,
      teamLeadPhone: String(formData.get("phone-no") || "").trim(),
      teamLeadEmail: String(formData.get("email") || "").trim(),
      teamDesc: String(formData.get("team-desc") || "").trim() || undefined,
    };

    if (!teamData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (!teamData.origin.city.trim()) {
      toast.error("Team city is required");
      return;
    }

    if (!teamData.origin.country.trim()) {
      toast.error("Team country is required");
      return;
    }

    if (!teamData.size) {
      toast.error("Team size is required");
      return;
    }

    if (!teamData.hackDetails.name.trim()) {
      toast.error("Hack name is required");
      return;
    }

    if (!teamData.hackDetails.startTime || !teamData.hackDetails.endTime) {
      toast.error("Hack time details is required");
      return;
    }

    if (!teamData.hackDetails.mode) {
      toast.error("Hack mode is required");
      return;
    }

    if (!teamData.hackDetails.location) {
      toast.error("Hack location is required");
      return;
    }

    if (teamData.skillStack.length === 0) {
      toast.error("At least one skill is required");
      return;
    }

    if (!isValidEmail(teamData.teamLeadEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (teamImage) {
      if (!ALLOWED_IMAGE_TYPES.includes(teamImage.type)) {
        toast.error("Only PNG or JPG images are allowed");
        return;
      }

      if (teamImage.size > MAX_IMAGE_SIZE) {
        toast.error("Image size must be less than 5 MB");
        return;
      }
    }

    createTeamMutation.mutate(teamData);
  }

  return (
    <form onSubmit={handleCreateTeamFormSubmit}>
      <div className="mx-auto mt-28 mb-40 w-[92%] max-w-7xl font-inter text-white">
        <div className="mb-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Create a Hackathon Team
          </h1>
          <p className="mt-3 text-white/60 max-w-2xl mx-auto">
            Build your team, define skills, and collaborate with trusted
            builders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10">
          <div className="flex flex-col gap-10">
            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <label className="group cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                      toast.error("Only PNG or JPG images are allowed");
                      e.target.value = "";
                      return;
                    }

                    if (file.size > MAX_IMAGE_SIZE) {
                      toast.error("Image size must be less than 5 MB");
                      e.target.value = "";
                      return;
                    }

                    setTeamImage(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }}
                />

                <div className="relative h-64 rounded-2xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden group-hover:border-teal-600 transition">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Team preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white/50">
                      <p className="font-medium">Upload team image</p>
                      <p className="text-sm mt-1">PNG or JPG • Max 5 MB</p>
                    </div>
                  )}
                </div>
              </label>
            </motion.div>

            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-lg font-semibold mb-5">Team Information</h2>

              <div className="space-y-4">
                <input
                  name="team-name"
                  placeholder="Team name *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                />

                <input
                  name="team-origin-city"
                  placeholder="City *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                />

                <input
                  name="team-origin-country"
                  placeholder="Country *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                />

                <TeamSizeDropdown
                  label=""
                  options={teamSizeOptions}
                  selected={selectedTeamSize}
                  setSelected={setSelectedTeamSize}
                />

                <textarea
                  name="team-desc"
                  rows={5}
                  placeholder="Describe your team and goals..."
                  className="w-full rounded-lg bg-white/10 px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                />
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-10">
            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <EventDetailsSection
                eventDetails={eventDetails}
                setEventDetails={setEventDetails}
              />
            </motion.div>

            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <SkillStackSection
                section="hack-teams"
                elements={skills}
                setElements={setSkills}
                type="skillstack"
              />
            </motion.div>

            <motion.div
              className="p-6 rounded-3xl bg-white/5 md:max-w-3/4 border border-white/10 backdrop-blur-xl"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-lg font-semibold mb-4">Contact Details</h2>

              <div className="space-y-4">
                <input
                  name="phone-no"
                  placeholder="Phone number"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                />

                <input
                  name="email"
                  placeholder="Email address *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                />
              </div>

              <div className="mt-6">
                <motion.button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full rounded-xl px-8 py-2 font-medium shadow-md transition-all cursor-pointer
                    ${
                      createTeamMutation.isPending
                        ? "bg-[#0d6969]/70 cursor-not-allowed"
                        : "bg-[#0d6969] hover:bg-[#118585]"
                      // isCreating
                      //   ? "bg-[#0d6969]/70 cursor-not-allowed"
                      //   : "bg-[#0d6969] hover:bg-[#118585]"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {createTeamMutation.isPending ? (
                      <motion.div
                        key="loading"
                        className="flex items-center justify-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Creating team…</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Create Team
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
