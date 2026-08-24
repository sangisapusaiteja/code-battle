import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/ThemeProvider";
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-black text-neutral-100 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
