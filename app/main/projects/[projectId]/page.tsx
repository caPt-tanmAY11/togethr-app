"use client";

import ConfirmProjectActionModal from "@/components/confirm-project-action-model";
import JoinTeamModal from "@/components/join-team-modal";
import ProjectMembers from "@/components/project-members-list";
import ProjectDetailsSkeleton from "@/components/skeletons/project-details-skeletons";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  const router = useRouter();

  const [isJoining, setIsJoining] = useState(false);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const isReady = !loading && project !== null;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load project");
        }

        setProject(data.project);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
    return () => controller.abort();
  }, [projectId]);

  const requests = project?.requests || [];

  async function sendJoinRequest(data: {
    message: string;
    githubUrl: string;
    linkedinUrl: string;
  }) {
    if (isJoining) return;

    setIsJoining(true);

    try {
      const res = await fetch(`/api/projects-requests/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!resData.success) {
        toast.error(resData.error || "Failed to send join request");
        console.error("API Error:", resData.error);
        return;
      }

      toast.success(resData.message || "Request sent successfully!");
      router.replace("/main/projects");

      setProject((prev) => {
        if (!prev || !session?.user) return prev;

        return {
          ...prev,
          Request: [
            ...prev.requests,
            {
              id: resData.request.id,
              status: "PENDING",
              message: data.message,
              type: "JOIN",
              githubURL: data.githubUrl,
              linkedinURL: data.linkedinUrl,
              sender: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email ?? "",
                phone: "",
                image: session.user.image ?? "",
              },
            },
          ],
        };
      });
    } catch (error) {
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
      const res = await fetch(`/api/projects-requests/status/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        const errorMsg = resData.error || "Failed to update request status";
        toast.error(errorMsg);
        console.error("Request update error:", errorMsg);
        return;
      }

      toast.success(
        resData.message || `Request ${action.toLowerCase()} successfully!`
      );

      console.log(resData);

      setProject((prev) => {
        if (!prev) return prev;

        const acceptedRequest = prev.requests.find((r) => r.id === requestId);

        if (!acceptedRequest) return prev;

        return {
          ...prev,

          members:
            action === "ACCEPTED"
              ? [
                  ...prev.members,
                  {
                    role: "CONTRIBUTOR",
                    name: acceptedRequest.sender.name,
                    user: {
                      id: acceptedRequest.sender.id,
                      name: acceptedRequest.sender.name,
                      image: acceptedRequest.sender.image ?? null,
                      slug: acceptedRequest.sender.slug,
                    },
                  },
                ]
              : prev.members,

          requests: prev.requests.map((r) =>
            r.id === requestId ? { ...r, status: action } : r
          ),
        };
      });
    } catch (error) {
      console.error("[HANDLE_REQUEST_ACTION_ERROR]", error);
      toast.error("Something went wrong while updating the request!");
    }
  }

  if (!isReady) {
    return <ProjectDetailsSkeleton />;
  }

  async function handleCompleteTeam() {
    try {
      setActionLoading(true);

      const res = await fetch(`/api/projects/${project?.id}/complete`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to complete team");
        return;
      }

      toast.success("Project marked as completed 🎉");

      setProject((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      setShowCompleteModal(false);
      router.replace("/main/projects");
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

      const res = await fetch(`/api/projects/${project?.id}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to cancel team");
        return;
      }

      toast.success("Project cancelled");

      router.replace("/main/projects");
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

  const currentUserId = session?.user?.id;

  const isProjectOwner = currentUserId === project?.owner.id;

  const isProjectContributor = project?.members.some(
    (member) => member.user.id === currentUserId
  );

  const userJoinRequest = project?.requests.find(
    (req) => req.sender.id === currentUserId
  );

  const hasPendingRequest = userJoinRequest?.status === "PENDING";

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
              <div>
                <h2 className="text-lg font-semibold">
                  Contributors:{" "}
                  <span
                    className="text-[#f36262] font-semibold border border-white/20 
              bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full"
                  >
                    {project?.currentMembers}
                  </span>
                </h2>
              </div>

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

              {/* <p className="text-sm">
              Team Size:{" "}
              <span className="text-[#4ff1f1]">{project.maxMembers}</span>
            </p> */}

              <div>
                <p className="text-[#a5a5a5] font-medium whitespace-pre-line">
                  {project.detailedDesc}
                </p>
              </div>

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
                <p className="text-sm text-[#bdbdbd]">
                  You are the project owner
                </p>

                {requests.filter((r) => r.status === "PENDING").length > 0 ? (
                  <>
                    <h3 className="font-medium text-[#f36262] mt-2 mb-1">
                      Pending Requests
                    </h3>
                    <div className="flex flex-col gap-3">
                      {project?.requests
                        .filter((r) => r.status === "PENDING")
                        .map((req) => (
                          <div
                            key={req.id}
                            className="border border-white/20 rounded-lg px-4 py-3 flex justify-between items-start gap-4 hover:bg-white/5 transition"
                          >
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex gap-5 items-center justify-center">
                                <p
                                  className="text-white cursor-pointer"
                                  onClick={() =>
                                    router.push(
                                      `/main/profile/${req.sender.slug}`
                                    )
                                  }
                                >
                                  <strong>{req.sender.name}</strong> wants to
                                  join
                                </p>
                                <p
                                  className="rounded-lg border border-white/20 
              bg-white/10 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md 
              hover:bg-white/20 transition mb-4"
                                >
                                  Trust Score:{" "}
                                  <span className="text-[#f36262]">
                                    {req.sender.trustPoints}
                                  </span>
                                </p>
                              </div>

                              <p className="text-[#bdbdbd]">{req.message}</p>
                              <div className="flex gap-4 text-[#f59797] text-xs mt-1">
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

                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  handleRequestAction(req.id, "ACCEPTED")
                                }
                                className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer bg-green-700 hover:bg-green-600`}
                              >
                                Accept
                              </button>

                              <button
                                onClick={() =>
                                  handleRequestAction(req.id, "REJECTED")
                                }
                                className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer bg-[#b62222b7] hover:bg-[#e24040b7]`}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#bdbdbd]">No pending requests</p>
                )}

                {requests.filter((r) => r.status === "ACCEPTED").length > 0 && (
                  <>
                    <h3 className="font-medium text-[#f36262] mt-4 mb-1">
                      Accepted Members
                    </h3>
                    <div className="flex flex-col gap-2">
                      {project?.requests
                        .filter((r) => r.status === "ACCEPTED")
                        .map((req) => (
                          <div
                            key={req.id}
                            className="border-b border-white/20 px-4 py-2"
                          >
                            <p>
                              <strong>{req.sender.name}</strong> has joined
                            </p>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-white/10 p-4 rounded-md">
                {isProjectContributor ? (
                  <p className="text-green-400 font-semibold">
                    You are already a team member
                  </p>
                ) : hasPendingRequest ? (
                  <p className="text-yellow-400 font-semibold">
                    ⏳ Waiting for approval
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      <p className="text-sm sm:text-xl font-semibold text-left">
                        Want to join the project?
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
                        ? "bg-[#c93a3ab7] cursor-not-allowed"
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
                                <span>Sending join request</span>
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
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm mt-4">
              <h2 className="font-semibold text-lg">Contact</h2>
              {project.contactPhone ? <p>📞 {project.contactPhone}</p> : ""}
              {project.contactEmail ? <p>📧 {project.contactEmail}</p> : ""}
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
                  className="w-full bg-green-700 hover:bg-green-600 px-6 py-2 rounded-lg font-medium transition-all shadow-md cursor-pointer"
                >
                  Mark Project as Completed
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-[#b62222b7] hover:bg-[#e24040b7] px-6 py-2 rounded-lg font-medium transition-all shadow-md cursor-pointer"
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
        description="This will permanently cancel the project. Members will not receive trust points."
        confirmText="Yes, Cancel Project"
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
          const payload = {
            message: data.message,
            githubUrl: data.githubUrl,
            linkedinUrl: data.linkedinUrl,
          };

          sendJoinRequest(payload);

          setIsJoinModalOpen(false);
        }}
      />
    </>
  );
}
