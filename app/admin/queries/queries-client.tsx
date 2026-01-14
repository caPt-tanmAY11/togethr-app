"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Query = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type Meta = {
  page: number;
  totalPages: number;
};

async function getQueries(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
  });

  if (search) params.set("search", search);

  const res = await fetch(`/api/admin/queries?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch queries");

  return res.json();
}

export default function QueriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [queries, setQueries] = useState<Query[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    getQueries(page, search)
      .then((res) => {
        if (!ignore) {
          setQueries(res.data.queries);
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

    router.push(`/admin/queries?search=${value}`);
  }

  if (loading) {
    return <p className="text-white/60">Loading queries...</p>;
  }

  if (!meta) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Contact Queries
        </h1>
        <p className="text-white/60 mt-1">
          Messages submitted through the contact form
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name, email or message..."
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
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Message</th>
              <th className="px-6 py-4 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {queries.map((q) => (
              <tr
                key={q.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-6 py-4 font-medium">{q.name}</td>

                <td className="px-6 py-4 text-white/70">{q.email}</td>

                <td className="px-6 py-4 max-w-md">
                  <p className="line-clamp-3 text-white/80">{q.message}</p>
                </td>

                <td className="px-6 py-4 text-white/60">
                  {new Date(q.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {queries.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-white/50"
                >
                  No queries found
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
            <button
              onClick={() =>
                router.push(`/admin/queries?page=${page - 1}&search=${search}`)
              }
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Previous
            </button>
          )}

          {page < meta.totalPages && (
            <button
              onClick={() =>
                router.push(`/admin/queries?page=${page + 1}&search=${search}`)
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
