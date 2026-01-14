"use client";

import { useRouter } from "next/navigation";
import { UserAvatar } from "./use-avatar";

interface TeamMember {
  role: "TEAM_LEAD" | "MEMBER";
  name: string; // role-based label (optional, you can remove later)
  user: {
    id: string;
    name: string;
    image: string | null;
    slug: string;
  };
}

interface Props {
  members: TeamMember[];
}

export default function TeamMembers({ members }: Props) {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-2 tracking-wide">
        Members
      </h2>

      <div className="text-sm text-[#e5e5e5] bg-white/10 rounded-md overflow-hidden">
        {members.map((member, index) => (
          <div
            key={member.user.id}
            onClick={() => router.push(`/main/profile/${member.user.slug}`)}
            className="flex items-center gap-3 border-b border-white/20 
              px-4 py-3 hover:bg-white/12 cursor-pointer
              transition-colors duration-300 ease-in-out"
          >
            {/* Avatar */}
            <UserAvatar
              image={member.user.image}
              name={member.user.name}
              className="h-8 w-8"
            />

            {/* Name + Role */}
            <div className="flex-1">
              <p className="font-medium">{member.user.name}</p>
              {member.role === "TEAM_LEAD" && (
                <p className="text-xs text-white/60">Team Lead</p>
              )}
            </div>

            {/* Chevron */}
            <span className="text-white/40">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
