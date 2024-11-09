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
    <NextUIProvider>
      <ThemeProvider attribute="class">
        {children}
      </ThemeProvider>
    </NextUIProvider>
  );
}
