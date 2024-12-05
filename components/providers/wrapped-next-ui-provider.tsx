// app/providers.tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";

export function WrappedNextUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextUIProvider className="h-full w-full">
      <ThemeProvider attribute="class">
        <div className="h-full w-full light:bg-white dark:bg-black">
          {children}
        </div>
      </ThemeProvider>
    </NextUIProvider>
  );
}
