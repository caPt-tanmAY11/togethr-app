"use client";

import Navbar from "@/components/navbar";
import React from "react";
import { usePathname } from "next/navigation";
import UserSearch from "@/components/search";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const bgColor = pathname.startsWith("/main/projects")
    ? "bg-projects"
    : "bg-main-blurb";

  return (
    <div className="relative min-h-screen w-full bg-[#090a15] overflow-hidden">
      <Navbar />
      <UserSearch />

      {/* Background blur */}
      <div
        className={`
      pointer-events-none
      fixed
      -top-40 sm:-top-52 md:-top-64
      left-1/2 -translate-x-1/2
      w-[90%] sm:w-5/6
      h-40 sm:h-56 md:h-72
      ${bgColor}
      rounded-full
      opacity-100
      blur-[180px] sm:blur-[220px]
    `}
      />

      {/* Page content */}
      <div className="relative z-10 pt-24 sm:pt-28 px-4 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
}
