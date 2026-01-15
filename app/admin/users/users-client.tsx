"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

type Meta = {
  page: number;
  totalPages: number;
};

async function getUsers(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
  });

  if (search) params.set("search", search);

  const res = await fetch(`/api/admin/users?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch users");

  return res.json();
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    getUsers(page, search)
      .then((res) => {
        if (!ignore) {
          setUsers(res.data.users);
          setMeta(res.data.meta);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, search]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = String(formData.get("search") || "");

    router.push(`/admin/users?search=${value}`);
  }

  if (loading) {
    return <p className="text-white/60">Loading users...</p>;
  }

  if (!meta) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-white/60 mt-1">
          All registered users on the platform
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
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
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-6 py-4">
                  <div className="font-medium">{user.name}</div>
                  {user.headline && (
                    <div className="text-xs text-white/50 mt-0.5">
                      {user.headline}
                    </div>
                  )}
                </td>

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

                <td className="px-6 py-4 text-white/80">{user.trustPoints}</td>

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

      <div className="flex justify-between items-center">
        <p className="text-sm text-white/50">
          Page {meta.page} of {meta.totalPages}
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <button
              onClick={() =>
                router.push(`/admin/users?page=${page - 1}&search=${search}`)
              }
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Previous
            </button>
          )}

          {page < meta.totalPages && (
            <button
              onClick={() =>
                router.push(`/admin/users?page=${page + 1}&search=${search}`)
              }
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
