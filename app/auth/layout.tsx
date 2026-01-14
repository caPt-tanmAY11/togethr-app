import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex justify-center items-center auth-bg">
            {children}
        </div>
    )
}