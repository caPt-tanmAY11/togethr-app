"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Project = {
  id: string;
  title: string;
  shortDesc: string;
  projectStatus: "OPEN" | "COMPLETED" | "CANCELLED";
  stage: "IDEA" | "BUILDING" | "MVP" | "LIVE";
  isOpen: boolean;
  createdAt: string;
  owner: { name: string };
  _count: { members: number; requests: number };
};

type ProjectRequest = {
  id: string;
  type: "JOIN" | "INVITE";
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  sender: { name: string; email: string };
  receiver: { name: string; email: string };
  project: { title: string };
};

type Meta = {
  page: number;
  totalPages: number;
};

/* ---------------- DATA FETCHERS ---------------- */

async function getProjects(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: "8",
  });
  if (search) params.set("search", search);

  const res = await fetch(`/api/admin/projects?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function getProjectRequests(page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "8",
  });

  const res = await fetch(`/api/admin/projects-reqs?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch project requests");
  return res.json();
}

/* ---------------- PAGE ---------------- */

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab") || "projects";
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [projectMeta, setProjectMeta] = useState<Meta | null>(null);
  const [requestMeta, setRequestMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const fetchData = async () => {
      try {
        if (tab === "projects") {
          const res = await getProjects(page, search);
          if (!ignore) {
            setProjects(res.data.projects);
            setProjectMeta(res.data.meta);
          }
        } else {
          const res = await getProjectRequests(page);
          if (!ignore) {
            setRequests(res.data.requests);
            setRequestMeta(res.data.meta);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [tab, page, search]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = String(formData.get("search") || "");
    router.push(`/admin/projects?tab=projects&search=${value}`);
  }

  if (loading) {
    return <p className="text-white/60">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="text-white/60 mt-1">
          Manage projects and collaboration requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["projects", "requests"].map((t) => (
          <button
            key={t}
            onClick={() => router.push(`/admin/projects?tab=${t}`)}
            className={`px-4 py-2 rounded-xl text-sm transition
              ${tab === t ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}
          >
            {t === "projects" ? "Projects" : "Project Requests"}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab === "projects" && (
        <form onSubmit={handleSearch} className="max-w-md">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search projects..."
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
          />
        </form>
      )}

      {/* PROJECTS TABLE */}
      {tab === "projects" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{project.title}</div>
                    <div className="text-xs text-white/50">
                      {project.owner.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {project._count.members}
                  </td>

                  <td className="px-6 py-4 text-center">{project.stage}</td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs
                        ${
                          project.projectStatus === "OPEN"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-white/60"
                        }`}
                    >
                      {project.projectStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-white/60 text-center">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-white/50"
                  >
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUESTS TABLE */}
      {tab === "requests" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-6 py-4 font-medium">{r.project.title}</td>

                  <td className="px-6 py-4">{r.sender.name}</td>

                  <td className="px-6 py-4 text-center">{r.type}</td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs
                        ${
                          r.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : r.status === "ACCEPTED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-white/60"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-white/60 text-center">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-white/50"
                  >
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
