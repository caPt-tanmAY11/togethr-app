"use client";

import ConfirmProjectActionModal from "@/components/confirm-project-action-model";
import JoinTeamModal from "@/components/join-team-modal";
import ProjectMembers from "@/components/project-members-list";
import ProjectDetailsSkeleton from "@/components/skeletons/project-details-skeletons";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectData {
  id: string;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  extraNote?: string;
  stage: "IDEA" | "BUILDING" | "MVP" | "LIVE";
  skillStack: string[];
  tags: string[];
  commitment: "LOW" | "MEDIUM" | "HIGH";
  maxMembers: string;
  currentMembers: number;
  githubURL?: string;
  contactPhone?: string;
  contactEmail: string;
  ownerLinkedInURL: string;
  ownerId: string;
  members: {
    role: "OWNER" | "CONTRIBUTOR";
    name: string;
    user: {
      id: string;
      name: string;
      image: string | null;
      slug: string;
    };
  }[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  requests: {
    id: string;
    status: string;
    message: string;
    type: string;
    githubUrl: string;
    linkedinUrl: string;
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

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch");
      return data.project as ProjectData;
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
        const res = await fetch(`/api/projects-requests/status/${requestId}`, {
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
          queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
          queryClient.invalidateQueries({ queryKey: ["projects"] }),
        ]);
      },
      onError: (err: Error) => toast.error(err.message),
    });

  const { mutate: sendJoinRequest, isPending: isJoining } = useMutation({
    mutationFn: async (formData: {
      message: string;
      githubUrl: string;
      linkedinUrl: string;
    }) => {
      const res = await fetch(`/api/projects-requests/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const resData = await res.json();
      if (!resData.success)
        throw new Error(resData.error || "Failed to send join request");
      return resData;
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Request sent successfully!");
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.replace("/main/projects");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const { mutate: completeProjectMutation } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${project?.id}/complete`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to complete");
      return data;
    },
    onSuccess: async () => {
      toast.success("Project marked as completed 🎉");
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.replace("/main/projects");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setActionLoading(false);
    },
  });

  const { mutate: cancelProjectMutation } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${project?.id}/cancel`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to cancel");
      return data;
    },
    onSuccess: async () => {
      toast.success("Project cancelled");
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.replace("/main/projects");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setActionLoading(false);
    },
  });

  const handleCompleteTeam = () => {
    setActionLoading(true);
    completeProjectMutation();
  };

  const handleCancelTeam = () => {
    setActionLoading(true);
    cancelProjectMutation();
  };

  if (error)
    return <p className="text-red-400 p-10">{(error as Error).message}</p>;
  if (isLoading || !project) return <ProjectDetailsSkeleton />;

  const currentUserId = session?.user?.id;
  const isProjectOwner = currentUserId === project?.owner.id;
  const isProjectContributor = project?.members.some(
    (m) => m.user.id === currentUserId
  );
  const userJoinRequest = project?.requests.find(
    (req) => req.sender.id === currentUserId
  );
  const hasPendingRequest = userJoinRequest?.status === "PENDING";
  const requests = project?.requests || [];

  return (
    <>
      <div className="mx-auto my-30 w-[90%] max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 font-inter">
        <div className="flex flex-col gap-8">
          <motion.div
            className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col items-center gap-5 text-white">
              <div className="text-center">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <p className="text-[#f36262] text-xl font-semibold">
                  {project.stage}
                </p>
              </div>
              <div>
                <p className="text-[#a5a5a5] font-medium whitespace-pre-line">
                  {project.shortDesc}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">
                Contributors:{" "}
                <span className="text-[#f36262] font-semibold border border-white/20 bg-white/10 px-2 py-1 rounded-full">
                  {project?.currentMembers}
                </span>
              </h2>
              <ProjectMembers members={project.members} />
            </div>
          </motion.div>

          <motion.div
            className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-semibold">Overview</h2>
                <p className="text-sm text-[#bdbdbd] mt-1">
                  Commitment:{" "}
                  <span className="text-[#f36262]">{project.commitment}</span>
                </p>
              </div>
              {project.extraNote && (
                <div>
                  <h2 className="font-semibold">Extra Note</h2>
                  <p className="text-sm text-[#bdbdbd] mt-1 whitespace-pre-line">
                    {project.extraNote}
                  </p>
                </div>
              )}
              <div>
                <h2 className="font-semibold">Skill Stack</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.skillStack.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#1c1c1c] border border-white/10 text-sm px-3 py-1 rounded-lg text-[#ff8f8f]"
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
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col gap-5">
              <h1 className="text-xl font-bold">Project Details</h1>
              <p className="text-[#a5a5a5] font-medium whitespace-pre-line">
                {project.detailedDesc}
              </p>
              {project.githubURL && (
                <p className="text-sm">
                  GitHub:{" "}
                  <a
                    href={project.githubURL}
                    target="_blank"
                    className="text-[#f36262] hover:underline"
                  >
                    View Repository
                  </a>
                </p>
              )}
              <div>
                <p className="font-semibold">Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-white/10 border border-white/10 px-3 py-1 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white flex flex-col gap-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {isProjectOwner ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-[#bdbdbd]">
                  You are the project owner
                </p>

                {requests.filter((r) => r.status === "PENDING").length > 0 ? (
                  <>
                    <h3 className="font-medium text-sm sm:text-base text-[#f36262] mt-2 mb-1">
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
                                  <span className="text-[#f36262]">
                                    {req.sender.trustPoints}
                                  </span>
                                </p>
                              </div>
                              <p className="text-[#bdbdbd] text-xs sm:text-sm break-words">
                                {req.message}
                              </p>
                              <div className="flex flex-wrap gap-2 text-[#f59797] text-xs mt-1">
                                <a
                                  href={req.githubUrl}
                                  target="_blank"
                                  className="hover:underline"
                                >
                                  GitHub
                                </a>
                                <a
                                  href={req.linkedinUrl}
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
                                  project.currentMembers >=
                                    Number(project.maxMembers)
                                }
                                onClick={() =>
                                  updateRequestStatus({
                                    requestId: req.id,
                                    action: "ACCEPTED",
                                  })
                                }
                                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition ${
                                  project.currentMembers >=
                                  Number(project.maxMembers)
                                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                                    : "bg-green-700 hover:bg-green-600 text-white"
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
                                className="px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer bg-[#b62222b7] hover:bg-[#e24040b7] text-white transition"
                              >
                                {isUpdatingStatus ? "..." : "Reject"}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {project &&
                      project.currentMembers >= Number(project.maxMembers) && (
                        <p className="text-red-400 mt-2 text-xs sm:text-sm font-medium">
                          Project is at maximum capacity!
                        </p>
                      )}
                  </>
                ) : (
                  <p className="text-sm text-[#bdbdbd]">No pending requests</p>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-white/10 p-4 rounded-md">
                {isProjectContributor ? (
                  <p className="text-green-400 font-semibold">
                    You are already a project member
                  </p>
                ) : hasPendingRequest ? (
                  <p className="text-yellow-400 font-semibold">
                    ⏳ Waiting for approval
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-xl font-semibold">Want to join?</p>

                    <div className="mt-6">
                      <motion.button
                        type="submit"
                        disabled={isJoining}
                        onClick={() => setIsJoinModalOpen(true)}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full rounded-xl px-8 py-2 font-medium shadow-md transition-all cursor-pointer
                    ${
                      isJoining
                        ? "bg-[#f36262b7]/70 cursor-not-allowed opacity-60"
                        : "bg-[#f36262b7] hover:bg-[#fc8e8eb7]"
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
                              <span>Sending contribution request...</span>
                            </motion.div>
                          ) : (
                            <motion.span
                              key="text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Join Project
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>

                    {/* <motion.button
                      disabled={isJoining}
                      onClick={() => setIsJoinModalOpen(true)}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-xl bg-[#f36262b7] px-8 py-2 font-medium hover:bg-[#fc8e8eb7] transition-all"
                    >
                      {isJoining ? "Sending contribution request..." : "Join Project"}
                    </motion.button> */}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2 text-sm mt-4">
              <h2 className="font-semibold text-lg">Contact</h2>
              <p>📞 {project.contactPhone || "N/A"}</p>
              <p>📧 {project.contactEmail || "N/A"}</p>
            </div>
          </motion.div>

          {isProjectOwner && (
            <motion.div
              className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-xl font-bold mb-4">Project Actions</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full bg-green-700 hover:bg-green-600 px-6 py-2 rounded-lg font-medium cursor-pointer"
                >
                  Complete Project
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-800 hover:bg-red-700 px-6 py-2 rounded-lg font-medium cursor-pointer"
                >
                  Cancel Project
                </button>
              </div>

              <p className="text-xs text-[#bdbdbd] mt-3">
                Completing a project will award trust points to members.
                Cancelling will permanently close the project.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <ConfirmProjectActionModal
        open={showCompleteModal}
        title="Complete Project?"
        description="This will mark the project as completed and award trust points to members. This action cannot be undone."
        confirmText="Yes, Complete"
        confirmColor="green"
        loading={actionLoading}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleCompleteTeam}
      />
      <ConfirmProjectActionModal
        open={showCancelModal}
        title="Cancel Project?"
        description="This action cannot be undone."
        confirmText="Yes, Cancel"
        confirmColor="red"
        loading={actionLoading}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelTeam}
      />
      <JoinTeamModal
        open={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        type="project"
        onSubmit={(data) => {
          sendJoinRequest(data);
          setIsJoinModalOpen(false);
        }}
      />
    </>
  );
}
