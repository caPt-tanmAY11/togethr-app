"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

type Feedback = {
  id: string;
  message: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
};

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [meta, setMeta] = useState<{
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    async function fetchFeedbacks() {
      try {
        const res = await fetch(
          `/api/admin/feedback?page=${page}&limit=${limit}`
        );

        if (!res.ok) throw new Error("Failed to fetch feedbacks");

        const json = await res.json();
        setFeedbacks(json.data.feedbacks);
        setMeta(json.data.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeedbacks();
  }, [page]);

  if (loading) {
    return <div className="text-white/60">Loading feedback...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-white/60 mt-1">
          Review feedback submitted by users and visitors
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Message</th>
              <th className="px-6 py-4 text-left">Rating</th>
              <th className="px-6 py-4 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {feedbacks.map((fb) => (
              <tr
                key={fb.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {/* User */}
                <td className="px-6 py-4">
                  {fb.user ? (
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{fb.user.name}</p>
                        <p className="text-xs text-white/50">{fb.user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-white/40 italic">Anonymous</span>
                  )}
                </td>

                {/* Message */}
                <td className="px-6 py-4 max-w-md">
                  <p className="line-clamp-3 text-white/80">{fb.message}</p>
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < fb.rating ? "text-yellow-400" : "text-white/20"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-white/60">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {feedbacks.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-white/50"
                >
                  No feedback found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-white/50">
            Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => router.push(`/admin/feedback?page=${page - 1}`)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Previous
              </button>
            )}

            {page < meta.totalPages && (
              <button
                onClick={() => router.push(`/admin/feedback?page=${page + 1}`)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
