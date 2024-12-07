import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WrappedNextUIProvider } from "../components/providers/wrapped-next-ui-provider";
import EditorContextProvider from "@/components/providers/editor-context-provider";
import { Toaster } from "react-hot-toast";
import { EditorStates } from "@/lib/types";
import "material-icons/iconfont/material-icons.css";
import CapacitorProvider from "@/components/providers/capacitor-provider";
import Nav from "@/components/nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chisel Editor",
  description: "AI powered editor to boost your creativity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen w-screen antialiased`}
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
