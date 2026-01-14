"use client";

import { authClient } from "@/lib/auth-client";
import { isValidEmail } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupForm() {
  const router = useRouter();

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return toast.error("Please fill all the fields!");
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    await authClient.signUp.email(
      { email, password, name },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Account created successfully!");

          setTimeout(() => {
            toast.info(
              "A verification link has been sent to your email. Please verify your account."
            );
          }, 3000);

          router.push("/auth/signin");
        },
      }
    );
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5 text-white">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-gray-300 font-medium">
            Full name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="
              bg-[#0f13198e]
              rounded-md py-2 px-3 text-sm placeholder-gray-500
              focus:outline-none focus:ring-1
              focus:ring-[#06a8a8cc] focus:border-transparent
              transition-all duration-300 border border-white/15
            "
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-gray-300 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="
              bg-[#0f13198e]
              rounded-md py-2 px-3 text-sm placeholder-gray-500
              focus:outline-none focus:ring-1
              focus:ring-[#06a8a8cc] focus:border-transparent
              transition-all duration-300 border border-white/15
            "
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-gray-300 font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className="
              bg-[#0f13198e]
              rounded-md py-2 px-3 text-sm placeholder-gray-500
              focus:outline-none focus:ring-1
              focus:ring-[#06a8a8cc] focus:border-transparent
              transition-all duration-300 border border-white/15
            "
          />
        </div>

        <button
          type="submit"
          className="
            auth-form-main-btn
            text-white rounded-lg py-2 px-5 font-medium
            transition-all duration-300 cursor-pointer
            hover:scale-[1.03]
            hover:shadow-[0_0_15px_rgba(68,156,141,0.6)]
            active:scale-95
          "
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
