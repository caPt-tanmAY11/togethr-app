"use client";

import { Pencil, Trash, Upload } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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

/* -------------------- Types -------------------- */
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

/* -------------------- UI Constants -------------------- */
const cardBase =
  "relative z-10 w-full rounded-2xl border border-white/10 " +
  "bg-linear-to-br from-white/10 via-white/5 to-transparent " +
  "backdrop-blur-2xl p-8 sm:p-10 text-white";

/* -------------------- Component -------------------- */
export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isReady = !loading && profile !== null;

  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    null
  );

  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const [showEduModal, setShowEduModal] = useState(false);
  const [eduLoading, setEduLoading] = useState(false);

  const [showAchModal, setShowAchModal] = useState(false);
  const [achLoading, setAchLoading] = useState(false);

  const handleAddEducation = async (data: EducationInput) => {
    try {
      setEduLoading(true);

      const res = await fetch("/api/profile/education", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      // ❗ Handle server-side validation errors
      if (!res.ok) {
        toast.error(result?.error || "Failed to add education");
        return;
      }

      // ✅ Success
      setProfile((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          education: [result.education, ...prev.education],
        };
      });

      setShowEduModal(false);
      toast.success("Education added successfully");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setEduLoading(false);
    }
  };

  const handleAddAchievement = async (data: AchievementInput) => {
    try {
      setAchLoading(true);

      const res = await fetch("/api/profile/achievement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.error || "Failed to add achievement");
        return;
      }

      setProfile((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          achievements: [result.achievement, ...prev.achievements], // prepend
        };
      });

      setShowAchModal(false);
      toast.success("Achievement added successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAchLoading(false);
    }
  };

  /* -------------------- Fetch Profile -------------------- */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const res = await fetch(`/api/profile/${slug}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (res.status === 404 || !data.success) {
          setNotFound(true);
          return;
        }

        setProfile(data.profile);
        setIsOwner(data.isOwner);
        setIsFollowing(data.isFollowing);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    return () => controller.abort();
  }, [slug]);

  async function openConnections(type: ConnectionType) {
    try {
      setConnectionType(type);
      setConnectionsOpen(true);
      setConnectionsLoading(true);

      const res = await fetch(
        `/api/profile/connections?type=${type}&slug=${profile?.slug}`
      );

      const data = await res.json();
      setConnections(data.users || []);
    } catch (err) {
      console.error("Failed to load connections", err);
    } finally {
      setConnectionsLoading(false);
    }
  }

  async function handleFollow() {
    if (!profile || followLoading) return;

    try {
      setFollowLoading(true);

      await fetch("/api/profile/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToFollowId: profile.id,
        }),
      });

      // Optimistic update
      setIsFollowing(true);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followersCount: prev.followersCount + 1,
            }
          : prev
      );
    } catch (err) {
      console.error("Follow failed", err);
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleUnfollow() {
    if (!profile || followLoading) return;

    try {
      setFollowLoading(true);

      await fetch("/api/profile/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToUnfollowId: profile.id,
        }),
      });

      // Optimistic update
      setIsFollowing(false);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followersCount: prev.followersCount - 1,
            }
          : prev
      );
    } catch (err) {
      console.error("Unfollow failed", err);
    } finally {
      setFollowLoading(false);
    }
  }

  const handleUpdateImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setImageLoading(true);

      const res = await fetch("/api/profile/image", {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setProfile((prev) => (prev ? { ...prev, image: data.imageUrl } : prev));

      toast.success("Profile image updated");
    } catch {
      toast.error("Failed to update image");
    } finally {
      setImageLoading(false);
      setShowImageMenu(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      setImageLoading(true);

      const res = await fetch("/api/profile/image", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setProfile((prev) => (prev ? { ...prev, image: null } : prev));

      toast.success("Profile image removed");
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setImageLoading(false);
      setShowImageMenu(false);
    }
  };

  /* -------------------- States -------------------- */
  if (!isReady) {
    return <ProfilePageSkeleton />;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-white/70">
        Profile not found
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="mx-auto max-w-7xl px-4 py-2"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 my-10 font-inter">
          {isOwner && (
            <button
              onClick={() => router.push("/main/profile/settings")}
              className="rounded-lg border border-white/20 
              bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md 
              hover:bg-white/20 transition mb-4 cursor-pointer"
            >
              Edit Profile
            </button>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* ---------------- LEFT (2/5) ---------------- */}
            <div className="lg:col-span-2 grid gap-6">
              {/* PROFILE CARD */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={cardBase}
              >
                <div className="flex flex-col items-center gap-4 sm:gap-5 text-center">
                  <div className="relative">
                    <UserAvatar
                      image={profile.image}
                      name={profile.name}
                      className="h-32 w-32 xs:h-36 xs:w-36 sm:h-44 sm:w-44 md:h-52 md:w-52"
                    />

                    {/* EDIT BUTTON */}
                    {isOwner && (
                      <button
                        onClick={() => setShowImageMenu((p) => !p)}
                        className="absolute bottom-2 right-2 
          h-9 w-9 sm:h-10 sm:w-10 rounded-full
          bg-black/70 border border-white/20
          flex items-center justify-center
          hover:bg-black/30 transition cursor-pointer"
                      >
                        <Pencil size={16} className="text-white" />
                      </button>
                    )}

                    {/* DROPDOWN */}
                    <AnimatePresence>
                      {showImageMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2 w-40 
            rounded-xl bg-black/90 border border-white/10
            backdrop-blur-md overflow-hidden z-50"
                        >
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-3 text-sm text-left
              hover:bg-white/10 flex items-center gap-2"
                          >
                            <Upload size={14} />
                            Update photo
                          </button>

                          <button
                            onClick={handleRemoveImage}
                            className="w-full px-4 py-3 text-sm text-left
              hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                          >
                            <Trash size={14} />
                            Remove photo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleUpdateImage}
                    />
                  </div>

                  {/* NAME */}
                  <h1 className="mt-4 sm:mt-6 text-xl xs:text-2xl sm:text-3xl font-bold">
                    {profile.name}
                  </h1>

                  {/* HEADLINE */}
                  {profile.headline && (
                    <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-md">
                      {profile.headline}
                    </p>
                  )}

                  {/* TRUST POINTS */}
                  <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
                    <span
                      className="rounded-full bg-teal-500/10 border border-teal-400/30 
        px-3 py-1 text-teal-300 font-medium"
                    >
                      Trust Score: {profile.trustPoints}
                    </span>
                  </div>

                  {/* FOLLOW STATS */}
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

                  {/* LOCATION */}
                  {(profile.locationCity || profile.locationCountry) && (
                    <p className="text-xs sm:text-sm text-white/60">
                      {profile.locationCity}
                      {profile.locationCity && profile.locationCountry && ", "}
                      {profile.locationCountry}
                    </p>
                  )}

                  {/* FOLLOW BUTTON */}
                  {!isOwner && (
                    <button
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      disabled={followLoading}
                      className={`w-3/4 xs:w-auto rounded-lg
        px-10 sm:px-16 md:px-20 py-2 text-sm
        backdrop-blur-md transition
        ${
          isFollowing
            ? "border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 text-red-300"
            : "border border-white/20 bg-white/10 hover:bg-white/20 text-white"
        }
        ${followLoading ? "opacity-60 cursor-not-allowed" : ""}
        `}
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

              {/* CONTACT / LINKS */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className={cardBase}
              >
                <div className="space-y-4 sm:space-y-5">
                  {profile.organization && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        Organization
                      </h3>
                      <p className="mt-1 text-sm sm:text-base text-white/70 break-words">
                        {profile.organization}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      Email
                    </h3>
                    <p className="mt-1 text-sm sm:text-base text-white/70 break-all">
                      {profile.email}
                    </p>
                  </div>

                  {/* SOCIAL LINKS */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                      Socials
                    </h3>

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

            {/* ---------------- RIGHT (3/5) ---------------- */}
            <div className="lg:col-span-3 relative grid gap-6">
              {/* ABOUT + SKILLS */}
              <motion.div className={cardBase}>
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                  About
                </h2>

                <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 leading-relaxed break-words">
                  {profile.about || "No bio provided yet."}
                </p>

                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Skills
                </h3>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {profile.skills.length ? (
                    profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-white/10
          px-3 py-1
          text-xs sm:text-sm
          whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/50">No skills added</p>
                  )}
                </div>
              </motion.div>

              {/* EDUCATION */}
              <motion.div className={cardBase}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-7">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Education
                  </h2>

                  {isOwner && (
                    <button
                      onClick={() => setShowEduModal(true)}
                      className="w-full sm:w-auto
        rounded-lg px-4 sm:px-5 py-2
        text-sm border border-white/20
        bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      Add education
                    </button>
                  )}
                </div>

                {/* Content */}
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

              {/* ACHIEVEMENTS */}
              <motion.div className={cardBase}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-7">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Achievements
                  </h2>

                  {isOwner && (
                    <button
                      onClick={() => setShowAchModal(true)}
                      className="w-full sm:w-auto
        rounded-lg px-4 sm:px-5 py-2
        text-sm backdrop-blur-md transition
        border border-white/20
        bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      Add achievement
                    </button>
                  )}
                </div>

                {/* Content */}
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
                        {/* Title row */}
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
        ;
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
        onAdd={handleAddEducation}
        loading={eduLoading}
      />
      <AddAchievementModal
        open={showAchModal}
        onClose={() => setShowAchModal(false)}
        onAdd={handleAddAchievement}
        loading={achLoading}
      />
    </>
  );
}
