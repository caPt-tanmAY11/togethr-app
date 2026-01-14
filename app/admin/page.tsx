"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FolderGit2,
  Code2,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
} from "lucide-react";

// Reusable stat card
function StatCard({
  title,
  value,
  icon,
  color = "text-white",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-sm hover:shadow-lg transition">
      <div className={`p-3 rounded-xl bg-white/10 ${color}`}>{icon}</div>
      <div>
        <div className="text-xs text-white/60">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

// Small badge for status
function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {text}
    </span>
  );
}

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return <div className="text-white/60">Loading overview...</div>;
  }

  const {
    users,
    hackTeams,
    projects,
    engagement,
    requests,
  } = data;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Overview</h1>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.total}
          icon={<Users size={32} />}
          color="text-cyan-400"
        />
        <StatCard
          title="Hack Teams"
          value={hackTeams.total}
          icon={<FolderGit2 size={32} />}
          color="text-green-400"
        />
        <StatCard
          title="Projects"
          value={projects.total}
          icon={<Code2 size={32} />}
          color="text-yellow-400"
        />
        <StatCard
          title="Feedbacks"
          value={engagement.feedbacks}
          icon={<MessageSquare size={32} />}
          color="text-pink-400"
        />
      </div>

      {/* User & Engagement Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
          <h2 className="text-lg font-semibold">User Insights</h2>
          <div className="flex justify-between items-center">
            <div>Verified Users</div>
            <Badge text={`${users.verified}`} color="bg-green-500/20 text-green-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Onboarding Completed</div>
            <Badge text={`${users.onboardingCompleted}`} color="bg-blue-500/20 text-blue-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>New Users (7 days)</div>
            <Badge text={`${users.newLast7Days}`} color="bg-white/20 text-white/60" />
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
          <h2 className="text-lg font-semibold">Pending Requests</h2>
          <div className="flex justify-between items-center">
            <div>Hack Team Requests</div>
            <Badge text={`${requests.pendingHackTeamRequests}`} color="bg-yellow-500/20 text-yellow-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Project Requests</div>
            <Badge text={`${requests.pendingProjectRequests}`} color="bg-yellow-500/20 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Hack Teams Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
          <h2 className="text-lg font-semibold">Hack Teams Overview</h2>
          <div className="flex justify-between items-center">
            <div>Total Teams</div>
            <Badge text={`${hackTeams.total}`} color="bg-white/20 text-white/60" />
          </div>
          <div className="flex justify-between items-center">
            <div>Open</div>
            <Badge text={`${hackTeams.open}`} color="bg-green-500/20 text-green-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Completed</div>
            <Badge text={`${hackTeams.completed}`} color="bg-blue-500/20 text-blue-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Cancelled</div>
            <Badge text={`${hackTeams.cancelled}`} color="bg-red-500/20 text-red-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Total Members</div>
            <Badge text={`${hackTeams.totalMembers}`} color="bg-white/20 text-white/60" />
          </div>
        </div>

        {/* Projects Stats */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
          <h2 className="text-lg font-semibold">Projects Overview</h2>
          <div className="flex justify-between items-center">
            <div>Total Projects</div>
            <Badge text={`${projects.total}`} color="bg-white/20 text-white/60" />
          </div>
          <div className="flex justify-between items-center">
            <div>Open</div>
            <Badge text={`${projects.open}`} color="bg-green-500/20 text-green-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Completed</div>
            <Badge text={`${projects.completed}`} color="bg-blue-500/20 text-blue-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Cancelled</div>
            <Badge text={`${projects.cancelled}`} color="bg-red-500/20 text-red-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Total Members</div>
            <Badge text={`${projects.totalMembers}`} color="bg-white/20 text-white/60" />
          </div>
        </div>
      </div>

      {/* Feedback & Contact Queries */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
          <h2 className="text-lg font-semibold">Engagement</h2>
          <div className="flex justify-between items-center">
            <div>Total Feedbacks</div>
            <Badge text={`${engagement.feedbacks}`} color="bg-white/20 text-white/60" />
          </div>
          <div className="flex justify-between items-center">
            <div>Average Rating</div>
            <Badge text={`${engagement.averageRating.toFixed(1)}`} color="bg-cyan-500/20 text-cyan-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>Contact Queries</div>
            <Badge text={`${engagement.contactQueries}`} color="bg-white/20 text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
