type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone?: string | null;
  headline?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  skills: string[];
  trustPoints: number;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
};

async function getUsers(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
  });

  if (search) params.set("search", search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch users");

  return res.json();
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const response = await getUsers(page, search);
  const { users, meta } = response.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-white/60 mt-1">
          All registered users on the platform
        </p>
      </div>

      {/* Search */}
      <form className="flex gap-3 max-w-md">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Trust</th>
              <th className="px-6 py-4 text-left">Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user: User) => (
              <tr
                key={user.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {/* Name + headline */}
                <td className="px-6 py-4">
                  <div className="font-medium">
                    {user.name}
                  </div>
                  {user.headline && (
                    <div className="text-xs text-white/50 mt-0.5">
                      {user.headline}
                    </div>
                  )}
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-white/70">
                  <div>{user.email}</div>
                  <div className="text-xs mt-1">
                    {user.emailVerified ? (
                      <span className="text-green-400">Verified</span>
                    ) : (
                      <span className="text-red-400">Not verified</span>
                    )}
                  </div>
                </td>

                {/* Onboarding */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        user.onboardingStatus === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : user.onboardingStatus === "IN_PROGRESS"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-white/10 text-white/60"
                      }
                    `}
                  >
                    {user.onboardingStatus.replace("_", " ")}
                  </span>
                </td>

                {/* Trust Points */}
                <td className="px-6 py-4 text-white/80">
                  {user.trustPoints}
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-white/60">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-white/50"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-white/50">
          Page {meta.page} of {meta.totalPages}
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <a
              href={`/admin/users?page=${page - 1}&search=${search}`}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Previous
            </a>
          )}

          {page < meta.totalPages && (
            <a
              href={`/admin/users?page=${page + 1}&search=${search}`}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
