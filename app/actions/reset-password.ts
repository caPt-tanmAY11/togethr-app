"use server";

import { auth } from "@/lib/auth"; // Your server-side better-auth instance
import { headers } from "next/headers";

export async function resetPasswordAction(token: string, newPassword: string) {
    try {
        // We use the server-side 'auth' instance directly
        await auth.api.resetPassword({
            body: {
                // Better Auth server API usually expects the raw token 
                // but if it fails, we can try prepending here.
                token: token, 
                newPassword: newPassword,
            },
            headers: await headers(),
        });

        return { success: true };
    } catch (error: any) {
        console.error("Server Reset Error:", error);
        return { 
            success: false, 
            message: error.message || "Failed to reset password" 
        };
    }
}