import nodemailer from "nodemailer";

interface SendEmailProps {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Tanmayy" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw new Error("Email delivery failed");
    }
}
