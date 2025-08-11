import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy Tech ERP",
  description: "A modern Enterprise Resource Planning (ERP) System.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:image" content="/og-image.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Suspense
          fallback={
            <div className="flex items-center w-full justify-center min-h-screen text-sm">
              Loading data, please stand by
            </div>
          }
        >
          <SessionProvider>{children}</SessionProvider>

          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
