"use client";

import JoinTeamModal from "@/components/join-team-modal";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hack-team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/hack-team/${teamId}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401)
          throw new Error("You must be logged in to view this team.");
        if (res.status === 404) throw new Error("Hack team not found.");
        if (res.status === 400)
          throw new Error(data.error || "Invalid request.");
        throw new Error("Something went wrong. Please try again.");
      }
      if (!data.success) throw new Error(data.error || "Failed to fetch");
      return data.team as HackTeamData;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: updateRequestStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: async ({
        requestId,
        action,
      }: {
        requestId: string;
        action: "ACCEPTED" | "REJECTED";
      }) => {
        const res = await fetch(`/api/hack-team-requests/status/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        });
        const resData = await res.json();
        if (!res.ok || !resData.success)
          throw new Error(resData.error || "Failed to update");
        return resData;
      },
      onSuccess: async (_, variables) => {
        toast.success(
          `Request ${variables.action.toLowerCase()} successfully!`
        );
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["hack-team", teamId] }),
          queryClient.invalidateQueries({ queryKey: ["hack-teams"] }),
        ]);
      },
      onError: (err: Error) => toast.error(err.message),
    });

  const { mutate: sendJoinRequest, isPending: isJoining } = useMutation({
    mutationFn: async (formData: {
      message: string;
      githubURL: string;
      linkedinURL: string;
    }) => {
      if (!team?.teamId) throw new Error("Team ID is missing");
      const res = await fetch(`/api/hack-team-requests/${teamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to send request");
      return data;
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Request sent successfully!");
      await queryClient.invalidateQueries({ queryKey: ["hack-team", teamId] });
      router.replace("/main/hacks-teamup");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const { mutate: completeTeamMutation } = useMutation({
    mutationFn: async () => {
      if (!team?.teamId) throw new Error("Team ID is missing");
      const res = await fetch(`/api/hack-team/${team?.teamId}/complete`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401)
          throw new Error("You must be logged in to perform this action.");
        if (res.status === 403)
          throw new Error("Only the team leader can complete the team.");
        if (res.status === 400)
          throw new Error(data.error || "Team cannot be completed.");
        if (res.status === 404) throw new Error("Team not found.");
        throw new Error("Something went wrong. Please try again.");
      }
      return data;
    },
    onSuccess: async () => {
      toast.success("Team marked as completed 🎉");
      await queryClient.invalidateQueries({ queryKey: ["hack-teams"] });
      router.replace("/main/hacks-teamup");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setActionLoading(false);
    },
  });

  const { mutate: cancelTeamMutation } = useMutation({
    mutationFn: async () => {
      if (!team?.teamId) throw new Error("Team ID is missing");
      const res = await fetch(`/api/hack-team/${team?.teamId}/cancel`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401)
          throw new Error("You must be logged in to perform this action.");
        if (res.status === 403)
          throw new Error("Only the team leader can cancel the team.");
        if (res.status === 400)
          throw new Error(data.error || "Team cannot be cancelled.");
        if (res.status === 404) throw new Error("Team not found.");
        throw new Error("Something went wrong. Please try again.");
      }
      return data;
    },
    onSuccess: async () => {
      toast.success("Team cancelled");
      await queryClient.invalidateQueries({ queryKey: ["hack-teams"] });
      router.replace("/main/hacks-teamup");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setActionLoading(false);
    },
  });

  const handleCompleteTeam = () => {
    setActionLoading(true);
    completeTeamMutation();
  };

  const handleCancelTeam = () => {
    setActionLoading(true);
    cancelTeamMutation();
  };

  if (error)
    return <p className="text-red-400 p-10">{(error as Error).message}</p>;
  if (isLoading || !team) return <HackTeamDetailsSkeleton />;

  const currentUserId = session?.user?.id;
  const isTeamLeader = currentUserId === team?.createdBy.id;
  const isTeamMember = team?.members.some((m) => m.user.id === currentUserId);
  const userJoinRequest = team?.Request.find(
    (req) => req.sender.id === currentUserId
  );
  const hasPendingRequest = userJoinRequest?.status === "PENDING";
  const requests = team?.Request || [];

  return (
    <>
      <div className="mx-auto my-30 w-[90%] max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 font-inter">
        <div className="flex flex-col gap-8">
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
                    alt={team.name}
                    width={240}
                    height={240}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="text-sm text-[#cfcfcf]">IMG</div>
                )}
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-semibold text-white/90">
                  {team?.name}
                </h1>
                <p className="text-lg text-[#a9a9a9]">{team?.origin}</p>
              </div>
            </div>
          </motion.div>

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

        <div className="flex flex-col gap-8">
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
              <p className="text-sm leading-relaxed text-[#dcdcdc]">
                {team?.hackDesc}
              </p>

              <div className="text-sm">
                <p className="font-semibold">
                  Mode:{" "}
                  <span className="text-[#4ff1f1] hover:underline cursor-pointer">
                    {team?.hackMode}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm bg-white/10 p-4 rounded-md">
                <p>
                  <strong>Begins:</strong>{" "}
                  {team?.hackBegins
                    ? new Date(team.hackBegins).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Ends:</strong>{" "}
                  {team?.hackEnds
                    ? new Date(team.hackEnds).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <p className="text-sm font-semibold">
                Event Link:{" "}
                <a
                  href={team.hackLink}
                  target="_blank"
                  className="text-[#4ff1f1] hover:underline"
                >
                  {team.hackLink}
                </a>
              </p>
              <div className="bg-white/10 p-4 rounded-md text-sm">
                <p className="font-semibold mb-1">Location:</p>
                <p className="text-[#ffffff78]">{team.hackLocation}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-5 sm:p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white flex flex-col gap-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {isTeamLeader ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-[#bdbdbd]">
                  You are the team leader
                </p>

                {requests.filter((r) => r.status === "PENDING").length > 0 ? (
                  <>
                    <h3 className="font-medium text-sm sm:text-base text-[#4ff1f1] mt-2 mb-1">
                      Pending Requests
                    </h3>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      {requests
                        .filter((r) => r.status === "PENDING")
                        .map((req) => (
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

                            <div className="flex flex-wrap gap-2 shrink-0 mt-2 sm:mt-0">
                              <button
                                disabled={
                                  isUpdatingStatus ||
                                  (team?.spotsLeft ?? 0) <= 0
                                }
                                onClick={() =>
                                  updateRequestStatus({
                                    requestId: req.id,
                                    action: "ACCEPTED",
                                  })
                                }
                                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition ${
                                  (team?.spotsLeft ?? 0) <= 0
                                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                                    : "bg-green-700 hover:bg-green-600"
                                }`}
                              >
                                {isUpdatingStatus ? "..." : "Accept"}
                              </button>

                              <button
                                disabled={isUpdatingStatus}
                                onClick={() =>
                                  updateRequestStatus({
                                    requestId: req.id,
                                    action: "REJECTED",
                                  })
                                }
                                className="px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer bg-[#b62222b7] hover:bg-[#e24040b7] transition"
                              >
                                {isUpdatingStatus ? "..." : "Reject"}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {team && team.spotsLeft <= 0 && (
                      <p className="text-red-400 mt-2 text-xs sm:text-sm font-medium">
                        Team is full! Cannot accept more members.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#bdbdbd]">No pending requests</p>
                )}
              </div>
            ) : (
              <div className="bg-white/10 p-4 rounded-md">
                {isTeamMember ? (
                  <p className="text-green-400 font-semibold">
                    You are already a team member
                  </p>
                ) : hasPendingRequest ? (
                  <p className="text-yellow-400 font-semibold">
                    ⏳ Request Pending
                  </p>
                ) : team.spotsLeft <= 0 ? (
                  <p className="text-red-400 font-semibold">Team is full!</p>
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
                        ? "bg-[#0d6969]/70 cursor-not-allowed opacity-60"
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

                  // <button
                  //   disabled={isJoining}
                  //   onClick={() => setIsJoinModalOpen(true)}
                  //   className="w-full bg-[#0d6969] rounded-xl py-2 font-medium hover:bg-[#118585] transition-all"
                  // >
                  //   {isJoining ? "Sending..." : "Join Team"}
                  // </button>
                )}
              </div>
            )}
            <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm mt-3 sm:mt-4">
              <h2 className="font-semibold text-sm sm:text-lg">Contact</h2>
              {team.teamLeadPhoneNo ? <p>📞 {team.teamLeadPhoneNo}</p> : ""}
              {team.teamLeadEmail ? <p>📧 {team.teamLeadEmail}</p> : ""}
            </div>
          </motion.div>

          {isTeamLeader && (
            <motion.div
              className="p-7 rounded-2xl bg-white/5 border border-white/10 shadow-lg text-white"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h2 className="text-lg font-bold mb-4">Team Actions</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full bg-green-700 hover:bg-green-600 px-6 py-2 rounded-lg font-medium cursor-pointer"
                >
                  Complete Team
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-800 hover:bg-red-700 px-6 py-2 rounded-lg font-medium cursor-pointer"
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
        description="Mark team as completed and award points."
        confirmText="Yes, Complete"
        confirmColor="green"
        loading={actionLoading}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleCompleteTeam}
      />
      <ConfirmHackTeamActionModal
        open={showCancelModal}
        title="Cancel Team?"
        description="This action is permanent."
        confirmText="Yes, Cancel"
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
          sendJoinRequest({
            message: data.message,
            githubURL: data.githubUrl,
            linkedinURL: data.linkedinUrl,
          });
          setIsJoinModalOpen(false);
        }}
      />
    </>
  );
}
