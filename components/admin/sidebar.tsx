"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Code2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Hack Teams", href: "/admin/hack-teams", icon: FolderGit2 },
  { name: "Projects", href: "/admin/projects", icon: Code2 },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Queries", href: "/admin/queries", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="p-6 text-xl font-bold tracking-wide">
        Admin Panel
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                ${
                  active
                    ? "bg-[#0e776054] text-[#17aaaa]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon size={20} />
              {name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
