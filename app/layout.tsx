import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthLens | Indian market research",
  description: "WealthLens helps investors research Indian companies with market data, valuation metrics, historical performance, and contextual analysis.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "WealthLens",
    description: "See the business behind the stock.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WealthLens",
    description: "See the business behind the stock.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
