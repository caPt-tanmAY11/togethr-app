"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import SkillStackSection from "@/components/skill-stack-section";
import EventDetailsSection from "@/components/event-details-section";
import TeamSizeDropdown from "@/components/team-size-dropdown";
import { authClient } from "@/lib/auth-client";
import { isValidEmail } from "@/lib/utils";

export default function CreateHackTeam() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  async function handleCreateTeamFormSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    if (isCreating) return;

    setIsCreating(true);

    try {
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

      if (!isValidEmail(teamData.teamLeadEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const res = await fetch("/api/hack-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });

      const data = await res.json();

      // ---------- HANDLE API VALIDATION ----------
      if (!res.ok || !data.success) {
        // If API returns which fields are missing
        if (Array.isArray(data.fields) && data.fields.length > 0) {
          const field = data.fields[0]; // show toast for first missing field only
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
              toast.error(data.error || "Missing or invalid field");
          }
        } else {
          // fallback error
          toast.error(data.error || "Failed to create team");
        }
        return;
      }

      const teamId = data.hackTeam.teamId;

      // ---------- UPLOAD IMAGE IF EXISTS ----------
      if (teamImage) {
        const imageFormData = new FormData();
        imageFormData.append("file", teamImage);
        imageFormData.append("type", "hack-team");
        imageFormData.append("entityId", teamId);

        const uploadRes = await fetch("/api/upload/image", {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadRes.ok) {
          toast.error("Team created, but image upload failed");
        }
      }

      toast.success("Team created successfully!");
      router.replace("/main/hacks-teamup");
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Could not create team");
    } finally {
      setIsCreating(false);
    }
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
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-10">
            {/* Team Image */}
            <motion.div
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <label className="group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
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
                      <p className="text-sm mt-1">PNG or JPG</p>
                    </div>
                  )}
                </div>
              </label>
            </motion.div>

            {/* Team Basic Info */}
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
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600"
                />

                <input
                  name="team-origin-city"
                  placeholder="City *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600"
                />

                <input
                  name="team-origin-country"
                  placeholder="Country *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600"
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
                  className="w-full rounded-lg bg-white/10 px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-10">
            {/* Event Details */}
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

            {/* Skills */}
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

            {/* Contact */}
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
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600"
                />

                <input
                  name="email"
                  placeholder="Email address *"
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-600"
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
                        ? "bg-[#0d6969]/70 cursor-not-allowed"
                        : "bg-[#0d6969] hover:bg-[#118585]"
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
