import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WrappedNextUIProvider } from "../components/providers/wrapped-next-ui-provider";
import EditorContextProvider from "@/components/providers/editor-context-provider";
import { Toaster } from "react-hot-toast";
import "material-icons/iconfont/material-icons.css";
import CapacitorProvider from "@/components/providers/capacitor-provider";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "Pulse Editor",
  description: "AI powered editor to boost your creativity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`h-screen w-screen antialiased`}
      >
        <CapacitorProvider>
          <WrappedNextUIProvider>
            <EditorContextProvider>
              <Toaster />
              <Nav>{children}</Nav>
            </EditorContextProvider>
          </WrappedNextUIProvider>
        </CapacitorProvider>
      </body>
    </html>
  );
}
