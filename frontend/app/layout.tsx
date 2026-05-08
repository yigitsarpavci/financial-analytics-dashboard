import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "FinTech Intelligence Platform",
  description: "Educational portfolio project for financial intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
