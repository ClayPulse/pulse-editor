// app/providers.tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";

export function WrappedHeroUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider className="h-full w-full">
      <ThemeProvider attribute="class">
        <div className="h-full w-full bg-white dark:bg-black">{children}</div>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
