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
        {children}
      </ThemeProvider>
    </NextUIProvider>
  );
}
