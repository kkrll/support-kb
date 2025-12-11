import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import QueryProvider from "@/lib/reactQuery";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Support KB",
  description: "Knowledge base editor and playground for support bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <nav className="border-b">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex gap-6 items-center">
                <Link href="/" className="font-semibold hover:underline">
                  Playground
                </Link>
                <Link href="/kb" className="hover:underline">
                  KB Editor
                </Link>
              </div>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </QueryProvider>
  );
}
