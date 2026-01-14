"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type HackTeam = {
  teamId: string;
  name: string;
  hackName: string;
  teamStatus: "OPEN" | "CANCELLED" | "COMPLETED";
  size: number;
  spotsLeft: number;
  hackMode: "VIRTUAL" | "INPERSON" | "HYBRID";
  hackLocation: string;
  createdByName: string;
  createdAt: string;
};

type HackTeamRequest = {
  id: string;
  type: "JOIN" | "INVITE";
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  sender: { name: string; email: string };
  receiver: { name: string; email: string };
  hackTeam: { name: string; hackName: string };
};

export default function HackTeamsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = searchParams.get("tab") || "teams";
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [teams, setTeams] = useState<HackTeam[]>([]);
  const [requests, setRequests] = useState<HackTeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    async function fetchData() {
      try {
        if (tab === "teams") {
          const params = new URLSearchParams({
            page: String(page),
            limit: "8",
            search,
          });

          const res = await fetch(`/api/admin/hack-teams?${params}`);
          const json = await res.json();
          setTeams(json.data.hackTeams);
        }

        if (tab === "requests") {
          const params = new URLSearchParams({
            page: String(page),
            limit: "8",
          });

          const res = await fetch(`/api/admin/hack-teams-reqs?${params}`);
          const json = await res.json();
          setRequests(json.data.requests);
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tab, page, search]);

  function changeTab(t: string) {
    router.push(`/admin/hack-teams?tab=${t}`);
  }

  if (loading) {
    return <div className="text-white/60">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Hack Teams</h1>
        <p className="text-white/60 mt-1">
          Manage hack teams and participation requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["teams", "requests"].map((t) => (
          <button
            key={t}
            onClick={() => changeTab(t)}
            className={`px-4 py-2 rounded-xl text-sm transition
              ${tab === t ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}
          >
            {t === "teams" ? "Hack Teams" : "Team Requests"}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      {tab === "teams" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("search");
            router.push(`/admin/hack-teams?tab=teams&search=${value || ""}`);
          }}
          className="max-w-md"
        >
          <input
            name="search"
            defaultValue={search}
            placeholder="Search team or hackathon..."
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none"
          />
        </form>
      )}

      {/* TEAMS TABLE */}
      {tab === "teams" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {teams.map((team) => (
                <tr key={team.teamId} className="border-t border-white/10">
                  <td className="px-6 py-4">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-white/50">
                      {team.hackName} • {team.createdByName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {team.size - team.spotsLeft}/{team.size}
                  </td>
                  <td className="px-6 py-4 text-center">{team.hackMode}</td>
                  <td className="px-6 py-4 text-center">{team.teamStatus}</td>
                  <td className="px-6 py-4 text-center text-white/60">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUESTS TABLE */}
      {tab === "requests" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.hackTeam.name}</div>
                    <div className="text-xs text-white/50">
                      {r.hackTeam.hackName}
                    </div>
                  </td>
                  <td className="px-6 py-4">{r.sender.name}</td>
                  <td className="px-6 py-4 text-center">{r.type}</td>
                  <td className="px-6 py-4 text-center">{r.status}</td>
                  <td className="px-6 py-4 text-center text-white/60">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
