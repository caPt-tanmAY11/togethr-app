import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { slugify } from "./utils";
import { sendEmail } from "./send-email";
import { resetPasswordEmail } from "@/components/reset-password";
import { verifyEmailTemplate } from "./email-templates/verify-email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            slug: {
                type: "string",
                required: false,
                input: false
            },
            onboardingStatus: {
                type: "string",
                required: false,
                input: false,
                defaultValue: "NOT_STARTED",
            },
            trustPoints: {
                type: "number",
                input: false,
                defaultValue: 0,
                required: false
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            if (!user?.email) {
                console.error("No email found for reset password");
                return;
            }

            try {
                await sendEmail({
                    to: user.email,
                    subject: "Reset your password",
                    html: resetPasswordEmail(url),
                });
                console.log("Reset password email sent to:", user.email);
            } catch (err) {
                console.error("Failed to send reset password email:", err);
            }
        },
        onPasswordReset: async ({ user }, request) => {
            console.log(`Password for user ${user.email} has been reset.`);
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            void sendEmail({
                to: user.email,
                subject: "Verify your email address",
                html: verifyEmailTemplate(url),
            });
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        }
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    let baseSlug = slugify(user.name);
                    baseSlug = `${baseSlug}_${Math.floor(Math.random() * 1000000)}`
                    let finalSlug = baseSlug;
                    let counter = 1;

                    while (true) {
                        const existing = await prisma.user.findFirst({
                            where: { slug: finalSlug },
                        });

                        if (!existing) break;

                        finalSlug = `${baseSlug}-${counter}`;
                        counter++;
                    }

                    return {
                        data: {
                            ...user,
                            slug: finalSlug,
                        },
                    };
                },
            },
        }
    }
});