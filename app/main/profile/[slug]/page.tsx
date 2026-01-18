"use client";

import { Pencil, Trash, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";
import { UserAvatar } from "@/components/use-avatar";
import ProfilePageSkeleton from "@/components/skeletons/profile-page-skeleton";
import ConnectionsModal from "@/components/connections-modal";
import AddEducationModal, {
  EducationInput,
} from "@/components/add-education-modal";
import { toast } from "sonner";
import AddAchievementModal, {
  AchievementInput,
} from "@/components/add-achievement-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfileData {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  headline: string | null;
  about: string | null;
  skills: string[];
  locationCity: string | null;
  locationCountry: string | null;
  organization: string | null;
  email: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  XUrl: string | null;
  portfolioUrl: string | null;
  followersCount: number;
  followingCount: number;
  trustPoints: number;
  education: {
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startYear: string | null;
    endYear: string | null;
    grade: string | null;
    description: string | null;
  }[];
  achievements: {
    title: string;
    description: string | null;
    issuer: string | null;
    issuedAt: string | null;
    category: string | null;
    proofUrl: string | null;
  }[];
}

type ConnectionType = "FOLLOWERS" | "FOLLOWING";

interface ConnectionUser {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  headline: string | null;
}

const cardBase =
  "relative z-10 w-full rounded-2xl border border-white/10 " +
  "bg-linear-to-br from-white/10 via-white/5 to-transparent " +
  "backdrop-blur-2xl p-8 sm:p-10 text-white";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showImageMenu, setShowImageMenu] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    null,
  );

  const {
    data: profileResponse,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["profile", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Invalid profile slug");
      const res = await fetch(`/api/profile/${slug}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Not Found");
      return data as {
        profile: ProfileData;
        isOwner: boolean;
        isFollowing: boolean;
      };
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const profile = profileResponse?.profile;
  const isOwner = profileResponse?.isOwner ?? false;
  const isFollowing = profileResponse?.isFollowing ?? false;

  const { data: connections = [], isFetching: connectionsLoading } = useQuery({
    queryKey: ["connections", connectionType, profile?.slug],
    queryFn: async () => {
      if (!profile?.slug || !connectionType) return [];
      const res = await fetch(
        `/api/profile/connections?type=${connectionType}&slug=${profile?.slug}`,
      );
      const data = await res.json();
      return (data.users || []) as ConnectionUser[];
    },
    enabled: connectionsOpen && !!connectionType && !!profile?.slug,
  });

  const { mutate: toggleFollow, isPending: followLoading } = useMutation({
    mutationFn: async (action: "FOLLOW" | "UNFOLLOW") => {
      if (!profile?.id) throw new Error("Invalid user ID");
      const method = action === "FOLLOW" ? "POST" : "DELETE";
      const bodyKey =
        action === "FOLLOW" ? "userToFollowId" : "userToUnfollowId";
      const res = await fetch("/api/profile/connections", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: profile?.id }),
      });
      if (!res.ok) throw new Error("Failed to update follow status");
      return action;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
    },
  });

  const { mutate: addEducation, isPending: eduLoading } = useMutation({
    mutationFn: async (data: EducationInput) => {
      const res = await fetch("/api/profile/education", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add education");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      setShowEduModal(false);
      toast.success("Education added successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: addAchievement, isPending: achLoading } = useMutation({
    mutationFn: async (data: AchievementInput) => {
      const res = await fetch("/api/profile/achievement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add achievement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      setShowAchModal(false);
      toast.success("Achievement added successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: updateImage, isPending: imageLoading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/profile/image", {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile", slug] }),
        queryClient.invalidateQueries({ queryKey: ["navbar-user"] }),
      ]);
      toast.success("Profile image updated");
      setShowImageMenu(false);
    },
    onError: () => toast.error("Failed to update image"),
  });

  const { mutate: removeImage } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile/image", { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile", slug] }),
        queryClient.invalidateQueries({ queryKey: ["navbar-user"] }),
      ]);

      toast.success("Profile image removed");
      setShowImageMenu(false);
    },
  });

  const [showEduModal, setShowEduModal] = useState(false);
  const [showAchModal, setShowAchModal] = useState(false);

  function openConnections(type: ConnectionType) {
    setConnectionType(type);
    setConnectionsOpen(true);
  }

  if (isLoading) return <ProfilePageSkeleton />;
  if (isError)
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-white/70">
        Profile not found or error occurred
      </div>
    );
  if (!profile) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 py-2"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 my-10 font-inter">
          {isOwner && (
            <button
              onClick={() => router.push("/main/profile/settings")}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md hover:bg-white/20 transition mb-4 cursor-pointer"
            >
              Edit Profile
            </button>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2 grid gap-6">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className={cardBase}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <UserAvatar
                      image={profile.image}
                      name={profile.name}
                      className="h-32 w-32 xs:h-36 xs:w-36 sm:h-44 sm:w-44 md:h-52 md:w-52"
                    />
                    {isOwner && (
                      <button
                        onClick={() => setShowImageMenu((p) => !p)}
                        className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-black/30 transition cursor-pointer"
                      >
                        <Pencil size={16} className="text-white" />
                      </button>
                    )}
                    <AnimatePresence>
                      {showImageMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2 w-50 rounded-xl bg-black border border-white/10 backdrop-blur-md overflow-hidden z-50"
                        >
                          <button
                            onClick={() => {
                              if (!imageLoading) {
                                fileInputRef.current?.click();
                              }
                            }}
                            disabled={imageLoading}
                            className={`w-full px-4 py-3 text-sm text-left flex flex-col items-center justify-center
                            ${
                              imageLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-white/10 cursor-pointer"
                            }
                          `}
                          >
                            <div className="flex gap-2 items-center">
                              <Upload size={14} />
                              <span>
                                {imageLoading ? "Uploading..." : "Update photo"}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-white/40">
                              PNG or JPG • Max 5 MB
                            </p>
                          </button>

                          <button
                            onClick={() => {
                              if (!imageLoading) removeImage();
                            }}
                            disabled={imageLoading}
                            className={`w-full px-4 py-3 text-sm text-left flex justify-center items-center gap-2 text-red-400
                            ${
                              imageLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-red-500/10 cursor-pointer"
                            }
                          `}
                          >
                            <div className="flex gap-2 items-center justify-center">
                              <Trash size={14} /> Remove photo
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      ref={fileInputRef}
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

                        if (file.size > MAX_PROFILE_IMAGE_SIZE) {
                          toast.error(
                            "Image too large. Max allowed size is 5 MB",
                          );
                          e.target.value = "";
                          return;
                        }

                        if (file) updateImage(file);
                      }}
                    />
                  </div>

                  <h1 className="mt-4 text-xl xs:text-2xl sm:text-3xl font-bold">
                    {profile.name}
                  </h1>

                  {profile.headline && (
                    <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-md">
                      {profile.headline}
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
                    <span className="rounded-full bg-teal-500/10 border border-teal-400/30 px-3 py-1 text-teal-300 font-medium">
                      Trust Score: {profile.trustPoints}
                    </span>
                  </div>

                  <div className="flex gap-3 xs:gap-6">
                    <button
                      onClick={() => openConnections("FOLLOWERS")}
                      className="text-xs sm:text-sm hover:underline cursor-pointer"
                    >
                      <span className="text-base sm:text-lg">
                        {profile.followersCount}
                      </span>{" "}
                      Followers
                    </button>
                    <button
                      onClick={() => openConnections("FOLLOWING")}
                      className="text-xs sm:text-sm hover:underline cursor-pointer"
                    >
                      <span className="text-base sm:text-lg">
                        {profile.followingCount}
                      </span>{" "}
                      Following
                    </button>
                  </div>

                  {(profile.locationCity || profile.locationCountry) && (
                    <p className="text-xs sm:text-sm text-white/60">
                      {profile.locationCity}
                      {profile.locationCity && profile.locationCountry && ", "}
                      {profile.locationCountry}
                    </p>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() =>
                        toggleFollow(isFollowing ? "UNFOLLOW" : "FOLLOW")
                      }
                      disabled={followLoading}
                      className={`w-3/4 xs:w-auto rounded-lg px-10 py-2 text-sm backdrop-blur-md transition ${isFollowing ? "border border-red-400/40 bg-red-500/10 text-red-300" : "border border-white/20 bg-white/10 text-white"} ${followLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {followLoading
                        ? "Please wait..."
                        : isFollowing
                          ? "Unfollow"
                          : "Follow"}
                    </button>
                  )}
                </div>
              </motion.div>

              <motion.div
                className={cardBase}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="space-y-4">
                  {profile.organization && (
                    <div>
                      <h3 className="text-base font-semibold">Organization</h3>
                      <p className="mt-1 text-sm text-white/70 break-words">
                        {profile.organization}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold">Email</h3>
                    <p className="mt-1 text-sm text-white/70 break-all">
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">Socials</h3>
                    {!profile.linkedinUrl &&
                    !profile.XUrl &&
                    !profile.portfolioUrl &&
                    !profile.portfolioUrl ? (
                      <div>
                        <p className="text-sm text-[#ffffff86]">Empty</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            className="p-2 rounded-lg
            hover:bg-white/5 transition"
                          >
                            <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 hover:text-teal-400" />
                          </a>
                        )}

                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            className="p-2 rounded-lg
            hover:bg-white/5 transition"
                          >
                            <Github className="h-5 w-5 sm:h-6 sm:w-6 hover:text-teal-400" />
                          </a>
                        )}

                        {profile.XUrl && (
                          <a
                            href={profile.XUrl}
                            target="_blank"
                            className="p-2 rounded-lg
            hover:bg-white/5 transition"
                          >
                            <Twitter className="h-5 w-5 sm:h-6 sm:w-6 hover:text-teal-400" />
                          </a>
                        )}

                        {profile.portfolioUrl && (
                          <a
                            href={profile.portfolioUrl}
                            target="_blank"
                            className="p-2 rounded-lg
            hover:bg-white/5 transition"
                          >
                            <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 hover:text-teal-400" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-3 grid gap-6">
              <motion.div
                className={cardBase}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-base font-semibold mb-2">About</h2>
                <p className="text-sm whitespace-pre-line text-white/70 leading-relaxed">
                  {profile.about || "No bio provided yet."}
                </p>
                <h3 className="text-base font-semibold mt-4 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length ? (
                    profile.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/50">No skills added</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className={cardBase}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <h2 className="text-base font-semibold">Education</h2>
                  {isOwner && (
                    <button
                      onClick={() => setShowEduModal(true)}
                      className="rounded-lg px-4 py-2 text-sm border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      Add education
                    </button>
                  )}
                </div>
                {profile.education.length === 0 ? (
                  <p className="text-sm text-white/50">No education added</p>
                ) : (
                  <div className="space-y-5">
                    {profile.education.map((edu, i) => (
                      <div
                        key={i}
                        className="border-l border-white/20 pl-3 sm:pl-4"
                      >
                        <h3 className="text-sm sm:text-base font-semibold break-words">
                          {edu.institution}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/70">
                          {edu.degree}
                          {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                        </p>

                        <p className="text-xs text-white/50">
                          {edu.startYear}
                          {edu.endYear && ` – ${edu.endYear}`}
                        </p>

                        {edu.grade && (
                          <p className="text-xs sm:text-sm text-white/60">
                            Grade: {edu.grade}
                          </p>
                        )}

                        {edu.description && (
                          <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed break-words">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className={cardBase}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <h2 className="text-base font-semibold">Achievements</h2>
                  {isOwner && (
                    <button
                      onClick={() => setShowAchModal(true)}
                      className="rounded-lg px-4 py-2 text-sm border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      Add achievement
                    </button>
                  )}
                </div>
                {profile.achievements.length === 0 ? (
                  <p className="text-sm text-white/50">No achievements added</p>
                ) : (
                  <div className="space-y-4 sm:space-y-5">
                    {profile.achievements.map((ach, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10
          bg-white/5 p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <h3 className="text-sm sm:text-base font-semibold break-words">
                            {ach.title}
                          </h3>

                          {ach.category && (
                            <span
                              className="self-start text-xs rounded-full
              bg-white/10 px-2 py-1 whitespace-nowrap"
                            >
                              {ach.category}
                            </span>
                          )}
                        </div>

                        {ach.issuer && (
                          <p className="text-xs text-white/50 mt-1">
                            Issued by {ach.issuer}
                          </p>
                        )}

                        {ach.description && (
                          <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed break-words">
                            {ach.description}
                          </p>
                        )}

                        {ach.proofUrl && (
                          <a
                            href={ach.proofUrl}
                            target="_blank"
                            className="text-xs text-teal-400 mt-3 inline-block"
                          >
                            View Proof →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      <ConnectionsModal
        open={connectionsOpen}
        onClose={() => setConnectionsOpen(false)}
        title={connectionType === "FOLLOWERS" ? "Followers" : "Following"}
        users={connections}
        loading={connectionsLoading}
      />
      <AddEducationModal
        open={showEduModal}
        onClose={() => setShowEduModal(false)}
        onAdd={(data) => addEducation(data)}
        loading={eduLoading}
      />
      <AddAchievementModal
        open={showAchModal}
        onClose={() => setShowAchModal(false)}
        onAdd={(data) => addAchievement(data)}
        loading={achLoading}
      />
    </>
  );
}
