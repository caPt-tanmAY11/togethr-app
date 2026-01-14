"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function resetPasswordAction(token: string, newPassword: string) {
    try {
        await auth.api.resetPassword({
            body: {
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