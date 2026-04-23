import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal Aid Operations Platform",
  description: "Intake, conflict, and referral for civil legal aid.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body><Providers>{children}</Providers></body>
      </html>
    </ClerkProvider>
  );
}
