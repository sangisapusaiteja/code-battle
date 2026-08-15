import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Battle",
  description:
    "Practice coding interviews by competing against real developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0f] text-neutral-100">
        {children}
      </body>
    </html>
  );
}
