"use client";

import JoinTeamModal from "@/components/join-team-modal";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import HackTeamDetailsSkeleton from "@/components/skeletons/hack-team-details-skeleton";
import TeamMembers from "@/components/team-members-list";
import ConfirmHackTeamActionModal from "@/components/confirm-hackteam-action-modal";

interface HackTeamData {
  teamId: string;
  name: string;
  origin: string;
  image?: string;
  size: number;
  spotsLeft: number;
  teamDesc: string;
  skillStack: string[];
  hackName: string;
  hackMode: "INPERSON" | "VIRTUAL" | "HYBRID";
  hackLocation: string;
  createdAt: string;
  hackBegins: string;
  hackEnds: string;
  hackDesc: string;
  hackLink: string;
  teamLeadPhoneNo: string;
  teamLeadEmail: string;
  createdByName: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  members: {
    role: "TEAM_LEAD" | "MEMBER";
    name: string;
    user: {
      id: string;
      name: string;
      image: string | null;
      slug: string;
    };
  }[];
  Request: {
    id: string;
    status: string;
    message: string;
    type: string;
    githubURL: string;
    linkedinURL: string;
    sender: {
      name: string;
      id: string;
      phone: string;
      email: string;
      image: string;
      slug: string;
      trustPoints: number;
    };
  }[];
}

export default function HackTeamDetailsPage() {
  const { teamId } = useParams();

  const { data: session } = authClient.useSession();

  const [team, setTeam] = useState<HackTeamData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isJoining, setIsJoining] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchTeam() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/hack-team/${teamId}`, { signal });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: {
          success: boolean;
          team?: HackTeamData;
          error?: string;
        } = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch team details");
        }

        if (!data.team) {
          throw new Error("Team data is empty");
        }

        setTeam(data.team);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("Fetch aborted");
        } else if (err instanceof Error) {
          console.error("Fetch team error:", err.message);
          setError(err.message);
        } else {
          console.error("Unknown fetch error:", err);
          setError("Could not load team details");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();

    return () => controller.abort();
  }, [teamId]);

  const requests = team?.Request || [];

  async function sendJoinRequest(data: {
    message: string;
    githubURL: string;
    linkedinURL: string;
  }) {
    if (isJoining) return;

    setIsJoining(true);

    try {
      const res = await fetch(`/api/hack-team-requests/${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!resData.success) {
        // Handle API-level errors
        toast.error(resData.error || "Failed to send join request");
        console.error("API Error:", resData.error);
        return;
      }

      // Success
      toast.success(resData.message || "Request sent successfully!");
      router.replace("/main/hacks-teamup");

      setTeam((prev) => {
        if (!prev || !session?.user) return prev;

        return {
          ...prev,
          Request: [
            ...prev.Request,
            {
              id: resData.request.id,
              status: "PENDING",
              message: data.message,
              type: "JOIN",
              githubURL: data.githubURL,
              linkedinURL: data.linkedinURL,
              sender: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email ?? "",
                phone: "",
                image: session.user.image ?? "",
                slug: session.user.slug ?? "",
                trustPoints: session.user.trustPoints ?? 0,
              },
            },
          ],
        };
      });
    } catch (error) {
      // Network or runtime errors
      console.error("Error sending request:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleRequestAction(
    requestId: string,
    action: "ACCEPTED" | "REJECTED"
  ) {
    try {
      const res = await fetch(`/api/hack-team-requests/status/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        // Use error from API if available
        const errorMsg = resData.error || "Failed to update request status";
        toast.error(errorMsg);
        console.error("Request update error:", errorMsg);
        return;
      }

      toast.success(
        resData.message || `Request ${action.toLowerCase()} successfully!`
      );

      console.log(resData);

      // Update local state to reflect changes
      setTeam((prev) => {
        if (!prev) return prev;

        const acceptedRequest = prev.Request.find((r) => r.id === requestId);

        if (!acceptedRequest) return prev;

        return {
          ...prev,
          spotsLeft:
            action === "ACCEPTED" ? prev.spotsLeft - 1 : prev.spotsLeft,

          members:
            action === "ACCEPTED"
              ? [
                  ...prev.members,
                  {
                    role: "MEMBER",
                    name: acceptedRequest.sender.name,
                    user: {
                      id: acceptedRequest.sender.id,
                      name: acceptedRequest.sender.name,
                      image: acceptedRequest.sender.image ?? null,
                      slug: acceptedRequest.sender.slug ?? null,
                    },
                  },
                ]
              : prev.members,

          Request: prev.Request.map((r) =>
            r.id === requestId ? { ...r, status: action } : r
          ),
        };
      });
    } catch (error) {
      console.error("[HANDLE_REQUEST_ACTION_ERROR]", error);
      toast.error("Something went wrong while updating the request!");
    }
  }

  async function handleCompleteTeam() {
    try {
      setActionLoading(true);

      const res = await fetch(`/api/hack-team/${team?.teamId}/complete`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to complete team");
        return;
      }

      toast.success("Team marked as completed 🎉");

      setTeam((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      setShowCompleteModal(false);
      router.replace("/main/hacks-teamup");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelTeam() {
    try {
      setActionLoading(true);

      const res = await fetch(`/api/hack-team/${team?.teamId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to cancel team");
        return;
      }

      toast.success("Team cancelled");
      router.replace("/main/hacks-teamup");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
      setShowCancelModal(false);
    }
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!team) return <HackTeamDetailsSkeleton />;

  const currentUserId = session?.user?.id;

  const isTeamLeader = currentUserId === team?.createdBy.id;

  const isTeamMember = team?.members.some(
    (member) => member.user.id === currentUserId
  );

  const userJoinRequest = team?.Request.find(
    (req) => req.sender.id === currentUserId
  );

  const hasPendingRequest = userJoinRequest?.status === "PENDING";

  return (
    <>
      <div className="mx-auto my-30 w-[90%] max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 font-inter">
        {/* LEFT SECTION */}
        <div className="flex flex-col gap-8">
          {/* Team Card */}
          <motion.div
            className="min-h-[45vh] p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col justify-center items-center gap-5 text-white">
              <div className="h-60 w-60 bg-black/40 rounded-xl flex justify-center items-center overflow-hidden">
                {team?.image ? (
                  <Image
                    src={team.image.replace(
                      "/upload/",
                      "/upload/c_fill,w_240,h_240/"
                    )}
                    alt={`${team.name} logo`}
                    width={240}
                    height={240}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-[#cfcfcf]">
                    IMG
                  </div>
                )}
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-semibold text-white/90">
                  {team?.name}
                </h1>
                <p className="text-lg text-[#a9a9a9]">Mumbai, India</p>
              </div>
            </div>
          </motion.div>

          {/* Team Info */}
          <motion.div
            className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">Team Overview</h2>
                <p className="text-sm text-[#bdbdbd] mt-1">
                  Size: <span className="text-[#4ff1f1]">{team?.size}</span> |
                  Spots Left:{" "}
                  <span className="text-[#4ff1f1]">{team?.spotsLeft}</span>
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">About Team</h2>
                <p className="text-sm text-[#bdbdbd] mt-1">{team?.teamDesc}</p>
              </div>

              <TeamMembers members={team.members} />

              <div>
                <h2 className="text-lg font-semibold">Skill Stack</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {team?.skillStack.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#1c1c1c] border border-white/10 text-sm px-3 py-1 rounded-lg text-[#9ff] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col gap-8">
          {/* About Event */}
          <motion.div
            className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-xl font-bold">About Event</h1>
                <h2 className="text-lg font-medium text-[#4ff1f1] mt-1">
                  {team?.hackName}
                </h2>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-[#dcdcdc]">
                <p>{team?.hackDesc}</p>
              </div>

              <div className="text-sm">
                <p className="font-semibold">
                  Mode:{" "}
                  <span className="text-[#4ff1f1] hover:underline cursor-pointer">
                    {team?.hackMode}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm bg-white/10 p-4 rounded-md">
                <div className="flex gap-2">
                  <span className="font-semibold text-white">Begins:</span>
                  <span>
                    {team?.hackBegins
                      ? new Date(team.hackBegins).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-white">Ends:</span>
                  <span>
                    {team?.hackBegins
                      ? new Date(team.hackEnds).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="text-sm">
                <p className="font-semibold">
                  Event Link:{" "}
                  <span className="text-[#4ff1f1] hover:underline cursor-pointer">
                    http://localhost:3000/genai/hack
                  </span>
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-md text-sm">
                <p className="font-semibold mb-1">Location:</p>
                <p className="text-[#ffffff78]">{team.hackLocation}</p>
              </div>
            </div>
          </motion.div>

          {/* Join Team + Contact */}
          <motion.div
            className="p-5 sm:p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white flex flex-col gap-4 sm:gap-6 max-w-full overflow-x-auto"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {isTeamLeader ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-[#bdbdbd]">
                  You are the team leader
                </p>

                {/* Pending Requests */}
                {requests.filter((r) => r.status === "PENDING").length > 0 ? (
                  <>
                    <h3 className="font-medium text-sm sm:text-base text-[#4ff1f1] mt-2 mb-1">
                      Pending Requests
                    </h3>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      {team?.Request.filter((r) => r.status === "PENDING").map(
                        (req) => (
                          <div
                            key={req.id}
                            className="border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:bg-white/5 transition"
                          >
                            <div className="flex flex-col gap-1 text-sm w-full sm:w-auto">
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center">
                                <p
                                  className="text-white cursor-pointer text-sm sm:text-base break-words"
                                  onClick={() =>
                                    router.push(
                                      `/main/profile/${req.sender.slug}`
                                    )
                                  }
                                >
                                  <strong>{req.sender.name}</strong> wants to
                                  join
                                </p>
                                <p className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition mt-1 sm:mt-0">
                                  Trust Score:{" "}
                                  <span className="text-[#4ff1f1]">
                                    {req.sender.trustPoints}
                                  </span>
                                </p>
                              </div>
                              <p className="text-[#bdbdbd] text-xs sm:text-sm break-words">
                                {req.message}
                              </p>
                              <div className="flex flex-wrap gap-2 text-[#9ff] text-xs mt-1">
                                <a
                                  href={req.githubURL}
                                  target="_blank"
                                  className="hover:underline"
                                >
                                  GitHub
                                </a>
                                <a
                                  href={req.linkedinURL}
                                  target="_blank"
                                  className="hover:underline"
                                >
                                  LinkedIn
                                </a>
                              </div>
                            </div>

                            {/* Disable buttons if no spots left */}
                            <div className="flex flex-wrap gap-2 shrink-0 mt-2 sm:mt-0">
                              <button
                                onClick={() =>
                                  handleRequestAction(req.id, "ACCEPTED")
                                }
                                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer ${
                                  team.spotsLeft <= 0
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-green-700 hover:bg-green-600"
                                }`}
                                disabled={team.spotsLeft <= 0}
                              >
                                Accept
                              </button>

                              <button
                                onClick={() =>
                                  handleRequestAction(req.id, "REJECTED")
                                }
                                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer ${
                                  team.spotsLeft <= 0
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-[#b62222b7] hover:bg-[#e24040b7]"
                                }`}
                                disabled={team.spotsLeft <= 0}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {team && team.spotsLeft <= 0 && (
                      <p className="text-red-400 mt-2 text-xs sm:text-sm font-medium">
                        Team is full! Cannot accept more members.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs sm:text-sm text-[#bdbdbd]">
                    No pending requests
                  </p>
                )}

                {/* Accepted Members */}
                {requests.filter((r) => r.status === "ACCEPTED").length > 0 && (
                  <>
                    <h3 className="font-medium text-sm sm:text-base text-[#4ff1f1] mt-4 mb-1">
                      Accepted Members
                    </h3>
                    <div className="flex flex-col gap-1 sm:gap-2">
                      {team?.Request.filter((r) => r.status === "ACCEPTED").map(
                        (req) => (
                          <div
                            key={req.id}
                            className="border-b border-white/20 px-3 sm:px-4 py-1 sm:py-2"
                          >
                            <p className="text-xs sm:text-sm">
                              <strong>{req.sender.name}</strong> has joined
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 bg-white/10 p-3 sm:p-4 rounded-md text-center">
                {isTeamMember ? (
                  <p className="text-green-400 font-semibold text-sm sm:text-base">
                    You are already a team member
                  </p>
                ) : hasPendingRequest ? (
                  <p className="text-yellow-400 font-semibold text-sm sm:text-base">
                    ⏳ Waiting for approval
                  </p>
                ) : team.spotsLeft <= 0 ? (
                  <p className="text-red-400 font-semibold text-sm sm:text-base">
                    Team is full! Cannot join.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      <p className="text-sm sm:text-xl font-semibold text-left">
                        Want to join the team?
                      </p>

                      <div className="mt-6">
                        <motion.button
                          type="submit"
                          disabled={isJoining}
                          onClick={() => setIsJoinModalOpen(true)}
                          whileTap={{ scale: 0.97 }}
                          className={`w-full rounded-xl px-8 py-2 font-medium shadow-md transition-all cursor-pointer
                    ${
                      isJoining
                        ? "bg-[#0d6969]/70 cursor-not-allowed"
                        : "bg-[#0d6969] hover:bg-[#118585]"
                    }`}
                        >
                          <AnimatePresence mode="wait">
                            {isJoining ? (
                              <motion.div
                                key="loading"
                                className="flex items-center justify-center gap-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                <span>Sending join request…</span>
                              </motion.div>
                            ) : (
                              <motion.span
                                key="text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                Join Team
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm mt-3 sm:mt-4">
              <h2 className="font-semibold text-sm sm:text-lg">Contact</h2>
              {team.teamLeadPhoneNo ? <p>📞 {team.teamLeadPhoneNo}</p> : ""}
              {team.teamLeadEmail ? <p>📧 {team.teamLeadEmail}</p> : ""}
            </div>
          </motion.div>

          {isTeamLeader && (
            <motion.div
              className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-lg font-bold mb-4">Team Actions</h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full bg-green-700 hover:bg-green-600 px-6 py-2 rounded-lg font-medium transition-all shadow-md cursor-pointer"
                >
                  Mark Team as Completed
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-[#b62222b7] hover:bg-[#e24040b7] px-6 py-2 rounded-lg font-medium transition-all shadow-md cursor-pointer"
                >
                  Cancel Team
                </button>
              </div>
              <p className="text-xs text-[#bdbdbd] mt-3">
                Completing a team will award trust points to members. Cancelling
                will permanently close the team.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <ConfirmHackTeamActionModal
        open={showCompleteModal}
        title="Complete Team?"
        description="This will mark the team as completed and award trust points to members. This action cannot be undone."
        confirmText="Yes, Complete"
        confirmColor="green"
        loading={actionLoading}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleCompleteTeam}
      />

      <ConfirmHackTeamActionModal
        open={showCancelModal}
        title="Cancel Team?"
        description="This will permanently cancel the team. Members will not receive trust points."
        confirmText="Yes, Cancel Team"
        confirmColor="red"
        loading={actionLoading}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelTeam}
      />

      <JoinTeamModal
        open={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        type="hack-team"
        onSubmit={(data) => {
          const payload = {
            message: data.message,
            githubURL: data.githubUrl,
            linkedinURL: data.linkedinUrl,
          };

          sendJoinRequest(payload);

          setIsJoinModalOpen(false);
        }}
      />
    </>
  );
}
