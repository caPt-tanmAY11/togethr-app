type Query = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

async function getQueries(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
  });

  if (search) params.set("search", search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/queries?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch queries");

  return res.json();
}

export default async function QueriesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const response = await getQueries(page, search);
  const { queries, meta } = response.data;

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
      <form className="flex gap-3 max-w-md">
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
            {queries.map((q: Query) => (
              <tr
                key={q.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-6 py-4 font-medium">
                  {q.name}
                </td>

                <td className="px-6 py-4 text-white/70">
                  {q.email}
                </td>

                <td className="px-6 py-4 max-w-md">
                  <p className="line-clamp-3 text-white/80">
                    {q.message}
                  </p>
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
            <a
              href={`/admin/queries?page=${page - 1}&search=${search}`}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Previous
            </a>
          )}

          {page < meta.totalPages && (
            <a
              href={`/admin/queries?page=${page + 1}&search=${search}`}
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
