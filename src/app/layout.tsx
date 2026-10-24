import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Academics - Complaint Registration & Grievance Portal",
  description: "Official complaint registration and management system for IT Academics, powered by Firebase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased`}>
        <AuthProvider>
          <main className="flex-grow flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
