"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAvatar } from "./use-avatar";

type User = {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  headline: string | null;
};

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    if (!debouncedQuery) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${debouncedQuery}`);
        const data = await res.json();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
      <div className="relative w-[90vw] sm:w-[70vw] max-w-xl sm:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
        <div
          className={`
        relative
        rounded-2xl
        bg-white/10
        backdrop-blur-xl
        border border-white/15
        transition
        ${
          pathname.startsWith("/main/projects")
            ? "focus-within:border-[#fd51517a] focus-within:shadow-[0_0_80px_rgba(255,0,0,0.18)]"
            : "focus-within:border-teal-400/40 focus-within:shadow-[0_0_60px_rgba(79,241,241,0.18)]"
        }
      `}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
            size={18}
          />

          <input
            type="text"
            placeholder="Search students, developers, designers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none"
          />
        </div>

        {(loading || users.length > 0) && (
          <div
            className="
          absolute mt-3 left-0 w-full
          rounded-2xl
          bg-black/50
          backdrop-blur-2xl
          border border-white/10
          shadow-xl
          overflow-hidden
          max-h-[60vh] overflow-y-auto
        "
          >
            {loading && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-white/60">
                <Loader2 className="animate-spin" size={16} />
                Searching…
              </div>
            )}

            {!loading &&
              users.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/main/profile/${user.slug}`}
                  onClick={() => {
                    setQuery("");
                    setUsers([]);
                  }}
                  className={`
        flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition
        ${index !== users.length - 1 ? "border-b border-white/10" : ""}
      `}
                >
                  <UserAvatar
                    image={user.image}
                    className="rounded-full h-10 w-10 shrink-0"
                    name={user.name}
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    {user.headline && (
                      <p className="text-xs text-white/50 truncate">
                        {user.headline}
                      </p>
                    )}
                  </div>
                </Link>
              ))}

            {!loading && users.length === 0 && debouncedQuery && (
              <div className="px-4 py-4 text-sm text-white/50 text-center">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
