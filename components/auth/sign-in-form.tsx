"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SigninForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/";

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return toast.error("Please fill all the fields!");
    }

    await authClient.signIn.email(
      { email, password },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: (ctx) => {
          toast.success("Sign in successful!");

          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          const user = ctx.data.user;

          if (user.email === adminEmail) {
            router.replace("/admin");
            return;
          }

          if (returnTo && returnTo !== "/") {
            router.replace(returnTo);
          } else {
            router.replace("/main/hacks-teamup");
          }
        },
      }
    );
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5 text-white">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-xs uppercase tracking-wide text-gray-300 font-medium"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            className="bg-[#0f13198e] rounded-md py-2 px-3 text-sm placeholder-gray-500
                        focus:outline-none focus:ring-1 focus:ring-[#06a8a8cc] focus:border-transparent transition-all duration-300 border border-white/15"
          />
        </div>

        <div className="flex flex-col gap-1 relative">
          <label
            htmlFor="password"
            className="text-xs uppercase tracking-wide text-gray-300 font-medium"
          >
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="••••••••"
            className="bg-[#0f13198e] rounded-md py-2 px-3 text-sm placeholder-gray-500
                        focus:outline-none focus:ring-1 focus:ring-[#06a8a8cc] focus:border-transparent transition-all duration-300 pr-10 border border-white/15"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[30px] text-gray-400 hover:text-white transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <div className="text-right pr-2">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[#2ee0cf] hover:text-[#69f3de] transition-colors duration-200 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="auth-form-main-btn text-white rounded-lg py-2 px-5 font-medium transition-all duration-300
                    cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(68,156,141,0.6)] active:scale-95"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}
