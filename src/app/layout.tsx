import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Attendance Management System",
  description: "Role-based school attendance management for admins, teachers, and students."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
