"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      themes={["dark", "light", "read"]}
      defaultTheme="dark"
      enableSystem={false}
      attribute="class"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
