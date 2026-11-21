import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Management System Kuliah Universitas A",
  description: "Learning Management System for College Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}