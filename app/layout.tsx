import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { FeedbackProvider } from "@/components/feeback/feedback-context";
import FeedbackModal from "@/components/feeback/feedback-modal";
import Providers from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "togethr | Find Teammates. Build Together.",
    template: "%s | togethr",
  },
  description:
    "togethr is a platform for students and developers to find trusted hackathon teammates, collaborate on real projects, and build meaningful things together.",
  keywords: [
    "hackathon teams",
    "developer collaboration",
    "student developers",
    "project collaboration",
    "find teammates",
    "hackathons",
    "full stack projects",
    "developer community",
  ],
  authors: [{ name: "Tanmay Vishwakarma" }],
  creator: "Tanmay Vishwakarma",
  metadataBase: new URL("https://togethr-psi.vercel.app"),

  openGraph: {
    title: "togethr | Find Teammates. Build Together.",
    description:
      "Form trusted hackathon teams, collaborate on real projects, and connect with serious builders on togethr.",
    url: "https://togethr-psi.vercel.app",
    siteName: "togethr",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "togethr - Build together with the right people",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "togethr | Find Teammates. Build Together.",
    description:
      "A platform for students and developers to form trusted teams and collaborate on real projects.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#000000" }}>
      <body
        className={`
          ${poppins.variable}
          ${inter.variable}
          antialiased
          flex
          flex-col
          min-h-dvh 
          bg-black 
          text-white
          overflow-x-hidden
        `}
      >
        <FeedbackProvider>
          <main className="flex-1 w-full flex flex-col relative pb-[env(safe-area-inset-bottom)]">
            <div className="w-full flex-1">
              <Providers>{children}</Providers>
            </div>
            <FeedbackModal />
          </main>
        </FeedbackProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
