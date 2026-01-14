import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        min-h-screen
        auth-bg
        flex
        items-start
        sm:items-center
        justify-center
        px-4
        py-8
        sm:py-12
      "
    >
      {children}
    </div>
  );
}
