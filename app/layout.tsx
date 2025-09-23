// File: frontend/app/layout.tsx
// This is the complete and corrected version.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import our AuthProvider
import { AuthProvider } from "@/lib/AuthContext";

// This line sets up the font. It should only be here once.
const inter = Inter({ subsets: ["latin"] });

// This is the metadata for your app. It should only be here once.
export const metadata: Metadata = {
  title: "AI Persona Dashboard", // Let's give it a proper title
  description: "Manage your AI Persona Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* This uses the 'inter' variable (lowercase i) correctly */}
      <body className={inter.className}>
        {/* We wrap everything in our AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}