"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

import googleIcon from "@/public/google-icon.svg";
import githubIcon from "@/public/github-icon.svg";
import { useSearchParams } from "next/navigation";

interface SignInOauthButtonProps {
    provider: "google" | "github";
    signUp?: boolean;
}

export default function SignInOauthButton({ provider, signUp }: SignInOauthButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo");

    const callbackURL =
        returnTo && returnTo.startsWith("/")
            ? returnTo
            : "/main/hacks-teamup";

    async function handleClick() {
        await authClient.signIn.social({
            provider,
            callbackURL: callbackURL,
            errorCallbackURL: "/auth/login/error",
            fetchOptions: {
                onRequest: () => setIsPending(true),
                onResponse: () => setIsPending(false),
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                }
            },
        });
    }

    const providerName = provider === "google" ? "Google" : "GitHub";
    const providerIcon = provider === "google" ? googleIcon : githubIcon;

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`relative flex items-center justify-center gap-2 w-full overflow-hidden rounded-3xl px-5 py-2 text-sm font-medium text-white transition-all duration-300 cursor-pointer
      ${isPending ? "opacity-60 cursor-not-allowed" : "hover:shadow-[0_0_12px_rgba(123,159,159,0.4)]"}
      bg-[rgba(123,159,159,0.25)] backdrop-blur-md border border-[rgba(255,255,255,0.15)]`}
        >
            <Image
                src={providerIcon}
                alt={`${providerName} logo`}
                width={19}
                height={19}
                className={`transition-transform duration-300 ${isPending ? "scale-90 opacity-80" : ""}`}
            />

            <span className="relative z-10">
                {isPending ? "Loading..." : `Continue with ${providerName}`}
            </span>

            {/* soft hover gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-[rgba(255,255,255,0.1)] to-[rgba(123,159,159,0.2)] opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        </button>
    );
}
