import type { Metadata } from "next";
import "./globals.css";
import { WrappedHeroUIProvider } from "../components/providers/wrapped-hero-ui-provider";
import EditorContextProvider from "@/components/providers/editor-context-provider";
import { Toaster } from "react-hot-toast";
import "material-icons/iconfont/material-icons.css";
import CapacitorProvider from "@/components/providers/capacitor-provider";
import Nav from "@/components/interface/nav";
import RemoteExtensionProvider from "@/components/providers/remote-extension-provider";

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
      <body className={`h-screen w-screen antialiased`}>
        <CapacitorProvider>
          <WrappedHeroUIProvider>
            <EditorContextProvider>
              <RemoteExtensionProvider>
                <Toaster />
                <Nav>{children}</Nav>
              </RemoteExtensionProvider>
            </EditorContextProvider>
          </WrappedHeroUIProvider>
        </CapacitorProvider>
      </body>
    </html>
  );
}
