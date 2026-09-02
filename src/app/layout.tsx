import type { Metadata } from "next";
import { Oswald, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Granero Dashboard",
  description: "Weekly restaurant stock & operational notice board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${mono.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-lounge-bg text-lounge-text font-body">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
          {children}
        </main>
      </body>
    </html>
  );
}
