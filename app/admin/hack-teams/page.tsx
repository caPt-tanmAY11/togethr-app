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

async function getHackTeams(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: "8",
  });
  if (search) params.set("search", search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/hack-teams?${params}`,
    { cache: "no-store" }
  );
  return res.json();
}

async function getHackTeamRequests(page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "8",
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/hack-teams-reqs?${params}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function HackTeamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  const tab = resolvedSearchParams.tab || "teams";
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || "";

  const [teamsRes, requestsRes] = await Promise.all([
    getHackTeams(page, search),
    getHackTeamRequests(page),
  ]);

  const teams = teamsRes.data.hackTeams;
  const teamMeta = teamsRes.data.meta;

  const requests = requestsRes.data.requests;
  const requestMeta = requestsRes.data.meta;

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
          <a
            key={t}
            href={`/admin/hack-teams?tab=${t}`}
            className={`px-4 py-2 rounded-xl text-sm transition
              ${tab === t ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}
          >
            {t === "teams" ? "Hack Teams" : "Team Requests"}
          </a>
        ))}
      </div>

      {/* SEARCH */}
      {tab === "teams" && (
        <form className="max-w-md">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search team or hackathon..."
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
          />
        </form>
      )}

      {/* TEAMS TABLE */}
      {tab === "teams" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-6 py-4 text-left">Team</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {teams.map((team: HackTeam) => (
                <tr
                  key={team.teamId}
                  className="border-t border-white/10 hover:bg-white/5"
                >
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

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs
                        ${
                          team.teamStatus === "OPEN"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-white/60"
                        }`}
                    >
                      {team.teamStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-white/60 text-center">
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
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r: HackTeamRequest) => (
                <tr
                  key={r.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.hackTeam.name}</div>
                    <div className="text-xs text-white/50">
                      {r.hackTeam.hackName}
                    </div>
                  </td>

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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
