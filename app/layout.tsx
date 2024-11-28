import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WrappedNextUIProvider } from "../components/context-providers/theme/wrapped-next-ui-provider";
import MenuStatesContextProvider from "@/components/context-providers/context/menu-states";
import { Toaster } from "react-hot-toast";
import { MenuStates } from "@/lib/interface";
import "material-icons/iconfont/material-icons.css";

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
        <WrappedNextUIProvider>
          <MenuStatesContextProvider defaultMenuStates={menuStates}>
            <Toaster />
            {children}
          </MenuStatesContextProvider>
        </WrappedNextUIProvider>
      </body>
    </html>
  );
}
