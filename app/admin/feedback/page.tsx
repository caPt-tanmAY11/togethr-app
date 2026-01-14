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

async function getFeedbacks(page = 1, limit = 10) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/feedback?page=${page}&limit=${limit}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch feedbacks");

  return res.json();
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;

  const response = await getFeedbacks(page);
  const { feedbacks, meta } = response.data;

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
            {feedbacks.map((fb: Feedback) => (
              <tr
                key={fb.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {/* User */}
                <td className="px-6 py-4">
                  {fb.user ? (
                    <div className="flex items-center gap-3">
                      <Image
                        src={fb.user.image || "/avatar.png"}
                        alt={fb.user.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">{fb.user.name}</p>
                        <p className="text-xs text-white/50">
                          {fb.user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-white/40 italic">
                      Anonymous
                    </span>
                  )}
                </td>

                {/* Message */}
                <td className="px-6 py-4 max-w-md">
                  <p className="line-clamp-3 text-white/80">
                    {fb.message}
                  </p>
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < fb.rating
                            ? "text-yellow-400"
                            : "text-white/20"
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-white/50">
          Page {meta.page} of {meta.totalPages}
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <a
              href={`/admin/feedback?page=${page - 1}`}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Previous
            </a>
          )}

          {page < meta.totalPages && (
            <a
              href={`/admin/feedback?page=${page + 1}`}
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
