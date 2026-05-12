import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DayPilot — Your Daily Briefing",
  description: "Gmail, Calendar, and Drive in one glanceable view. Built on Leash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-full bg-zinc-50 text-zinc-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
