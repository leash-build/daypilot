import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-zinc-50 text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}
