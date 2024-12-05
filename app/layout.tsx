import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WrappedNextUIProvider } from "../components/providers/wrapped-next-ui-provider";
import MenuStatesContextProvider from "@/components/providers/menu-states-provider";
import { Toaster } from "react-hot-toast";
import { MenuStates } from "@/lib/types";
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
  const menuStates: MenuStates = {
    isDrawing: false,
    isDrawHulls: true,
    isDownloadClip: false,
    isInlineChat: false,
    isOpenChatView: false,
    isRecording: false,
    isListening: false,
    isThinking: false,
    isSpeaking: false,
    isMuted: false,
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen w-screen antialiased`}
      >
        <CapacitorProvider>
          <WrappedNextUIProvider>
            <MenuStatesContextProvider defaultMenuStates={menuStates}>
              <Toaster />
              <Nav>{children}</Nav>
            </MenuStatesContextProvider>
          </WrappedNextUIProvider>
        </CapacitorProvider>
      </body>
    </html>
  );
}
