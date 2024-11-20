import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WrappedNextUIProvider } from "../components/context-providers/theme/wrapped-next-ui-provider";
import MenuStatesContextProvider from "@/components/context-providers/context/menu-states";
import { Toaster } from "react-hot-toast";

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
        <WrappedNextUIProvider>
          <Toaster />
          <MenuStatesContextProvider>{children}</MenuStatesContextProvider>
        </WrappedNextUIProvider>
      </body>
    </html>
  );
}
