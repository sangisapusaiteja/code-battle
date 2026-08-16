import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeBattle",
  description: "Real-time competitive coding battles. Challenge developers worldwide.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
